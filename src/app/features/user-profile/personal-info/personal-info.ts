import { Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InfoField } from './info-field/info-field';
import { ProfileField } from '../interfaces/profile-info';
import { ProfileStore } from '../profile-store';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../shared/models/api-error';
import { ErrorModal } from '../../../shared/components/error-modal/error-modal';
import { toApiError } from '../../../shared/utils/api-error.util';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { formatShortDate } from '../../../shared/utils/date-format.util';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { MyProfile } from '../interfaces/my-profile';
import { UserService } from '../user.service';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { UpdateProfileRequest } from '../../../core/auth/models';
import { ChangePasswordRequest } from '../../../core/auth/models';
import { PROFILE_PICTURE_PLACEHOLDER } from '../../../shared/constants/placeholder';

/** Mirrors the backend limits enforced by ProfileService. */
const FIRST_NAME_MAX_LENGTH = 100;
const LAST_NAME_MAX_LENGTH = 100;
const PHONE_NUMBER_MAX_LENGTH = 30;

/** Required must also fail on whitespace-only input. */
function notBlank(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { blank: true };
}


interface EditableField {
  key: 'firstName' | 'lastName' | 'email' | 'phoneNumber';
  label: string;
  icon?: string;
  type: string;
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    group.get('confirmPassword')?.setErrors({ mismatch: true });
    return { mismatch: true };
  }

  if (group.get('confirmPassword')?.hasError('mismatch')) {
    group.get('confirmPassword')?.setErrors(null);
  }

  return null;
}

@Component({
  selector: 'app-personal-info',
  imports: [InfoField, ReactiveFormsModule, InputTextModule, ButtonModule, ErrorModal, DatePipe, NgOptimizedImage],
  templateUrl: './personal-info.html',
})
export class PersonalInfo {
  private readonly store = inject(ProfileStore);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly profile = this.store.profileInfo;
  readonly ordersCount = this.store.ordersCount;
  readonly dealsJoinedCount = this.store.dealsJoinedCount;

  /** Mirrors the backend limits enforced by ImageStorageService. */
  static readonly ALLOWED_AVATAR_TYPES = new Set(['image/svg+xml', 'image/png', 'image/jpeg']);
  static readonly AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;

  @ViewChild('fileInput') readonly fileInput!: ElementRef<HTMLInputElement>;

  readonly isEditing = signal(false);
  readonly submitting = signal(false);
  readonly actionError = signal<ApiError | null>(null);
  readonly saved = signal(false);

  readonly avatarUploading = signal(false);
  readonly previewUrl = signal<string | null>(null);
  readonly avatarError = signal<ApiError | null>(null);

  /** Display priority: live preview (uploading) > committed URL from store > fallback. */
  readonly displayAvatarUrl = computed(() => {
    const preview = this.previewUrl();
    if (preview) {
      return preview;
    }
    return resolveImageUrl(this.profile()?.profilePicture, PLACEHOLDER_IMAGE);
  });

  readonly joinedLabel = computed(() => {
    const createdAt = this.profile()?.createdAt;
    return createdAt ? `Joined ${formatShortDate(createdAt)}` : '';
  });

  readonly fields = computed<ProfileField[]>(() => {
    const profile = this.profile();
    if (!profile) {
      return [];
    }
    return [
      { label: 'First Name', value: profile.firstName },
      { label: 'Last Name', value: profile.lastName ?? '' },
      { label: 'Email Address', value: profile.email, icon: 'mail' },
      { label: 'Phone Number', value: profile.phoneNumber ?? '', icon: 'phone_iphone' },
    ];
  });

  readonly form = this.fb.nonNullable.group({
    firstName: [
      '',
      [Validators.required, notBlank, Validators.maxLength(FIRST_NAME_MAX_LENGTH)],
    ],
    lastName: ['', Validators.maxLength(LAST_NAME_MAX_LENGTH)],
    phoneNumber: ['', Validators.maxLength(PHONE_NUMBER_MAX_LENGTH)],
  });

  startEdit(): void {
    const profile = this.profile();
    if (!profile) {
      return;
    }
    this.form.reset({
      firstName: profile.firstName,
      lastName: profile.lastName ?? '',
      phoneNumber: profile.phoneNumber ?? '',
    });
    this.actionError.set(null);
    this.saved.set(false);
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.actionError.set(null);
  }

  closeActionError(): void {
    this.actionError.set(null);
  }

  closeAvatarError(): void {
    this.avatarError.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    if (!PersonalInfo.ALLOWED_AVATAR_TYPES.has(file.type)) {
      this.avatarError.set({
        message: 'Unsupported file type. Use SVG, PNG, or JPG.',
        path: '',
        status: 400,
        timestamp: new Date().toISOString(),
        title: 'Invalid file type',
      });
      return;
    }

    if (file.size > PersonalInfo.AVATAR_MAX_SIZE_BYTES) {
      this.avatarError.set({
        message: 'Image too large. Maximum size is 5MB.',
        path: '',
        status: 400,
        timestamp: new Date().toISOString(),
        title: 'File too large',
      });
      return;
    }

    const previousPreview = this.previewUrl();
    this.previewUrl.set(URL.createObjectURL(file));
    if (previousPreview) {
      URL.revokeObjectURL(previousPreview);
    }

    this.avatarUploading.set(true);
    this.avatarError.set(null);

    this.authService.uploadAvatar(file).subscribe({
      next: (res) => {
        this.store.applyAvatarPath(res.path);
        this.avatarUploading.set(false);
        const preview = this.previewUrl();
        if (preview) {
          URL.revokeObjectURL(preview);
        }
        this.previewUrl.set(null);
      },
      error: (err) => {
        this.avatarUploading.set(false);
        const preview = this.previewUrl();
        if (preview) {
          URL.revokeObjectURL(preview);
        }
        this.previewUrl.set(null);
        this.avatarError.set(toApiError(err));
      },
    });
  }

  isInvalid(name: 'firstName' | 'lastName' | 'phoneNumber'): boolean {
    const control = this.form.controls[name];
    return control.touched && control.invalid;
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    const profile = this.profile();
    if (!profile) {
      return;
    }

    const values = this.form.getRawValue();
    this.submitting.set(true);
    this.saved.set(false);

    this.authService
      .updateProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phoneNumber: values.phoneNumber.trim(),
      })
      .subscribe({
        next: (updated) => {
          this.store.setProfile(updated);
          this.authService.updateStoredUser(updated.firstName, updated.lastName ?? '');
          this.submitting.set(false);
          this.isEditing.set(false);
          this.saved.set(true);
        },
        error: (err) => {
          this.submitting.set(false);
          this.actionError.set(toApiError(err));
        },
      });
  }
}

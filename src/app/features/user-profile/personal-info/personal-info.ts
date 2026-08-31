import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MyProfile } from '../interfaces/my-profile';
import { UserService } from '../user.service';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { UpdateProfileRequest } from '../../../core/auth/models';
import { ChangePasswordRequest } from '../../../core/auth/models';
import { AuthService } from '../../../core/auth/auth.service';
import { PROFILE_PICTURE_PLACEHOLDER } from '../../../shared/constants/placeholder';

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
  imports: [ReactiveFormsModule, DatePipe, ErrorState, NgOptimizedImage],
  templateUrl: './personal-info.html',
})
export class PersonalInfo implements OnInit {
  profile = signal<MyProfile | null>(null);
  userService = inject(UserService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  loading = signal(false);
  saving = signal(false);
  loadError = signal<ApiError | null>(null);
  saveError = signal<ApiError | null>(null);

  changingPassword = signal(false);
  passwordSaveError = signal<ApiError | null>(null);

  PROFILE_PLACEHOLDER = PROFILE_PICTURE_PLACEHOLDER;

  form = this.fb.nonNullable.group({
    firstName: [''],
    lastName: [''],
    phoneNumber: [''],
  });

  passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  fields: EditableField[] = [
    { key: 'firstName', label: 'First Name', type: 'text' },
    { key: 'lastName', label: 'Last Name', type: 'text' },
    { key: 'phoneNumber', label: 'Phone Number', icon: 'phone_iphone', type: 'tel' },
  ];

  ngOnInit() {
    this.loading.set(true);
    this.userService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.resetFormFromProfile(profile);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.loadError.set(toApiError(err));
      },
    });
  }

  save() {
    if (this.form.invalid || this.form.pristine || this.saving()) {
      return;
    }
    const raw = this.form.getRawValue();
    const request: UpdateProfileRequest = {};
    (Object.keys(raw) as (keyof typeof raw)[]).forEach((key) => {
      if (this.form.get(key)?.dirty) {
        request[key] = raw[key];
      }
    });
    if (Object.keys(request).length === 0) {
      return;
    }
    this.saving.set(true);
    this.saveError.set(null);
    this.userService.updateProfile(request).subscribe({
      next: () => {
        this.saving.set(false);
        const current = this.profile();
        if (current) {
          const updated = { ...current, info: { ...current.info, ...request } };
          this.profile.set(updated);
          this.resetFormFromProfile(updated);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(toApiError(err));
      },
    });
  }

  discard() {
    const profile = this.profile();
    if (profile) {
      this.resetFormFromProfile(profile);
    }
  }

  changePassword() {
    if (this.passwordForm.invalid || this.passwordForm.pristine || this.changingPassword()) {
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    const request: ChangePasswordRequest = { currentPassword, newPassword };

    this.changingPassword.set(true);
    this.passwordSaveError.set(null);

    this.authService.changePassword(request).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordForm.reset();
      },
      error: (err) => {
        this.changingPassword.set(false);
        this.passwordSaveError.set(toApiError(err));
      },
    });
  }

  discardPassword() {
    this.passwordForm.reset();
    this.passwordSaveError.set(null);
  }

  private resetFormFromProfile(profile: MyProfile) {
    this.form.reset({
      firstName: profile.info.firstName,
      lastName: profile.info.lastName,
      phoneNumber: profile.info.phoneNumber,
    });
  }
}

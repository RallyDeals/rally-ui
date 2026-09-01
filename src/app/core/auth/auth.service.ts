import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../shared/services/token.service';
import {
  AvatarUploadResponse,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  OtpVerificationResponse,
  RegisterRequest,
  RegisterResponse,
  TokenPairResponse,
  UpdateProfileRequest,
  UserPersonalInfo,
  UserProfile,
  UserSummary,
  VerifyEmailRequest,
} from './models';

/**
 * All requests go through the gateway (:8090), which validates the JWT and
 * injects the X-User-Id header for the protected endpoints (/auth/me,
 * /auth/change-password). The UI never sends identity headers itself.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly apiUrl = `${environment.apiUrl}`;

  readonly currentUser = signal<UserSummary | null>(this.tokenService.readStoredUser());
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly role = computed(() => this.currentUser()?.role ?? null);

  /** POST /auth/login */
  login(request: LoginRequest, rememberMe = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap((res) => this.establishSession(res, rememberMe)),
    );
  }

  /** POST /auth/register -> 201 */
  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, request);
  }

  /** POST /auth/verify-email -> returns a token pair (logs the user in) */
  verifyEmail(request: VerifyEmailRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/verify-email`, request)
      .pipe(tap((res) => this.establishSession(res, true)));
  }

  /** POST /auth/resend-verification-otp -> always 202 (no enumeration) */
  resendVerificationOtp(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/resend-verification-otp`, { email });
  }

  /** POST /auth/forgot-password -> always 202 (no enumeration) */
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  /** POST /auth/verify-email-otp -> checks the OTP without logging in */
  verifyEmailOtp(email: string, otp: string): Observable<OtpVerificationResponse> {
    return this.http.post<OtpVerificationResponse>(`${this.apiUrl}/auth/verify-email-otp`, {
      email,
      otp,
    });
  }

  /** POST /auth/verify-reset-otp -> validates a reset OTP before showing the new-password form */
  verifyResetOtp(email: string, otp: string): Observable<OtpVerificationResponse> {
    return this.http.post<OtpVerificationResponse>(`${this.apiUrl}/auth/verify-reset-otp`, {
      email,
      otp,
    });
  }

  /** POST /auth/reset-password -> 204, revokes all sessions */
  resetPassword(email: string, otp: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/reset-password`, {
      email,
      otp,
      newPassword,
    });
  }

  /** POST /auth/refresh -> rotates both tokens; store BOTH */
  refresh(): Observable<TokenPairResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    const persist = this.tokenService.isPersisted();
    return this.http
      .post<TokenPairResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((res) => this.tokenService.storeTokens(res.accessToken, res.refreshToken, persist)),
      );
  }

  /** POST /auth/logout -> 204, revokes the session server-side */
  logout(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();
    // Fire-and-forget: clear local state even if the server call fails.
    this.http.post<void>(`${this.apiUrl}/auth/logout`, { refreshToken }).subscribe({
      error: () => undefined,
    });
    this.clearSession();
    return new Observable<void>((observer) => {
      observer.next();
      observer.complete();
    });
  }

  /** POST /auth/change-password -> 204, revokes all other sessions */
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/change-password`, request);
  }

  /** GET /auth/me */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/auth/me`);
  }
  /** GET /profile/personal-info.    */
  getPersonalInfo(): Observable<UserPersonalInfo> {
    return this.http.get<UserPersonalInfo>(`${this.apiUrl}/profile/personal-info`);
  }
  /**
   * PATCH /auth/me. Keys left undefined are omitted from the JSON body so the
   * backend's Optional fields keep their current values.
   */
  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    const body: UpdateProfileRequest = {};
    if (request.firstName !== undefined) {
      body.firstName = request.firstName;
    }
    if (request.lastName !== undefined) {
      body.lastName = request.lastName;
    }
    if (request.phoneNumber !== undefined) {
      body.phoneNumber = request.phoneNumber;
    }
    return this.http.patch<UserProfile>(`${this.apiUrl}/auth/me`, body);
  }

  /** POST /auth/me/avatar -> returns the stored image path (/uploads/avatars/...) */
  uploadAvatar(file: File): Observable<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<AvatarUploadResponse>(`${this.apiUrl}/auth/me/avatar`, formData);
  }

  clearSession(): void {
    this.tokenService.clear();
    this.currentUser.set(null);
  }

  /** Keeps the header/sidebar in sync after a profile PATCH (name change). */
  updateStoredUser(firstName: string, lastName: string): void {
    const current = this.currentUser();
    if (!current) {
      return;
    }
    const updated = { ...current, firstName, lastName };
    this.currentUser.set(updated);
    this.tokenService.storeUser(updated, this.tokenService.isPersisted());
  }

  private establishSession(res: LoginResponse, persist: boolean): void {
    this.tokenService.storeTokens(res.accessToken, res.refreshToken, persist);
    this.tokenService.storeUser(res.user, persist);
    this.currentUser.set(res.user);
  }
}

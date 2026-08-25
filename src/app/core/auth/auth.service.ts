import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../shared/services/token.service';
import {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  OtpVerificationResponse,
  RegisterRequest,
  RegisterResponse,
  TokenPairResponse,
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
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<UserSummary | null>(this.tokenService.readStoredUser());
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly role = computed(() => this.currentUser()?.role ?? null);

  /** POST /auth/login */
  login(request: LoginRequest, rememberMe = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((res) => this.establishSession(res, rememberMe)),
    );
  }

  /** POST /auth/register -> 201 */
  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request);
  }

  /** POST /auth/verify-email -> returns a token pair (logs the user in) */
  verifyEmail(request: VerifyEmailRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/verify-email`, request)
      .pipe(tap((res) => this.establishSession(res, true)));
  }

  /** POST /auth/resend-verification-otp -> always 202 (no enumeration) */
  resendVerificationOtp(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/resend-verification-otp`, { email });
  }

  /** POST /auth/forgot-password -> always 202 (no enumeration) */
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, { email });
  }

  /** POST /auth/verify-email-otp -> checks the OTP without logging in */
  verifyEmailOtp(email: string, otp: string): Observable<OtpVerificationResponse> {
    return this.http.post<OtpVerificationResponse>(`${this.apiUrl}/verify-email-otp`, {
      email,
      otp,
    });
  }

  /** POST /auth/verify-reset-otp -> validates a reset OTP before showing the new-password form */
  verifyResetOtp(email: string, otp: string): Observable<OtpVerificationResponse> {
    return this.http.post<OtpVerificationResponse>(`${this.apiUrl}/verify-reset-otp`, {
      email,
      otp,
    });
  }

  /** POST /auth/reset-password -> 204, revokes all sessions */
  resetPassword(email: string, otp: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, {
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
      .post<TokenPairResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap((res) => this.tokenService.storeTokens(res.accessToken, res.refreshToken, persist)),
      );
  }

  /** POST /auth/logout -> 204, revokes the session server-side */
  logout(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();
    // Fire-and-forget: clear local state even if the server call fails.
    this.http.post<void>(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
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
    return this.http.post<void>(`${this.apiUrl}/change-password`, request);
  }

  clearSession(): void {
    this.tokenService.clear();
    this.currentUser.set(null);
  }

  private establishSession(res: LoginResponse, persist: boolean): void {
    this.tokenService.storeTokens(res.accessToken, res.refreshToken, persist);
    this.tokenService.storeUser(res.user, persist);
    this.currentUser.set(res.user);
  }
}

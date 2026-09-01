export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  role: Role;
}

/** Response of POST /auth/login and POST /auth/verify-email */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  user: UserSummary;
}

/** Response of POST /auth/register */
export interface RegisterResponse {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

/** Response of POST /auth/refresh */
export interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: Exclude<Role, 'ADMIN'>;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

/** Response of POST /auth/verify-email-otp and POST /auth/verify-reset-otp */
export interface OtpVerificationResponse {
  valid: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
export interface UserPersonalInfo{
  info: UserProfile,
  dealsJoinedCount:number,
  ordersCount:number,
}

/** GET /auth/me response */
export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  profilePicture: string | null;
  role: Role;
  enabled: boolean;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface AvatarUploadResponse{
  path: string;
}
/**
 * PATCH /auth/me body.
 * Backend uses Optional<T> fields: omit a key to leave it unchanged,
 * send an empty value explicitly to clear it.
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

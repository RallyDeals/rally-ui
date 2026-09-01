import { Role } from '../../../core/auth/models';

export interface ProfileInfo {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture: string | null;
  role: Role;
  createdAt: Date;
}
export interface ProfileField {
  label: string;
  value: string;
  icon?: string;
}

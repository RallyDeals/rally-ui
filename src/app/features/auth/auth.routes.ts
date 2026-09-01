import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { VerifyEmail } from './verify-email/verify-email';
import { ForgotPassword } from './forgot-password/forgot-password';
import { ResetPassword } from './reset-password/reset-password';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: Login,
    title: 'Sign In',
  },
  {
    path: 'register',
    component: Register,
    title: 'Create Account',
  },
  {
    path: 'verify-email',
    component: VerifyEmail,
    title: 'Verify Email',
  },
  {
    path: 'forgot-password',
    component: ForgotPassword,
    title: 'Forgot Password',
  },
  {
    path: 'reset-password',
    component: ResetPassword,
    title: 'Reset Password',
  },
];

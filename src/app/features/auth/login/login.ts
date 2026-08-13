import { Component } from '@angular/core';
import { TxtInput } from '../../../shared/components/txt-input/txt-input';
import { Logo } from '../../../shared/components/logo/logo';
import { PrimaryBtn } from '../../../shared/components/buttons/primary-btn/primary-btn';
import { AuthSwitchLink } from '../auth-switch-link/auth-switch-link';

@Component({
  selector: 'app-login',
  imports: [TxtInput, Logo, PrimaryBtn, AuthSwitchLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {}

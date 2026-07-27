import { Component, signal } from '@angular/core';
import { Logo } from '../../../shared/components/logo/logo';
import { TxtInput } from '../../../shared/components/txt-input/txt-input';
import { PrimaryBtn } from '../../../shared/components/buttons/primary-btn/primary-btn';
import { AuthSwitchLink } from '../../../shared/components/auth-switch-link/auth-switch-link';
import { submit } from '@angular/forms/signals';

type Role = 'buyer' | 'seller';

@Component({
  selector: 'app-register',
  imports: [Logo, TxtInput, PrimaryBtn, AuthSwitchLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  role = signal<Role>('buyer');

  selectRole(role: Role) {
    this.role.set(role);
  }

  protected readonly submit = submit;
}

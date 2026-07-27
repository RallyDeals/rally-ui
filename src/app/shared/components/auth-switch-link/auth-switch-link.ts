import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-switch-link',
  imports: [RouterLink, NgClass],
  templateUrl: './auth-switch-link.html',
})
export class AuthSwitchLink {
  prompt = input.required<string>();
  linkText = input.required<string>();
  linkPath = input.required<string>();
  wrapperClass = input('');
}

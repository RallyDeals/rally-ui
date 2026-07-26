import { Component } from '@angular/core';
import { TxtInput } from '../../../shared/components/txt-input/txt-input';
import { Logo } from '../../../shared/components/logo/logo';

@Component({
  selector: 'app-login',
  imports: [TxtInput, Logo],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {}

import { Component, output } from '@angular/core';
import { IconButton } from '../../../shared/components/icon-button/icon-button';
import { Logo } from '../../../shared/components/logo/logo';

@Component({
  selector: 'app-admin-header',
  imports: [IconButton, Logo],
  templateUrl: './admin-header.html',
})
export class AdminHeader {
  menuToggle = output<void>();
}

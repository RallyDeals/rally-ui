import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { AdminSidebar } from './admin-sidebar/admin-sidebar';
import { AdminHeader } from './admin-header/admin-header';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, NgClass, AdminSidebar, AdminHeader],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  drawerOpen = signal(false);

  openDrawer = () => this.drawerOpen.set(true);
  closeDrawer = () => this.drawerOpen.set(false);
}

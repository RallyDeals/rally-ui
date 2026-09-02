import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs';
import { AdminSidebar } from './admin-sidebar/admin-sidebar';
import { AdminHeader } from './admin-header/admin-header';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, NgClass, AdminSidebar, AdminHeader],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  drawerOpen = signal(false);
  scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  openDrawer = () => this.drawerOpen.set(true);
  closeDrawer = () => this.drawerOpen.set(false);

  constructor(router: Router) {
    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.scrollContainer()?.nativeElement.scrollTo(0, 0);
    });
  }
}

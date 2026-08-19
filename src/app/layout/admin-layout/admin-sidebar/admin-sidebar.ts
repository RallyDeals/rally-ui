import { Component, inject, input, output } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Logo } from '../../../shared/components/logo/logo';
import { NgClass } from '@angular/common';

interface NavItem {
  label: string;
  symbol: string;
  path: string | null;
}

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, Logo, NgClass],
  templateUrl: './admin-sidebar.html',
})
export class AdminSidebar {
  showClose = input(false);
  close = output<void>();

  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly navItems: NavItem[] = [
    { label: 'Product Approvals', symbol: 'verified_user', path: '/admin/product-approvals' },
    { label: 'User Management', symbol: 'group', path: '/admin/user-management' },
    { label: 'Seller Management', symbol: 'storefront', path: '/admin/seller-management' },
    { label: 'Categories Management', symbol: 'category', path: '/admin/categories-management' },
    { label: 'Deals Management', symbol: 'local_fire_department', path: '/admin/deals-management' }
  ];

  readonly settingsItem: NavItem = { label: 'Platform Settings', symbol: 'settings', path: null };

  readonly adminName = 'Super Admin';
  readonly adminEmail = 'admin@rally.com';

  isActive(item: NavItem): boolean {
    return item.path !== null && this.currentUrl() === item.path;
  }

  navClass(item: NavItem): string {
    const base =
      'flex items-center gap-rally-sm px-rally-md py-rally-sm rounded-xl transition-all group';
    if (item.path === null) {
      return `${base} text-on-surface-variant opacity-50 cursor-not-allowed`;
    }
    return this.isActive(item)
      ? `${base} bg-primary-container text-on-primary-container shadow-md`
      : `${base} text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface`;
  }
}

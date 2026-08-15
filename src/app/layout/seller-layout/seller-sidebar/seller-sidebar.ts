import { Component, inject, input, output } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

interface NavItem {
  label: string;
  symbol: string;
  path: string | null;
}

@Component({
  selector: 'app-seller-sidebar',
  imports: [RouterLink],
  templateUrl: './seller-sidebar.html',
  styleUrl: './seller-sidebar.css',
})
export class SellerSidebar {
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
    { label: 'Overview', symbol: 'dashboard', path: '/seller' },
    { label: 'My Products', symbol: 'inventory_2', path: '/seller/products' },
    { label: 'Deals', symbol: 'group_add', path: '/seller/deals' },
    { label: 'Orders', symbol: 'receipt_long', path: '/seller/orders' },
  ];

  readonly settingsItem: NavItem = { label: 'Settings', symbol: 'settings', path: null };

  readonly storeName = 'Alex Store';
  readonly avatarUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCgxNrJsmbVdEsMq9E2yT7qkWEDEhhtW1gAlQKbdD0W-FyPJK6rhVuRLNUh9IoxlximM6CpdwvZOyQ1MoQN2VGx5p-DMDTeKHbvQXUCNRZfsHK0jhwVysf-7Y-4TY3PoqcRbignibynp97Ye0XNL7SwYGZ-ZVlnDFm1WiFLebxwJASm6kEoR3G_INAwp-yITH8yMr6wQiaU_6I_HaMM7t5X2LWa2P_h2-K2XspnTlMP2x5YYN5x4Qs106T9lYaK8wbwqGZg8vDtXMA';

  isActive(item: NavItem): boolean {
    return item.path !== null && this.currentUrl() === item.path;
  }

  navClass(item: NavItem): string {
    const base = 'flex items-center gap-rally-sm px-4 py-3 rounded-lg transition-colors';
    if (item.path === null) {
      return `${base} text-on-surface-variant opacity-50 cursor-not-allowed`;
    }
    return this.isActive(item)
      ? `${base} bg-primary-container text-on-primary font-semibold shadow-sm`
      : `${base} text-on-surface-variant hover:bg-surface-container`;
  }
}

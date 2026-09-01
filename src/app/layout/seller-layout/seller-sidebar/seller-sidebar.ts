import { Component, inject, input, output } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { PROFILE_PICTURE_PLACEHOLDER } from '../../../shared/constants/placeholder';
import { AuthService } from '../../../core/auth/auth.service';

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
  private readonly authService = inject(AuthService);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly navItems: NavItem[] = [
    { label: 'My Products', symbol: 'inventory_2', path: '/seller/products' },
    { label: 'Deals', symbol: 'group_add', path: '/seller/deals' },
    { label: 'Orders', symbol: 'receipt_long', path: '/seller/orders' },
  ];

  readonly storeName = 'Alex Store';
  readonly avatarUrl = PROFILE_PICTURE_PLACEHOLDER;
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

  logout = () => {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  };
}

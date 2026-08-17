import { Component, ElementRef, HostListener, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { Logo } from '../../shared/components/logo/logo';
import { NgClass } from '@angular/common';
import { DesktopNavLinks } from './desktop-nav-links/desktop-nav-links';
import { MobileNavLinks } from './mobile-nav-links/mobile-nav-links';
import { RouterLink } from '@angular/router';
import { PrimaryBtn } from '../../shared/components/buttons/primary-btn/primary-btn';

@Component({
  selector: 'app-header',
  imports: [Logo, NgClass, DesktopNavLinks, MobileNavLinks, RouterLink, PrimaryBtn],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly router = inject(Router);

  constructor(private elementRef: ElementRef) {}

  menuVisible: boolean = false;
  loggedIn: boolean = true;
  navLinks = [
    { name: 'Products', path: '/products', symbol: 'inventory_2' },
    { name: 'Deals', path: '/deals', symbol: 'local_offer' },
    { name: 'Categories', path: '/categories', symbol: 'category' },
  ];

  // Reactive so it stays correct for any navigation (breadcrumbs, in-page links,
  // programmatic router.navigate) — not just clicks on these nav links themselves.
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  selectedLink = computed(() => {
    const url = this.currentUrl();
    const link = this.navLinks.find(
      (link) => url === link.path || url.startsWith(`${link.path}/`) || url.startsWith(`${link.path}?`),
    );
    if (link) {
      return link.name;
    }
    if (url === '/cart' || url.startsWith('/cart/') || url.startsWith('/cart?')) {
      return 'cart';
    }
    if (url === '/profile' || url.startsWith('/profile/') || url.startsWith('/profile?')) {
      return 'profile';
    }
    return '';
  });

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }
  setSelectedLink = (_link: string) => {
    this.menuVisible = false;
  };
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.menuVisible) {
      return;
    }

    const target = event.target as Node | null;
    const mobileMenu = this.elementRef.nativeElement.querySelector('#mobile-menu') as HTMLElement | null;
    const menuToggle = this.elementRef.nativeElement.querySelector('#menu-toggle') as HTMLElement | null;

    if (target && ((mobileMenu && mobileMenu.contains(target)) ||
        (menuToggle && menuToggle.contains(target)))) return;
    this.menuVisible = false;
  }

}

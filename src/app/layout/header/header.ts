import { Component, ElementRef, HostListener } from '@angular/core';
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
  constructor(private elementRef: ElementRef) {}

  menuVisible: boolean = false;
  selectedLink: string = 'home';
  loggedIn: boolean = true;
  navLinks = [
    { name: 'Products', path: '/products', symbol: 'inventory_2' },
    { name: 'Deals', path: '/deals', symbol: 'local_offer' },
    { name: 'Categories', path: '/categories', symbol: 'category' },
    { name: 'Seller Dashboard', path: '/seller', symbol: 'storefront' },
    { name: 'Admin Dashboard', path: '/admin', symbol: 'admin_panel_settings' },
  ];

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }
  setSelectedLink = (link: string) => {
    this.selectedLink = link;
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

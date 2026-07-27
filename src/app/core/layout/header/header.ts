import { Component } from '@angular/core';
import { Logo } from '../../../shared/components/logo/logo';
import { NgClass } from '@angular/common';
import { DesktopNavLinks } from './desktop-nav-links/desktop-nav-links';
import { MobileNavLinks } from './mobile-nav-links/mobile-nav-links';
import { RouterLink } from '@angular/router';
import { PrimaryBtn } from '../../../shared/components/buttons/primary-btn/primary-btn';

@Component({
  selector: 'app-header',
  imports: [Logo, NgClass, DesktopNavLinks, MobileNavLinks, RouterLink, PrimaryBtn],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  menuVisible: boolean = false;
  selectedLink: string = 'home';
  loggedIn: boolean = false;
  navLinks = [
    { name: 'Products', path: '/products', symbol: 'inventory_2' },
    { name: 'Deals', path: '/deals', symbol: 'local_offer' },
    { name: 'Categories', path: '/categories', symbol: 'category' },
  ];

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }
  setSelectedLink = (link: string) => {
    this.selectedLink = link;
  };
}

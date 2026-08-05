import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mobile-nav-links',
  imports: [NgClass, RouterLink],
  templateUrl: './mobile-nav-links.html',
})
export class MobileNavLinks {
  navLinks = input.required<NavLink[]>();
  selectedLink = input.required<string>();
  setSelectedLink = input.required<(link: string) => void>();
}

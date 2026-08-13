import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-desktop-nav-links',
  imports: [RouterLink, NgClass],
  templateUrl: './desktop-nav-links.html',
})
export class DesktopNavLinks {
  navLinks = input.required<NavLink[]>();
  selectedLink = input.required<string>();
  setSelectedLink = input.required<(link: string) => void>();
}

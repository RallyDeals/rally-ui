import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs';
import { SellerSidebar } from './seller-sidebar/seller-sidebar';

@Component({
  selector: 'app-seller-layout',
  imports: [RouterOutlet, NgClass, SellerSidebar],
  templateUrl: './seller-layout.html',
  styleUrl: './seller-layout.css',
})
export class SellerLayout {
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

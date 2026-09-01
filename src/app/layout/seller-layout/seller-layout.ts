import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { SellerSidebar } from './seller-sidebar/seller-sidebar';

@Component({
  selector: 'app-seller-layout',
  imports: [RouterOutlet, NgClass, SellerSidebar],
  templateUrl: './seller-layout.html',
  styleUrl: './seller-layout.css',
})
export class SellerLayout {
  drawerOpen = signal(false);

  openDrawer = () => this.drawerOpen.set(true);
  closeDrawer = () => this.drawerOpen.set(false);
}

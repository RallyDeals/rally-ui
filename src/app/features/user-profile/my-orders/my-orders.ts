import { Component } from '@angular/core';
import { MyOrderCard } from './my-order-card/my-order-card';
import { MyOrder } from '../interfaces/my-order';

@Component({
  selector: 'app-my-orders',
  imports: [MyOrderCard],
  templateUrl: './my-orders.html',
})
export class MyOrders {
  orders: MyOrder[] = [
    {
      id: '#ORD-2993-8472',
      datePlaced: 'Oct 24, 2023',
      total: '$349.50',
      itemsLabel: '1 Item',
      shippingAddress: '123 Main St, Anytown USA',
      statusLabel: 'Delivered',
      statusDotClass: 'bg-secondary',
      statusBadgeClass: 'bg-secondary-container text-on-secondary-container',
      isMuted: false,
    },
    {
      id: '#ORD-9921-4451',
      datePlaced: 'Oct 18, 2023',
      total: '$129.00',
      itemsLabel: '1 Item',
      shippingAddress: '123 Main St, Anytown USA',
      statusLabel: 'In Transit',
      statusDotClass: 'bg-primary animate-pulse',
      statusBadgeClass: 'bg-surface-container-high text-primary',
      isMuted: false,
    },
    {
      id: '#ORD-1102-3394',
      datePlaced: 'Sep 05, 2023',
      total: '$89.99',
      itemsLabel: '3 Items',
      shippingAddress: '123 Main St, Anytown USA',
      statusLabel: 'Delivered',
      statusIcon: 'check_circle',
      statusDotClass: '',
      statusBadgeClass: 'bg-surface-container-high text-on-surface-variant',
      isMuted: true,
    },
  ];
}

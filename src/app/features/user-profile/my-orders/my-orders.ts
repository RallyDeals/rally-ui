import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MyOrderCard } from './my-order-card/my-order-card';
import { MyOrder } from '../interfaces/my-order';

@Component({
  selector: 'app-my-orders',
  imports: [MyOrderCard, RouterLink],
  templateUrl: './my-orders.html',
})
export class MyOrders {
  orders: MyOrder[] = [
    {
      id: '#ORD-2993-8472',
      datePlaced: 'Oct 24, 2023',
      total: '$349.50',
      itemsLabel: '1 Item',
      orderType: 'NORMAL',
      orderStatus: 'CONFIRMED',
      shippingStatus: 'delivered',
      isMuted: false,
    },
    {
      id: '#ORD-9921-4451',
      datePlaced: 'Oct 18, 2023',
      total: '$129.00',
      itemsLabel: '1 Item',
      orderType: 'DEAL',
      orderStatus: 'CONFIRMED',
      shippingStatus: 'shipped',
      isMuted: false,
    },
    {
      id: '#ORD-1102-3394',
      datePlaced: 'Sep 05, 2023',
      total: '$89.99',
      itemsLabel: '3 Items',
      orderType: 'NORMAL',
      orderStatus: 'CANCELLED',
      isMuted: true,
    },
  ];
}

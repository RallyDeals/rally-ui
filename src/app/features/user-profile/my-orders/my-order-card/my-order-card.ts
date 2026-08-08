import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MyOrder } from '../../interfaces/my-order';

@Component({
  selector: 'app-my-order-card',
  imports: [NgClass],
  templateUrl: './my-order-card.html',
})
export class MyOrderCard {
  order = input.required<MyOrder>();
}

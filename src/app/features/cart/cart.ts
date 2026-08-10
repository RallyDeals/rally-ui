import { Component } from '@angular/core';
import { CartHeader } from './cart-header/cart-header';
import { CartItem as CartItemComponent } from './cart-item/cart-item';
import { OrderSummary } from './order-summary/order-summary';
import { CartItem } from './interfaces/cart-item';

const TAX_RATE = 0.07;

@Component({
  selector: 'app-cart',
  imports: [CartHeader, CartItemComponent, OrderSummary],
  templateUrl: './cart.html',
})
export class Cart {
  items: CartItem[] = [
    {
      id: 1,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB4YgfwfOAd1AFoeXagdUHLNWEPIR9UcTCdutAczFmnct5cRli5cBdGxjOI99lATFEPZPOfkQrORTPe3I1zqFqaulLyAU8C9E4JSjqP7SEX0n_4BDTw1jLK_AvJC8YKN22oZm8S8lotj9ymZkNTckFkyCScLlsWa3ubSmCQQUAD4P6LfpW1h3Nv_gupvZgSr6al7uRBiQchw9yOdBQmwctB0PPRC4KDJRvWZ0qsPVIJTYBRyQvvk8N2TEkKzHGs3WbzUoJqjATq3-Q',
      imageAlt: 'Minimalist Pour-Over Coffee Set',
      name: 'Minimalist Pour-Over Coffee Set',
      price: 45.0,
      quantity: 2,
    },
    {
      id: 2,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBSy1R1NOpVfQbTjfYu3eoTeloKnb-_CRQxfHFjvN3rIcrjI10ErFGay0VGxDoXkuLJ49obr1OS8rcjZEfqFKvH5wIP4_pW5qxvj4CfNpodF8irLFFljlQYbVB7FGsHMTrvsN2q86T_JCscvAZcvWImlSikcPfTI4I7ddP8oCXIyf3_2qq2VgYU7uS5eNY7SgEjrannj2Oye1X2p0QMcnan-L60XQOtJa20YdjntsKcpnWkpT4thzzZM3PiB4Nkd0wh654bf_pyKV0',
      imageAlt: 'EcoSmart Temp Sensor',
      name: 'EcoSmart Temp Sensor',
      price: 29.99,
      quantity: 1,
    },
  ];

  get totalUnits(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get estimatedTax(): number {
    return this.subtotal * TAX_RATE;
  }

  get total(): number {
    return this.subtotal + this.estimatedTax;
  }

  incrementQuantity = (id: number) => {
    const item = this.items.find((i) => i.id === id);
    if (item) item.quantity++;
  };

  decrementQuantity = (id: number) => {
    const item = this.items.find((i) => i.id === id);
    if (item && item.quantity > 1) item.quantity--;
  };

  removeItem = (id: number) => {
    this.items = this.items.filter((i) => i.id !== id);
  };

  clearCart = () => {
    this.items = [];
  };
}

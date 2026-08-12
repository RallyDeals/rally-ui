import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models/cart-item';
import { PLACEHOLDER_IMAGE } from '../constants/placeholder';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>([]);

  readonly totalUnits = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  add(product: Product, quantity = 1) {
    this.items.update((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [
        ...items,
        {
          id: product.id,
          image: product.imageUrl ?? PLACEHOLDER_IMAGE,
          imageAlt: product.name,
          name: product.name,
          price: product.basePrice,
          quantity,
        },
      ];
    });
  }

  increment = (id: string) => {
    this.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
    );
  };

  decrement = (id: string) => {
    this.items.update((items) =>
      items.map((item) =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item,
      ),
    );
  };

  remove = (id: string) => {
    this.items.update((items) => items.filter((item) => item.id !== id));
  };

  clear = () => {
    this.items.set([]);
  };
}

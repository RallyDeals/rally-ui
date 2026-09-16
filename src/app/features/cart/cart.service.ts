import { Injectable, computed, effect, signal } from '@angular/core';
import { CartItem } from './interfaces/cart-item';
import { PLACEHOLDER_IMAGE } from '../../shared/constants/placeholder';
import { Product } from '../../shared/models/product';

const STORAGE_KEY = 'cart';

function loadStoredItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>(loadStoredItems());

  readonly totalUnits = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
    });
  }

  add(product: Product, quantity = 1, availableStock?: number) {
    const stock = availableStock ?? product.availableStock;
    this.items.update((items) => {
      const existing = items.find((item) => item.id === product.id);
      const cap = (stock && stock > 0 ? stock : undefined) ?? existing?.stock;
      const nextQuantity = Math.min(
        (existing?.quantity ?? 0) + quantity,
        cap ?? Number.MAX_SAFE_INTEGER,
      );
      if (existing) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: nextQuantity, stock: cap } : item,
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
          quantity: nextQuantity,
          stock: cap,
        },
      ];
    });
  }

  increment = (id: string) => {
    this.items.update((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        const cap = item.stock && item.stock > 0 ? item.stock : Number.MAX_SAFE_INTEGER;
        return { ...item, quantity: Math.min(item.quantity + 1, cap) };
      }),
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

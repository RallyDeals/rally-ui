import { Component, computed, input } from '@angular/core';
import { CartItem as CartItemModel } from '../../interfaces/cart-item';
import { PLACEHOLDER_IMAGE } from '../../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../../shared/utils/image-url';

@Component({
  selector: 'app-cart-item',
  imports: [],
  templateUrl: './cart-item.html',
})
export class CartItem {
  item = input.required<CartItemModel>();
  onIncrement = input.required<(id: string) => void>();
  onDecrement = input.required<(id: string) => void>();
  onRemove = input.required<(id: string) => void>();

  subtotal = computed(() => this.item().price * this.item().quantity);
  imageSrc = computed(() => resolveImageUrl(this.item().image, PLACEHOLDER_IMAGE));
}

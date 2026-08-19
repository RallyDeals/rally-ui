import { Component, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { IconButton } from '../../../../shared/components/icon-button/icon-button';
import { OrderPhaseBadge } from '../../components/order-phase-badge/order-phase-badge';
import { BriefSellerOrdersResponse } from '../../../orders/interfaces/brief-seller-orders-response';
import { orderCode, productCode } from '../../../../shared/utils/order-code.util';
import { RouterLink } from '@angular/router';
import { PLACEHOLDER_IMAGE } from '../../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../../shared/utils/image-url';
import { ImageFallbackDirective } from '../../../../shared/directives/image-fallback.directive';

@Component({
  selector: 'tr[app-seller-order-row]',
  imports: [
    CurrencyPipe,
    DatePipe,
    IconButton,
    OrderPhaseBadge,
    RouterLink,
    ImageFallbackDirective,
  ],
  templateUrl: './seller-order-row.html',
})
export class SellerOrderRow {
  order = input.required<BriefSellerOrdersResponse>();
  orderNumber = (id: string): string => orderCode(id);
  productNumber = (productId: string): string => productCode(productId);
  totalQuantity(order: BriefSellerOrdersResponse): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }
  extraItemsLabel(order: BriefSellerOrdersResponse): string {
    const extras = order.items.length - 1;
    return extras > 0 ? ` · +${extras} more item${extras > 1 ? 's' : ''}` : '';
  }

  protected readonly placeholderImage = PLACEHOLDER_IMAGE;
  protected readonly resolveImageUrl = resolveImageUrl;
}

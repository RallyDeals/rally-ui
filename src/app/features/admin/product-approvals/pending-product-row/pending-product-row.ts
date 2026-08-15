import { Component, input, output } from '@angular/core';
import { Product } from '../../../../shared/models/product';
import { ImageFallbackDirective } from '../../../../shared/directives/image-fallback.directive';
import { PLACEHOLDER_IMAGE } from '../../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../../shared/utils/image-url';

@Component({
  selector: 'tr[app-pending-product-row]',
  imports: [ImageFallbackDirective],
  templateUrl: './pending-product-row.html',
})
export class PendingProductRow {
  product = input.required<Product>();
  approve = output<Product>();
  reject = output<Product>();

  readonly placeholderImage = PLACEHOLDER_IMAGE;
  readonly resolveImageUrl = resolveImageUrl;
}

import { Component, input } from '@angular/core';
import { Product } from '../../../../../shared/models/product';
import { ImageFallbackDirective } from '../../../../../shared/directives/image-fallback.directive';
import { PLACEHOLDER_IMAGE } from '../../../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../../../shared/utils/image-url';

@Component({
  selector: 'tr[app-seller-product-row]',
  imports: [ImageFallbackDirective],
  templateUrl: './seller-product-row.html',
})
export class SellerProductRow {
  product = input.required<Product>();

  readonly placeholderImage = PLACEHOLDER_IMAGE;
  readonly resolveImageUrl = resolveImageUrl;
}

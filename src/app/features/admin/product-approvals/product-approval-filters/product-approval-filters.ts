import { Component, computed, input, output } from '@angular/core';
import { Category } from '../../../../shared/models/category';
import { SellerInfo } from '../../../auth/user.service';
import { SearchableSelect, SelectOption } from '../../../../shared/components/searchable-select/searchable-select';

@Component({
  selector: 'app-product-approval-filters',
  imports: [SearchableSelect],
  templateUrl: './product-approval-filters.html',
})
export class ProductApprovalFilters {
  categories = input.required<Category[]>();
  sellers = input.required<SellerInfo[]>();
  selectedCategoryId = input('');
  selectedSellerId = input('');

  categoryChange = output<string>();
  sellerChange = output<string>();

  readonly categoryOptions = computed<SelectOption[]>(() =>
    this.categories().map((category) => ({ value: category.id, label: category.name })),
  );

  readonly sellerOptions = computed<SelectOption[]>(() =>
    this.sellers().map((seller) => ({ value: seller.sellerId, label: seller.sellerName })),
  );
}

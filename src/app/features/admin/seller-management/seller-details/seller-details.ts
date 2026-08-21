import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../auth/admin-user.service';
import { Seller } from '../../interfaces/seller';
import { PageResponse } from '../../../products/page-response';
import { ProductsService } from '../../../products/products.service';
import { Product } from '../../../../shared/models/product';
import { ApiError } from '../../../../shared/models/api-error';
import { toApiError } from '../../../../shared/utils/api-error.util';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SellerDetailsHeader } from './seller-details-header/seller-details-header';
import { SellerDetailsStats } from './seller-details-stats/seller-details-stats';
import { SellerProductRow } from './seller-product-row/seller-product-row';
import { Pagination } from '../../../../shared/components/pagination/pagination';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-seller-details',
  imports: [SellerDetailsHeader, SellerDetailsStats, SellerProductRow, Pagination, ErrorState],
  templateUrl: './seller-details.html',
})
export class SellerDetails implements OnInit {
  private readonly userService = inject(UserService);
  private readonly productsService = inject(ProductsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private sellerId = '';

  seller = signal<Seller | null>(null);
  sellerError = signal<ApiError | null>(null);
  sellerProducts = signal<PageResponse<Product>>({
    items: [],
    total: 0,
    limit: PAGE_SIZE,
    page: 1,
  });
  productsError = signal<ApiError | null>(null);
  loading = signal(true);
  page = signal(1);

  totalPages = computed(() => Math.max(1, Math.ceil(this.sellerProducts().total / PAGE_SIZE)));

  ngOnInit() {
    this.sellerId = this.activatedRoute.snapshot.params['sellerId'];
    this.loadSeller();
    this.loadProducts();
  }

  loadSeller() {
    this.loading.set(true);
    this.sellerError.set(null);
    this.userService.getSellerById(this.sellerId).subscribe({
      next: (seller) => {
        this.seller.set(seller);
        this.loading.set(false);
      },
      error: (err) => {
        this.sellerError.set(toApiError(err));
        this.loading.set(false);
      },
    });
  }

  loadProducts() {
    this.productsError.set(null);
    this.productsService.getAdminProductsBySeller(this.sellerId, { page: this.page(), limit: PAGE_SIZE }).subscribe({
      next: (products) => {
        this.sellerProducts.set(products);
      },
      error: (err) => {
        this.productsError.set(toApiError(err));
      },
    });
  }

  onPageChange = (page: number) => {
    this.page.set(page);
    this.loadProducts();
  };
}

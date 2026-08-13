import { Component, computed, inject, signal } from '@angular/core';
import { MyOrderCard } from './my-order-card/my-order-card';
import { BriefOrderResponse } from '../../orders/interfaces/brief-order-response';
import { OrderService } from '../../orders/order.service';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ErrorModal } from '../../../shared/components/error-modal/error-modal';

const PAGE_SIZE = 2;

@Component({
  selector: 'app-my-orders',
  imports: [MyOrderCard, ErrorState, ErrorModal, RouterLink],
  templateUrl: './my-orders.html',
})
export class MyOrders {
  private orderService = inject(OrderService);

  orders = signal<BriefOrderResponse[]>([]);
  isLoading = signal(false);
  loadError = signal<ApiError | null>(null);
  loadMoreError = signal<ApiError | null>(null);
  private total = signal(0);
  private page = signal(1);

  hasMore = computed(() => this.orders().length < this.total());

  constructor() {
    this.loadPage();
  }

  loadMore(): void {
    this.page.update((page) => page + 1);
    this.loadPage();
  }

  private loadPage(): void {
    const isFirstPage = this.page() === 1;
    this.isLoading.set(true);
    this.orderService.getMyOrders(this.page(), PAGE_SIZE).subscribe({
      error: (err) => {
        this.isLoading.set(false);
        const apiError = toApiError(err);
        if (isFirstPage) {
          this.loadError.set(apiError);
        } else {
          this.page.update((page) => page - 1);
          this.loadMoreError.set(apiError);
        }
      },
      next: (response) => {
        this.orders.update((orders) => [...orders, ...response.orders]);
        this.total.set(response.total);
        this.isLoading.set(false);
      },
    });
  }
}

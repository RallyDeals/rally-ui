import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BriefOrderPageResponse } from './interfaces/brief-order-page-response';
import { DetailedOrderResponse } from './interfaces/detailed-order-response';
import { CheckoutOrderRequest } from './interfaces/checkout-order-request';
import { CheckoutOrderResponse } from './interfaces/checkout-order-response';
import { TokenService } from '../../shared/services/token.service';
import { BriefSellerOrdersPageResponse } from './interfaces/brief-seller-orders-page-response';
import { SellerOrdersParams } from './interfaces/seller-orders-params';
import { DetailedSellerOrderResponse } from './interfaces/detailed-seller-order-response';
import { SellerOrdersStatistics } from './interfaces/seller-orders-statistics';
import { AuthService } from '../../core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl: string = `${environment.apiUrl}/api/orders`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  getMyOrders(page: number, limit: number): Observable<BriefOrderPageResponse> {
    return this.http.get<BriefOrderPageResponse>(`${this.baseUrl}/my`, {
      params: { page, limit },
    });
  }

  getOrderById(id: string): Observable<DetailedOrderResponse> {
    return this.http.get<DetailedOrderResponse>(`${this.baseUrl}/${id}`);
  }

  checkout(request: CheckoutOrderRequest): Observable<CheckoutOrderResponse> {
    return this.http.post<CheckoutOrderResponse>(`${this.baseUrl}/checkout`, request);
  }

  listSellerOrders(params: SellerOrdersParams): Observable<BriefSellerOrdersPageResponse> {
    let url = `${this.baseUrl}/sellers/${this.sellerId}`;
    const queryParams: Record<string, string | number> = {};
    if (params.status && params.status !== 'ALL') {
      queryParams['status'] = params.status;
    }
    if (params.startDate) {
      queryParams['startDate'] = params.startDate;
    }
    if (params.search && params.search.trim() !== '') {
      queryParams['search'] = params.search.trim();
    }
    queryParams['limit'] = params.limit;
    queryParams['page'] = params.page;

    return this.http.get<BriefSellerOrdersPageResponse>(url, { params: queryParams });
  }

  getSellerOrderById(id: string): Observable<DetailedSellerOrderResponse | undefined> {
    return this.http.get<DetailedSellerOrderResponse>(
      `${this.baseUrl}/sellers/${this.sellerId}/${id}`,
    );
  }

  getSellerOrdersAnalytics(startDate: string): Observable<SellerOrdersStatistics> {
    return this.http.get<SellerOrdersStatistics>(
      `${this.baseUrl}/sellers/${this.sellerId}/analytics`,
      {
        params: { startDate: startDate },
      },
    );
  }

  private get sellerId(): string {
    return this.authService.currentUser()?.id ?? '';
  }
}

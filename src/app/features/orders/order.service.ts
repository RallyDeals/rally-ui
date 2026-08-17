import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BriefOrderPageResponse } from './interfaces/brief-order-page-response';
import { DetailedOrderResponse } from './interfaces/detailed-order-response';
import { CheckoutOrderRequest } from './interfaces/checkout-order-request';
import { CheckoutOrderResponse } from './interfaces/checkout-order-response';
import {
  BackendSellerOrderDetail,
  mapBackendOrder,
  mapBackendOrderDetail,
  SellerOrder,
  SellerOrderDetail,
  SellerOrderPageResponse,
} from '../../shared/models/seller-order';
import { TokenService } from '../../shared/services/token.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl: string = `${environment.apiUrl}/api/orders`;
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  getMyOrders(page: number, limit: number): Observable<BriefOrderPageResponse> {
    return this.http.get<BriefOrderPageResponse>(`${this.baseUrl}/my`, {
      params: { page, limit },
    });
  }

  getOrderById(id: string): Observable<DetailedOrderResponse> {
    return this.http.get<DetailedOrderResponse>(`${this.baseUrl}/${id}`);
  }

  checkout(request: CheckoutOrderRequest): Observable<CheckoutOrderResponse> {
    return this.http.post<CheckoutOrderResponse>(
      `${this.baseUrl}/checkout`,
      request,
    );
  }

  listSellerOrders(
    params: { status?: string; page?: number; limit?: number } = {},
  ): Observable<SellerOrder[]> {
    let url = `${this.baseUrl}/sellers/${this.sellerId}`;
    const queryParams: Record<string, string | number> = {};
    if (params.status && params.status !== 'ALL') {
      queryParams['status'] = params.status;
    }
    if (params.page !== undefined) {
      queryParams['page'] = params.page;
    }
    if (params.limit !== undefined) {
      queryParams['limit'] = params.limit;
    }

    return this.http
      .get<SellerOrderPageResponse>(url, { params: queryParams })
      .pipe(map((response) => response.orders.map(mapBackendOrder)));
  }

  getSellerOrderById(id: string): Observable<SellerOrderDetail | undefined> {
    return this.http
      .get<BackendSellerOrderDetail>(`${this.baseUrl}/sellers/${this.sellerId}/${id}`)
      .pipe(
        map((response) => mapBackendOrderDetail(response)),
        // Return undefined on 404
      );
  }

  private get sellerId(): string {
    return this.tokenService.getSellerId() ?? '';
  }
}

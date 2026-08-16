import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../shared/services/token.service';
import {
  SellerOrder,
  SellerOrderDetail,
  SellerOrderPageResponse,
  BackendSellerOrderDetail,
  mapBackendOrder,
  mapBackendOrderDetail,
} from '../../../shared/models/seller-order';

@Injectable({ providedIn: 'root' })
export class SellerOrderService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly apiUrl = environment.apiUrl;

  private get sellerId(): string {
    return this.tokenService.getSellerId() ?? '';
  }

  listOrders(params: { status?: string; page?: number; limit?: number } = {}): Observable<SellerOrder[]> {
    let url = `${this.apiUrl}/api/orders/sellers/${this.sellerId}`;
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

  getOrderById(id: string): Observable<SellerOrderDetail | undefined> {
    return this.http
      .get<BackendSellerOrderDetail>(
        `${this.apiUrl}/api/orders/sellers/${this.sellerId}/${id}`
      )
      .pipe(
        map((response) => mapBackendOrderDetail(response)),
        // Return undefined on 404
      );
  }
}

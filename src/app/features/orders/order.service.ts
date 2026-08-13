import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BriefOrderPageResponse } from './interfaces/brief-order-page-response';
import { DetailedOrderResponse } from './interfaces/detailed-order-response';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  getMyOrders(page: number, limit: number): Observable<BriefOrderPageResponse> {
    return this.http.get<BriefOrderPageResponse>(`${environment.gatewayUrl}/api/orders/my`, {
      params: { page, limit },
    });
  }

  getOrderById(id: string): Observable<DetailedOrderResponse>{
    return this.http.get<DetailedOrderResponse>(`${environment.gatewayUrl}/api/orders/${id}`);
  }
}

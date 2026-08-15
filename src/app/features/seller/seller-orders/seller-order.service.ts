import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SellerOrder } from '../../../shared/models/seller-order';
import { getSellerOrderById, listSellerOrders } from '../../../shared/mocks/orders';

/**
 * Data access for the seller Orders screens.
 *
 * Currently backed by the in-memory mock. To wire to the backend, replace the
 * `of(...)` calls with HTTP requests against the seller-orders endpoint — the
 * components only consume the Observable contracts, so no UI change is needed.
 */
@Injectable({ providedIn: 'root' })
export class SellerOrderService {
  listOrders(): Observable<SellerOrder[]> {
    return of(listSellerOrders());
  }

  getOrderById(id: string): Observable<SellerOrder | undefined> {
    return of(getSellerOrderById(id));
  }
}

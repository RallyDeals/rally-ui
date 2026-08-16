import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inventory } from '../../shared/models/inventory';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getInventory(productId: string): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.apiUrl}/inventory/${productId}`);
  }

  getInventoryBulk(productIds: string[]): Observable<Record<string, Inventory>> {
    return this.http.post<Record<string, Inventory>>(`${this.apiUrl}/inventory/bulk`, productIds);
  }

  restock(productId: string, quantity: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/inventory/${productId}/restock`, {
      quantity,
    });
  }

  adjust(productId: string, adjustment: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/inventory/${productId}/adjust`, {
      adjustment,
    });
  }

  deleteInventory(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inventory/${productId}`);
  }
}

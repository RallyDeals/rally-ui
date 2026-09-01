import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inventory } from '../models/inventory';
import { getMockInventory, setMockInventory } from '../mocks/inventory.mock';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getInventory(productId: string): Observable<Inventory> {
    return new Observable((observer) => {
      observer.next(getMockInventory(productId));
      observer.complete();
    });
    // return this.http.get<Inventory>(`${this.apiUrl}/inventory/${productId}`);
  }

  getInventoryBulk(productIds: string[]): Observable<Record<string, Inventory>> {
    return new Observable((observer) => {
      const result: Record<string, Inventory> = {};
      for (const productId of productIds) {
        result[productId] = getMockInventory(productId);
      }
      observer.next(result);
      observer.complete();
    });
    // return this.http.post<Record<string, Inventory>>(`${this.apiUrl}/inventory/bulk`, productIds);
  }

  restock(productId: string, quantity: number): Observable<{ message: string }> {
    return new Observable((observer) => {
      const current = getMockInventory(productId);
      setMockInventory(productId, { totalStock: current.totalStock + quantity });
      observer.next({ message: 'Inventory restocked.' });
      observer.complete();
    });
    // return this.http.patch<{ message: string }>(`${this.apiUrl}/inventory/${productId}/restock`, {
    //   quantity,
    // });
  }
}

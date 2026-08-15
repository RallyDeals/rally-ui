import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsersCountResponse {
  buyersCount: number;
  sellersCount: number;
}
export interface SellerInfo {
  sellerId: string;
  sellerName: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getSellers(): Observable<SellerInfo[]> {
    return new Observable((observer) => {
      observer.next([
        { sellerId: 'a1b2c3d4-1111-4a1b-8c2d-000000000001', sellerName: 'Mock Seller 1' },
        { sellerId: 'a1b2c3d4-2222-4a1b-8c2d-000000000002', sellerName: 'Mock Seller 2' },
        { sellerId: 'a1b2c3d4-3333-4a1b-8c2d-000000000003', sellerName: 'Mock Seller 3' },
        { sellerId: 'a1b2c3d4-4444-4a1b-8c2d-000000000004', sellerName: 'Mock Seller 4' },
        { sellerId: 'f8e5d6c7-b8a9-4012-9345-6789abcdef01', sellerName: 'Mock Seller 5' },
      ]);
      observer.complete();
    });
    // return this.http.get<sellerInfo[]>(`${this.apiUrl}/users/sellers`);
  }
}

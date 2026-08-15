import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { User } from '../../shared/models/user';
import { Seller } from '../admin/interfaces/seller';
import { PageResponse } from '../products/page-response';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return new Observable((observer) => {
      observer.next([
        {
          id: 'b1b2c3d4-1111-4a1b-8c2d-000000000001',
          name: 'Nancy Doe',
          email: 'nancy@domain.co',
          joinedAt: 'Sep 28, 2026',
          status: 'banned',
          type: 'buyer',
        },
        {
          id: 'b1b2c3d4-2222-4a1b-8c2d-000000000002',
          name: 'John Smith',
          email: 'john@domain.co',
          joinedAt: 'Aug 05, 2025',
          status: 'active',
          type: 'buyer',
        },
        {
          id: 'b1b2c3d4-3333-4a1b-8c2d-000000000003',
          name: 'Jane Doe',
          email: 'jane@domain.co',
          joinedAt: 'Jul 15, 2025',
          status: 'active',
          type: 'buyer',
        },
        {
          id: 'b1b2c3d4-4444-4a1b-8c2d-000000000004',
          name: 'Bob Johnson',
          email: 'bob@domain.co',
          joinedAt: 'Jun 22, 2026',
          status: 'active',
          type: 'buyer',
        },
        {
          id: 'f8e5d6c7-b8a9-4012-9345-6789abcdef01',
          name: 'Alice Williams',
          email: 'alice@domain.co',
          joinedAt: 'May 18, 2026',
          status: 'active',
          type: 'buyer',
        },
        {
          id: 'a1b2c3d4-1111-4a1b-8c2d-000000000001',
          name: 'Wrenfield Co.',
          email: 'wrenfield@domain.com',
          joinedAt: 'Feb 14, 2025',
          status: 'active',
          type: 'seller',
        },
        {
          id: 'a1b2c3d4-2222-4a1b-8c2d-000000000002',
          name: 'Coastal Co.',
          email: 'coastal@domain.com',
          joinedAt: 'Aug 27, 2025',
          status: 'active',
          type: 'seller',
        },
        {
          id: 'a1b2c3d4-4444-4a1b-8c2d-000000000004',
          name: 'Stride Co.',
          email: 'stride@domain.com',
          joinedAt: 'Jan 09, 2026',
          status: 'active',
          type: 'seller',
        },
        {
          id: 'f8e5d6c7-b8a9-4012-9345-6789abcdef01',
          name: 'Vantage Co.',
          email: 'vantage@domain.com',
          joinedAt: 'May 18, 2025',
          status: 'active',
          type: 'seller',
        },
        {
          id: 'a1b2c3d4-3333-4a1b-8c2d-000000000003',
          name: 'Lumen Co.',
          email: 'lumen@domain.com',
          joinedAt: 'Mar 30, 2026',
          status: 'active',
          type: 'seller',
        },
        {
          id: 'user-seed-0001',
          name: 'Northgate Co.',
          email: 'northgate@domain.com',
          joinedAt: 'Jul 12, 2025',
          status: 'active',
          type: 'seller',
        },
      ]);
      observer.complete();
    });
    // return this.http.get<User[]>(`${this.apiUrl}/users/buyers`, {
    //   params: {
    //     type: params.type
    //   }
    // });
  }

  getSellers(): Observable<PageResponse<Seller>> {
    return new Observable((observer) => {
      observer.next({
        items: [
          {
            id: 'a1b2c3d4-1111-4a1b-8c2d-000000000001',
            name: 'Wrenfield Co.',
            email: 'wrenfield@domain.com',
            joinedAt: 'Feb 14, 2025',
            productsCount: 4,
            pendingApprovals: 1,
            activeDeals: 2
          },
          {
            id: 'a1b2c3d4-2222-4a1b-8c2d-000000000002',
            name: 'Coastal Co.',
            email: 'coastal@domain.com',
            joinedAt: 'Aug 27, 2025',
            productsCount: 4,
            pendingApprovals: 0,
            activeDeals: 1
          },
          {
            id: 'a1b2c3d4-4444-4a1b-8c2d-000000000004',
            name: 'Stride Co.',
            email: 'stride@domain.com',
            joinedAt: 'Jan 09, 2026',
            productsCount: 4,
            pendingApprovals: 1,
            activeDeals: 1
          },
          {
            id: 'a1b2c3d4-3333-4a1b-8c2d-000000000003',
            name: 'Lumen Co.',
            email: 'lumen@domain.com',
            joinedAt: 'Mar 30, 2026',
            productsCount: 4,
            pendingApprovals: 0,
            activeDeals: 2
          },
          {
            id: 'user-seed-0001',
            name: 'Northgate Co.',
            email: 'northgate@domain.com',
            joinedAt: 'Jul 12, 2025',
            productsCount: 30,
            pendingApprovals: 0,
            activeDeals: 1
          },
        ],
        total: 5,
        page: 1,
        limit: 3
      });
      observer.complete();
    });
    // return this.http.get<Seller[]>(`${this.apiUrl}/users/sellers`);
  }

  getSellerById(id: string): Observable<Seller> {
    return new Observable((observer) => {
      const seller = this.getSellers().pipe(
        map((sellers) => sellers.items.find((s) => s.id === id))
      ).subscribe({
        next: (seller) => {
          observer.next(seller as Seller);
          observer.complete();
        },
        error: () => {
          observer.error();
        }
      });
    });
  }

  banBuyer(id: string): Observable<void> {
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
    // return this.http.patch<void>(`${this.apiUrl}/users/buyers/${id}/ban`, {});
  }

  activateBuyer(id: string): Observable<void> {
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
    // return this.http.patch<void>(`${this.apiUrl}/users/buyers/${id}/activate`, {});
  }
}

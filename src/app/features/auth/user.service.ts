import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BuyerStatus, User, UserType } from '../../shared/models/user';
import { Seller } from '../admin/interfaces/seller';
import { PageResponse } from '../products/page-response';
import { MOCK_SELLERS, MOCK_USERS } from '../../shared/mocks/user.mock';

export interface UserQueryParams {
  search?: string;
  types?: UserType[];
  statuses?: BuyerStatus[];
  page?: number;
  limit?: number;
}

export interface SellerQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

function paginate<T>(items: T[], page: number, limit: number): PageResponse<T> {
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total: items.length, page, limit };
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getUsers(params: UserQueryParams = {}): Observable<PageResponse<User>> {
    const search = params.search?.trim().toLowerCase();
    const types = params.types ?? [];
    const statuses = params.statuses ?? [];
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    return new Observable((observer) => {
      const filtered = MOCK_USERS.filter((user) => {
        const matchesSearch =
          !search || user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search);
        const matchesType = types.length === 0 || types.includes(user.type);
        const matchesStatus = statuses.length === 0 || statuses.includes(user.status);
        return matchesSearch && matchesType && matchesStatus;
      });
      observer.next(paginate(filtered, page, limit));
      observer.complete();
    });
    // return this.http.get<PageResponse<User>>(`${this.apiUrl}/users/buyers`, {
    //   params: {
    //     page,
    //     limit,
    //     ...(search && { search }),
    //     ...(types.length > 0 && { types }),
    //     ...(statuses.length > 0 && { statuses }),
    //   },
    // });
  }

  getSellers(params: SellerQueryParams = {}): Observable<PageResponse<Seller>> {
    const search = params.search?.trim().toLowerCase();
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    return new Observable((observer) => {
      const filtered = MOCK_SELLERS.filter(
        (seller) =>
          !search || seller.name.toLowerCase().includes(search) || seller.email.toLowerCase().includes(search),
      );
      observer.next(paginate(filtered, page, limit));
      observer.complete();
    });
    // return this.http.get<PageResponse<Seller>>(`${this.apiUrl}/users/sellers`, {
    //   params: {
    //     page,
    //     limit,
    //     ...(search && { search }),
    //   },
    // });
  }

  getSellerById(id: string): Observable<Seller> {
    return new Observable((observer) => {
      const seller = MOCK_SELLERS.find((item) => item.id === id);
      if (seller) {
        observer.next(seller);
        observer.complete();
      } else {
        observer.error(new Error('Seller not found'));
      }
    });
    // return this.http.get<Seller>(`${this.apiUrl}/users/sellers/${id}`);
  }

  banBuyer(id: string): Observable<void> {
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
    // return this.http.patch<void>(`${this.apiUrl}/users/${id}/ban`, {});
  }

  activateBuyer(id: string): Observable<void> {
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
    // return this.http.patch<void>(`${this.apiUrl}/users/${id}/activate`, {});
  }
}

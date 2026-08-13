import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from './page-response';
import { Product } from '../../shared/models/product';

export interface ProductQueryParams {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getProducts(params: ProductQueryParams = {}): Observable<PageResponse<Product>> {
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/products`, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 12,
        ...(params.q && { q: params.q }),
        ...(params.categoryId && { categoryId: params.categoryId }),
        ...(params.minPrice !== undefined && { minPrice: params.minPrice }),
        ...(params.maxPrice !== undefined && { maxPrice: params.maxPrice }),
        ...(params.sort && { sort: params.sort }),
      },
    });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }
}

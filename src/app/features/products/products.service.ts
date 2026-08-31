import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from './page-response';
import { Product } from '../../shared/models/product';
import { ProductQueryParams } from './interfaces/product-query-params';
import { UpsertProductRequest } from './interfaces/upsert-product-request';
import { ImageUploadResponse } from './interfaces/image-upload-response';

export enum ProductStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
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
        ...(params.tag && { tag: params.tag }),
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

  getSellerProducts(
    sellerId: string,
    params: {
      status?: string;
      deleted?: boolean;
      includeDeleted?: boolean;
      sort?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Observable<PageResponse<Product>> {
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/products/sellers/${sellerId}`, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        ...(params.status && { status: params.status }),
        ...(params.deleted !== undefined && { deleted: String(params.deleted) }),
        ...(params.includeDeleted !== undefined && {
          includeDeleted: String(params.includeDeleted),
        }),
        ...(params.sort && { sort: params.sort }),
      },
    });
  }

  getPendingApprovalProducts(
    params: { categoryId?: string; sellerId?: string; page?: number; limit?: number; includeDeleted?: boolean } = {},
  ): Observable<PageResponse<Product>> {
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/products/admin`, {
      params: {
        status: ProductStatus.PENDING_APPROVAL,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        includeDeleted: params.includeDeleted ?? true,
        ...(params.categoryId && { categoryId: params.categoryId }),
        ...(params.sellerId && { sellerId: params.sellerId }),
      },
    });
  }

  getAdminProductsBySeller(
    sellerId: string,
    params: { page?: number; limit?: number } = {},
  ): Observable<PageResponse<Product>> {
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/products/admin`, {
      params: {
        sellerId,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      },
    });
  }

  approveProduct(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/products/admin/${id}/approve`, {});
  }

  rejectProduct(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/products/admin/${id}/reject`, {});
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  restoreProduct(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/products/${id}/restore`, {});
  }

  createProduct(request: UpsertProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, request);
  }

  updateProduct(id: string, request: UpsertProductRequest): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, request);
  }

  uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImageUploadResponse>(`${this.apiUrl}/products/images`, formData);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../../shared/models/category';
import { CreateCategoryRequest } from './interfaces/create-category-request';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getCategories(includeProductsCount: boolean = false): Observable<Category[]> {
    const params = includeProductsCount ? { params: { includeProductCount: includeProductsCount } } : {};
    return this.http.get<Category[]>(`${this.apiUrl}/categories`, params);
  }

  createCategory(request: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, request);
  }

  updateCategory(id: string, request: CreateCategoryRequest): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/categories/${id}`, request);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`, {});
  }
}

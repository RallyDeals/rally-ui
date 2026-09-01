import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user';
import { Seller } from '../admin/interfaces/seller';
import { PageResponse } from '../products/page-response';
import { Role, UpdateProfileRequest, UserProfile } from '../../core/auth/models';
import { UserQueryParams } from './interfaces/user-query-params';
import { SellerQueryParams } from './interfaces/seller-query-params';

/** Response of GET /users/{id}/roles */
export interface UserRoleResponse {
  id: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly http = inject(HttpClient);

  /**
   * GET /users — combined buyers+sellers list.
   * `types` / `statuses` are sent as repeated query params
   * (e.g. ?types=buyer&types=seller) which Spring binds to List<String>.
   */
  getUsers(params: UserQueryParams = {}): Observable<PageResponse<User>> {
    let httpParams = new HttpParams()
      .set('page', params.page ?? 1)
      .set('limit', params.limit ?? 20);
    const search = params.search?.trim();
    if (search) {
      httpParams = httpParams.set('search', search);
    }
    for (const type of params.types ?? []) {
      httpParams = httpParams.append('types', type);
    }
    for (const status of params.statuses ?? []) {
      httpParams = httpParams.append('statuses', status);
    }
    return this.http.get<PageResponse<User>>(this.apiUrl, { params: httpParams });
  }

  /** GET /users/sellers */
  getSellers(params: SellerQueryParams = {}): Observable<PageResponse<Seller>> {
    let httpParams = new HttpParams()
      .set('page', params.page ?? 1)
      .set('limit', params.limit ?? 20);
    const search = params.search?.trim();
    if (search) {
      httpParams = httpParams.set('search', search);
    }
    return this.http
      .get<PageResponse<Seller>>(`${this.apiUrl}/sellers`, { params: httpParams });
  }

  /** GET /users/sellers/{id} */
  getSellerById(id: string): Observable<Seller> {
    return this.http.get<Seller>(`${this.apiUrl}/sellers/${id}`);
  }

  /** GET /users/{id} — admin view of any user */
  getUser(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${id}`);
  }

  /** PATCH /users/{id} — admin edit of firstName/lastName/phoneNumber */
  updateUser(id: string, request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/${id}`, request);
  }

  /** PATCH /users/{id}/ban -> 204, also revokes the user's sessions */
  banBuyer(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/ban`, {});
  }

  /** PATCH /users/{id}/activate -> 204 */
  activateBuyer(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/activate`, {});
  }

  /** PATCH /users/{id}/role — admin-only role change, revokes the user's tokens */
  changeRole(id: string, role: Role): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/${id}/role`, { role });
  }

  /** GET /users/{id}/roles */
  getUserRoles(id: string): Observable<UserRoleResponse> {
    return this.http.get<UserRoleResponse>(`${this.apiUrl}/${id}/roles`);
  }
}

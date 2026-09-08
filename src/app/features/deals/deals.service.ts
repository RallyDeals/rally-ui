import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PageResponse } from '../products/page-response';
import { DealOverview } from './interfaces/deal-overview';
import { DealDetails } from './interfaces/deal-details';
import { SellerDealsAnalyticsResponse } from './interfaces/seller-deals-analytics-response';
import { DealsQueryParams, DealSortKey } from './interfaces/deals-query-params';
import { CreateDealRequest } from './interfaces/create-deal-request';
import { ActivityEvent } from './interfaces/activity-event';
import { resolveImageUrl } from '../../shared/utils/image-url';
import { DealResponse, toDealOverview } from './deal-overview.mapper';
import { AdminDealsAnalyticsResponse } from './interfaces/admin-deals-analytics-response';

export interface InviteLinkResponse {
  code: string;
  dealId: string;
  referrerUserId: string;
  expiresAt: string;
}

export interface ParticipationResponse{
  id: string,
  dealId: string,
  userId: string,
  referredBy: string | null,
  status: string,
  joinedAt: Date,
  leftAt: Date | null
}

export interface ParticipantSummary {
  userId: string;
  referredBy: string | null;
  joinedAt: string;
  firstName: string;
  lastName: string;
}

interface ParticipantStatusResponse {
  status: string;
}

interface ParticipantsPageResponse {
  participants: ParticipantSummary[];
  activeCount: number;
  page: number;
  size: number;
  totalPages: number;
}

interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
export enum ParticipationStatus {
  PENDING = 'pending',
  ACTIVE='active',
  LEFT='left',
  DECLINED='declined',
}

@Injectable({ providedIn: 'root' })
export class DealsService {
  private readonly baseUrl = `${environment.apiUrl}/deals`;

  constructor(private readonly http: HttpClient) {}

  getSellerDealsAnalytics(): Observable<SellerDealsAnalyticsResponse> {
    return this.http.get<SellerDealsAnalyticsResponse>(`${this.baseUrl}/seller-stats`);
  }

  getAdminDealsAnalytics(): Observable<AdminDealsAnalyticsResponse> {
    return this.http.get<AdminDealsAnalyticsResponse>(`${this.baseUrl}/analytics`);
  }

  getDealsOverview(params: DealsQueryParams = {}): Observable<PageResponse<DealOverview>> {
    const search = params.search?.trim().toLowerCase();
    const status = params.status;
    const categories = params.categories?.length ? params.categories : undefined;
    const sellerId = params.sellerId;
    const productId = params.productId;
    const minPrice = params.minPrice;
    const maxPrice = params.maxPrice;
    const sort = params.sort;
    const page = (params.page ?? 1) - 1;
    const limit = params.limit ?? 10;

    return this.http
      .get<SpringPage<DealResponse>>(this.baseUrl, {
        params: {
          page,
          limit: limit,
          ...(search && { search }),
          ...(status && { status }),
          ...(categories && { categories }),
          ...(sellerId && { sellerId }),
          ...(productId && { productId }),
          ...(minPrice !== undefined && { minPrice }),
          ...(maxPrice !== undefined && { maxPrice }),
          ...(sort && sort !== 'relevance' && { sort }),
        },
      })
      .pipe(
        map((spring): PageResponse<DealOverview> => ({
          items: spring.content.map(toDealOverview),
          page: spring.number + 1,
          limit: spring.size,
          total: spring.totalElements,
        })),
      );
  }

  getSellerDeals(
    sellerId: string,
    params: Omit<DealsQueryParams, 'sellerId'> = {},
  ): Observable<PageResponse<DealOverview>> {
    return this.getDealsOverview({ ...params, sellerId });
  }

  getDealsDetails(id: string): Observable<DealDetails | null> {
    return this.http.get<DealResponse>(`${this.baseUrl}/${id}`).pipe(
      map((res) => ({
        ...toDealOverview(res),
        productDescription: `Group deal for the ${res.productName ?? 'this product'}.`,
        productImages: res.productImageUrl ? [resolveImageUrl(res.productImageUrl)] : [],
      })),
    );
  }

  getDeal(id: string): Observable<DealDetails | null> {
    return this.getDealsDetails(id);
  }

  joinDeal(
    id: string,
    paymentMethodId: string,
    address: string,
    referralCode?: string,
  ): Observable<ParticipationResponse> {
    return this.http.post<ParticipationResponse>(`${this.baseUrl}/${id}/join`, {
      paymentMethodId,
      address,
      ...(referralCode && { referralCode }),
    });
  }

  leaveDeal(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}/leave`);
  }

  getParticipationStatus(dealId: string, participationId: string): Observable<ParticipationStatus> {
    return this.http
      .get<ParticipantStatusResponse>(
        `${environment.apiUrl}/deals/${dealId}/participants/${participationId}`,
      )
      .pipe(map((res) => res.status.toLowerCase() as ParticipationStatus));
  }

  getDealActivity(id: string): Observable<ActivityEvent[]> {
    return this.http.get<ActivityEvent[]>(`${environment.apiUrl}/deals/${id}/activity`);
  }

  createInviteLink(dealId: string): Observable<InviteLinkResponse> {
    return this.http.post<InviteLinkResponse>(
      `${environment.apiUrl}/deals/${dealId}/invite-link`,
      {},
    );
  }

  getDealParticipants(dealId: string): Observable<ParticipantsPageResponse> {
    return this.http.get<ParticipantsPageResponse>(
      `${environment.apiUrl}/deals/${dealId}/participants`,
    );
  }

  createDeal(request: CreateDealRequest): Observable<DealOverview> {
    return this.http.post<DealResponse>(this.baseUrl, request).pipe(map(toDealOverview));
  }

  updateDeal(id: string, request: CreateDealRequest): Observable<DealOverview> {
    const { productId, ...patchBody } = request;
    return this.http
      .patch<DealResponse>(`${this.baseUrl}/${id}`, patchBody)
      .pipe(map(toDealOverview));
  }

  cancelDeal(id: string): Observable<DealOverview | null> {
    return this.http
      .post<DealResponse>(`${this.baseUrl}/${id}/cancel`, {})
      .pipe(map(toDealOverview));
  }
}

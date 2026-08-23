import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PageResponse } from '../products/page-response';
import { DealStatus } from '../../shared/models/deal';
import { DealOverview } from './interfaces/DealOverview';
import { DealDetails } from './interfaces/DealDetails';
import { DealsAnalyticsResponse } from './interfaces/DealsAnalyticsResponse';
import { DealsQueryParams, DealSortKey } from './interfaces/DealsQueryParams';
import { CreateDealRequest } from './interfaces/CreateDealRequest';
import { ActivityEvent } from './interfaces/ActivityEvent';
import { Participation, ParticipationStatus } from './interfaces/Participation';
import { resolveImageUrl } from '../../shared/utils/image-url';

export interface InviteLinkResponse {
  code: string;
  dealId: string;
  referrerUserId: string;
  expiresAt: string;
}

export interface ParticipantSummary {
  userId: string;
  referredBy: string | null;
  joinedAt: string;
}

interface ParticipantStatusResponse {
  status: string;
}

interface ParticipantsPageResponse {
  participants: ParticipantSummary[];
  activeCount: number;
  page: number;
  size: number;
}

interface DealResponse {
  id: string;
  productId: string;
  sellerId: string;
  originalPrice: number;
  dealPrice: number;
  dealStock: number;
  currentParticipants: number;
  authorizedCount: number;
  minParticipants: number;
  status: string;
  startTime: string | null;
  durationMinutes: number;
  endTime: string | null;
  timeRemainingSeconds: number | null;
  createdAt: string;
  productName: string | null;
  productImageUrl: string | null;
  category: string | null;
  sku: string | null;
  sellerName: string | null;
}

interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class DealsService {
  private readonly baseUrl = `${environment.apiUrl}/deals`;

  constructor(private readonly http: HttpClient) {}

  getDealsAnalytics(): Observable<DealsAnalyticsResponse> {
    return this.http.get<DealsAnalyticsResponse>(`${this.baseUrl}/analytics`);
  }

  getDealsOverview(params: DealsQueryParams = {}): Observable<PageResponse<DealOverview>> {
    const search = params.search?.trim().toLowerCase();
    const status = params.status;
    const categories = params.categories?.length ? params.categories : undefined;
    const sellerId = params.sellerId;
    const participantId = params.userId;
    const productId = params.productId;
    const minPrice = params.minPrice;
    const maxPrice = params.maxPrice;
    const sort = params.sort;
    const page = (params.page ?? 1) - 1;
    const limit = params.limit ?? 10;

    return this.http.get<SpringPage<DealResponse>>(this.baseUrl, {
      params: {
        page,
        size: limit,
        ...(search && { search }),
        ...(status && { status }),
        ...(categories && { categories }),
        ...(sellerId && { sellerId }),
        ...(participantId && { participantId }),
        ...(productId && { productId }),
        ...(minPrice !== undefined && { minPrice }),
        ...(maxPrice !== undefined && { maxPrice }),
        ...(sort && sort !== 'relevance' && { sort }),
      },
    }).pipe(
      map((spring) => ({
        items: spring.content.map(this.toDealOverview),
        page: spring.number + 1,
        limit: spring.size,
        total: spring.totalElements,
      })),
    );
  }

  getSellerDeals(sellerId: string, params: Omit<DealsQueryParams, 'sellerId'> = {}): Observable<PageResponse<DealOverview>> {
    return this.getDealsOverview({ ...params, sellerId });
  }

  getMyDeals(buyerId: string, params: Omit<DealsQueryParams, 'userId'> = {}): Observable<PageResponse<DealOverview>> {
    return this.getDealsOverview({ ...params, userId: buyerId });
  }

  getDealsDetails(id: string): Observable<DealDetails | null> {
    return this.http.get<DealResponse>(`${this.baseUrl}/${id}`).pipe(
      map((res) => ({
        ...this.toDealOverview(res),
        productDescription: `Group deal for the ${res.productName ?? 'this product'}.`,
        productImages: res.productImageUrl ? [resolveImageUrl(res.productImageUrl)] : [],
      })),
    );
  }

  getDeal(id: string): Observable<DealDetails | null> {
    return this.getDealsDetails(id);
  }

  joinDeal(id: string, paymentMethodId: string, address: string, referralCode?: string): Observable<Participation> {
    return this.http.post<Participation>(`${this.baseUrl}/${id}/join`, { paymentMethodId, address, ...(referralCode && { referralCode }) });
  }

  leaveDeal(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}/leave`);
  }

  getParticipationStatus(dealId: string, participationId: string): Observable<ParticipationStatus> {
    return this.http
      .get<ParticipantStatusResponse>(`${environment.apiUrl}/deals/${dealId}/participants/${participationId}`)
      .pipe(map((res) => res.status.toLowerCase() as ParticipationStatus));
  }

  getDealActivity(id: string): Observable<ActivityEvent[]> {
    return this.http.get<ActivityEvent[]>(`${environment.apiUrl}/deals/${id}/activity`);
  }

  createInviteLink(dealId: string): Observable<InviteLinkResponse> {
    return this.http.post<InviteLinkResponse>(`${environment.apiUrl}/deals/${dealId}/invite-link`, {});
  }

  getDealParticipants(dealId: string): Observable<ParticipantSummary[]> {
    return this.http.get<ParticipantsPageResponse>(`${environment.apiUrl}/deals/${dealId}/participants`).pipe(
      map((res) => res.participants ?? [])
    );
  }

  createDeal(request: CreateDealRequest): Observable<DealOverview> {
    return this.http.post<DealResponse>(this.baseUrl, request).pipe(
      map(this.toDealOverview),
    );
  }

  updateDeal(id: string, request: CreateDealRequest): Observable<DealOverview> {
    const { productId, ...patchBody } = request;
    return this.http.patch<DealResponse>(`${this.baseUrl}/${id}`, patchBody).pipe(
      map(this.toDealOverview),
    );
  }

  cancelDeal(id: string): Observable<DealOverview | null> {
    return this.http.post<DealResponse>(`${this.baseUrl}/${id}/cancel`, {}).pipe(
      map(this.toDealOverview),
    );
  }

  private toDealOverview(res: DealResponse): DealOverview {
    const neededCount = Math.max(0, res.minParticipants - res.currentParticipants);
    const progressPercent = res.dealStock > 0
      ? Math.min(100, Math.round((res.currentParticipants / res.dealStock) * 100))
      : 0;
    return {
      id: res.id,
      productId: res.productId,
      productName: res.productName ?? 'Unknown Product',
      productImageUrl: resolveImageUrl(res.productImageUrl),
      category: res.category ?? 'Uncategorized',
      sku: res.sku ?? '',
      sellerId: res.sellerId,
      sellerName: res.sellerName ?? '',
      originalPrice: res.originalPrice,
      dealPrice: res.dealPrice,
      dealStock: res.dealStock,
      currentParticipants: res.currentParticipants,
      authorizedCount: res.authorizedCount,
      neededCount,
      progressPercent,
      minParticipants: res.minParticipants,
      status: res.status.toLowerCase() as DealStatus,
      durationMinutes: res.durationMinutes,
      endTime: res.endTime ? new Date(res.endTime) : new Date(),
    };
  }
}

function discountOf(deal: DealOverview): number {
  if (!deal.originalPrice || deal.originalPrice <= 0) {
    return 0;
  }
  return Math.round((1 - deal.dealPrice / deal.originalPrice) * 100);
}

function startTimeOf(deal: DealOverview): number {
  return deal.endTime.getTime() - deal.durationMinutes * 60000;
}

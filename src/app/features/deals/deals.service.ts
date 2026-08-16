import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DealStatus, DealView } from '../../shared/models/deal';
import { Page } from '../../shared/models/page';
import { Product } from '../../shared/models/product';
import { dealBadge } from './deal-badge';

export type { DealView, DealStatus } from '../../shared/models/deal';
export type { Page } from '../../shared/models/page';

export interface DealsCountResponse {
  total: number;
  active: number;
  completed: number;
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
  status: DealStatus;
  startTime: string | null;
  durationMinutes: number;
  endTime: string | null;
  timeRemainingSeconds: number | null;
  createdAt: string;
}

interface DealPageResponse {
  content: DealResponse[];
  page: number;
  size: number;
  totalElements: number;
}

interface CreateDealRequest {
  productId: string;
  dealPrice: number;
  dealStock: number;
  minParticipants: number;
  durationMinutes: number;
}

@Injectable({ providedIn: 'root' })
export class DealsService {
  private readonly baseUrl = `${environment.apiUrl}/deals`;
  private readonly catalogUrl = `${environment.apiUrl}/products`;

  private productCache = new Map<string, Product>();

  constructor(private readonly http: HttpClient) {}

  getDealsCount(): Observable<DealsCountResponse> {
    return new Observable(observer => {
      observer.next({ total: 10, active: 7, completed: 3 });
      observer.complete();
    });
    // return this.http.get<DealsCountResponse>(`${this.apiUrl}/deals/count`);
  }

  getActiveDeals(): Observable<DealView[]> {
    return this.listDeals({ status: 'ACTIVE' }).pipe(
      switchMap((page) => this.enrichDeals(page.content))
    );
  }

  getActiveDeal(id: string): Observable<DealView | null> {
    return this.http.get<DealResponse>(`${this.baseUrl}/${id}`).pipe(
      switchMap((response) => this.enrichDeal(response)),
      map((deal) => deal ?? null)
    );
  }

  getDeal(id: string): Observable<DealView | null> {
    return this.getActiveDeal(id);
  }

  joinDeal(id: string): Observable<DealView | null> {
    return this.http.post<unknown>(`${environment.apiUrl}/deals/${id}/join`, {}).pipe(
      switchMap(() => this.getActiveDeal(id))
    );
  }

  getSellerDeals(
    sellerId: string,
    params: { status?: string; page?: number; size?: number } = {}
  ): Observable<Page<DealView>> {
    return this.listDeals({
      sellerId,
      status: params.status,
      page: params.page ?? 0,
      size: params.size ?? 20,
    }).pipe(
      switchMap((page) =>
        this.enrichDeals(page.content).pipe(
          map((enriched) => ({
            content: enriched,
            page: page.page,
            size: page.size,
            totalElements: page.totalElements,
          }))
        )
      )
    );
  }

  createDeal(request: CreateDealRequest): Observable<DealView> {
    return this.http.post<DealResponse>(this.baseUrl, request).pipe(
      switchMap((response) => this.enrichDeal(response)),
      map((deal) => deal!)
    );
  }

  cancelDeal(id: string): Observable<DealView> {
    return this.http.post<DealResponse>(`${this.baseUrl}/${id}/cancel`, {}).pipe(
      switchMap((response) => this.enrichDeal(response)),
      map((deal) => deal!)
    );
  }

  private listDeals(params: {
    status?: string;
    sellerId?: string;
    productId?: string;
    page?: number;
    size?: number;
  }): Observable<DealPageResponse> {
    let httpParams = new HttpParams();
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.sellerId) httpParams = httpParams.set('sellerId', params.sellerId);
    if (params.productId) httpParams = httpParams.set('productId', params.productId);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size);

    return this.http.get<DealPageResponse>(this.baseUrl, { params: httpParams });
  }

  private enrichDeals(responses: DealResponse[]): Observable<DealView[]> {
    if (responses.length === 0) {
      return of([]);
    }
    return forkJoin(responses.map((r) => this.enrichDeal(r))).pipe(
      map((deals) => deals.filter((d): d is DealView => d !== null))
    );
  }

  private enrichDeal(response: DealResponse): Observable<DealView> {
    const base = this.toDealView(response);
    const cached = this.productCache.get(response.productId);
    if (cached) {
      return of(this.applyProduct(base, cached));
    }
    return this.http.get<Product>(`${this.catalogUrl}/${response.productId}`).pipe(
      map((product) => {
        this.productCache.set(response.productId, product);
        return this.applyProduct(base, product);
      }),
    );
  }

  private applyProduct(deal: DealView, product: Product): DealView {
    return {
      ...deal,
      image: product.imageUrl ?? '',
      imageAlt: product.name,
      title: product.name,
      description: product.description,
      category: product.category ?? null,
      badge: dealBadge(deal),
      product,
    };
  }

  private toDealView(response: DealResponse): DealView {
    return {
      id: response.id,
      productId: response.productId,
      sellerId: response.sellerId,
      originalPrice: response.originalPrice,
      dealPrice: response.dealPrice,
      dealStock: response.dealStock,
      currentParticipants: response.currentParticipants,
      authorizedCount: response.authorizedCount,
      minParticipants: response.minParticipants,
      status: response.status,
      startTime: response.startTime,
      durationMinutes: response.durationMinutes,
      endTime: response.endTime,
      timeRemainingSeconds: response.timeRemainingSeconds,
      createdAt: response.createdAt,
      image: '',
      imageAlt: '',
      title: '',
      description: '',
      badge: { icon: '', text: '', bgClass: '', textClass: '' },
    };
  }
}

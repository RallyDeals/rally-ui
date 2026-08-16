import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../products/page-response';
import { DealStatus } from '../../shared/models/deal';
import { DealOverview } from './interfaces/DealOverview';
import { DealDetails } from './interfaces/DealDetails';
import { DUMMY_DEALS, DUMMY_DEALS_ANALYTICS } from '../../shared/mocks/deals.mock';

export interface DealsAnalyticsResponse {
  totalDeals: number;
  dealsCreatedThisMonth: number;
  activeDeals: number;
  dealsCreatedToday: number;
  completedDeals: number;
  successRate: number;
}
export interface DealsQueryParams {
  search?: string;
  status?: DealStatus;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
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

  getDealsAnalytics(): Observable<DealsAnalyticsResponse> {
    return new Observable(observer => {
      observer.next(DUMMY_DEALS_ANALYTICS);
      observer.complete();
    });
    // return this.http.get<DealsAnalyticsResponse>(`${this.baseUrl}/deals/analytics`);
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
            totalPages: Math.ceil(page.totalElements / page.size),
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

  getDealsOverview(params: DealsQueryParams = {}): Observable<PageResponse<DealOverview>> {
    const search = params.search?.trim().toLowerCase();
    const status = params.status;
    const category = params.category;
    const minPrice = params.minPrice;
    const maxPrice = params.maxPrice;
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    return new Observable(observer => {
      const filtered = DUMMY_DEALS.filter((deal) => {
        const matchesSearch =
          !search ||
          deal.productName.toLowerCase().includes(search) ||
          deal.sku.toLowerCase().includes(search) ||
          deal.sellerName.toLowerCase().includes(search);
        const matchesStatus = !status || deal.status === status;
        const matchesCategory = !category || deal.category === category;
        const matchesMinPrice = minPrice === undefined || deal.dealPrice >= minPrice;
        const matchesMaxPrice = maxPrice === undefined || deal.dealPrice <= maxPrice;
        return matchesSearch && matchesStatus && matchesCategory && matchesMinPrice && matchesMaxPrice;
      });
      const start = (page - 1) * limit;
      observer.next({ items: filtered.slice(start, start + limit), total: filtered.length, page, limit });
      observer.complete();
    });
    // return this.http.get<PageResponse<DealOverview>>(`${this.apiUrl}/deals`, {
    //   params: {
    //     page,
    //     limit,
    //     ...(search && { search }),
    //     ...(status && { status }),
    //     ...(category && { category }),
    //     ...(minPrice !== undefined && { minPrice }),
    //     ...(maxPrice !== undefined && { maxPrice }),
    //   },
    // });
  }

  getDealsDetails(id: string): Observable<DealDetails | null> {
    return new Observable(observer => {
      const deal = DUMMY_DEALS.find((item) => item.id === id);
      observer.next(
        deal
          ? {
            ...deal,
            productDescription: `Group deal for the ${deal.productName}.`,
            productImages: [deal.productImageUrl],
          }
          : null,
      );
      observer.complete();
    });
    // return this.http.get<PageResponse<DealDetails>>(`${this.apiUrl}/deals/{id}`);
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

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

@Injectable({ providedIn: 'root' })
export class DealsService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getDealsAnalytics(): Observable<DealsAnalyticsResponse> {
    return new Observable(observer => {
      observer.next(DUMMY_DEALS_ANALYTICS);
      observer.complete();
    });
    // return this.http.get<DealsAnalyticsResponse>(`${this.apiUrl}/deals/analytics`);
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
}

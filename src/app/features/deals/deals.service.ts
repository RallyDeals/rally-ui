import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../products/page-response';
import { DealStatus } from '../../shared/models/deal';
import { DealOverview } from './interfaces/DealOverview';
import { DealDetails } from './interfaces/DealDetails';
import { DealsAnalyticsResponse } from './interfaces/DealsAnalyticsResponse';
import { DealsQueryParams } from './interfaces/DealsQueryParams';
import { CreateDealRequest } from './interfaces/CreateDealRequest';
import { DUMMY_DEALS, DUMMY_DEALS_ANALYTICS } from '../../shared/mocks/deals.mock';

@Injectable({ providedIn: 'root' })
export class DealsService {
  private readonly baseUrl = `${environment.apiUrl}/deals`;

  constructor(private readonly http: HttpClient) {}

  getDealsAnalytics(): Observable<DealsAnalyticsResponse> {
    return new Observable(observer => {
      observer.next(DUMMY_DEALS_ANALYTICS);
      observer.complete();
    });
    // return this.http.get<DealsAnalyticsResponse>(`${this.baseUrl}/analytics`);
  }

  getDealsOverview(params: DealsQueryParams = {}): Observable<PageResponse<DealOverview>> {
    const search = params.search?.trim().toLowerCase();
    const status = params.status;
    const category = params.category;
    const sellerId = params.sellerId;
    const productId = params.productId;
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
        const matchesSeller = !sellerId || deal.sellerId === sellerId;
        const matchesProduct = !productId || deal.productId === productId;
        const matchesMinPrice = minPrice === undefined || deal.dealPrice >= minPrice;
        const matchesMaxPrice = maxPrice === undefined || deal.dealPrice <= maxPrice;
        return matchesSearch && matchesStatus && matchesCategory && matchesSeller && matchesProduct && matchesMinPrice && matchesMaxPrice;
      });
      const start = (page - 1) * limit;
      observer.next({ items: filtered.slice(start, start + limit), total: filtered.length, page, limit });
      observer.complete();
    });
    // return this.http.get<PageResponse<DealOverview>>(this.baseUrl, {
    //   params: {
    //     page,
    //     limit,
    //     ...(search && { search }),
    //     ...(status && { status }),
    //     ...(category && { category }),
    //     ...(sellerId && { sellerId }),
    //     ...(productId && { productId }),
    //     ...(minPrice !== undefined && { minPrice }),
    //     ...(maxPrice !== undefined && { maxPrice }),
    //   },
    // });
  }

  getSellerDeals(sellerId: string, params: Omit<DealsQueryParams, 'sellerId'> = {}): Observable<PageResponse<DealOverview>> {
    return this.getDealsOverview({ ...params, sellerId });
  }

  getDealsDetails(id: string): Observable<DealDetails | null> {
    return new Observable(observer => {
      const deal = DUMMY_DEALS.find((item) => item.id === id);
      observer.next(deal ? this.toDealDetails(deal) : null);
      observer.complete();
    });
    // return this.http.get<DealDetails>(`${this.baseUrl}/${id}`);
  }

  getDeal(id: string): Observable<DealDetails | null> {
    return this.getDealsDetails(id);
  }

  joinDeal(id: string): Observable<DealDetails | null> {
    return new Observable(observer => {
      const deal = DUMMY_DEALS.find((item) => item.id === id);
      if (deal && deal.currentParticipants < deal.dealStock) {
        const isFirstJoin = deal.status === DealStatus.PENDING && deal.currentParticipants === 0;
        deal.currentParticipants += 1;
        deal.neededCount = Math.max(0, deal.minParticipants - deal.currentParticipants);
        deal.progressPercent = deal.dealStock > 0 ? Math.min(100, Math.round((deal.currentParticipants / deal.dealStock) * 100)) : 0;
        if (isFirstJoin) {
          // Pending deals have no timer until the first participant joins; that join starts the clock.
          deal.status = DealStatus.ACTIVE;
          deal.endTime = new Date(Date.now() + deal.durationMinutes * 60000);
          deal.timeRemainingInSeconds = deal.durationMinutes * 60;
        }
      }
      observer.next(deal ? this.toDealDetails(deal) : null);
      observer.complete();
    });
    // return this.http.post<DealDetails>(`${this.baseUrl}/${id}/join`, {});
  }

  createDeal(request: CreateDealRequest): Observable<DealOverview> {
    return new Observable(observer => {
      const deal: DealOverview = {
        id: crypto.randomUUID(),
        productId: request.productId,
        productName: `Product ${request.productId.slice(0, 8)}`,
        productImageUrl: '',
        category: 'Uncategorized',
        sku: request.productId.slice(0, 8).toUpperCase(),
        sellerId: '',
        sellerName: '',
        originalPrice: request.dealPrice,
        dealPrice: request.dealPrice,
        dealStock: request.dealStock,
        currentParticipants: 0,
        neededCount: request.minParticipants,
        progressPercent: 0,
        minParticipants: request.minParticipants,
        status: DealStatus.PENDING,
        durationMinutes: request.durationMinutes,
        endTime: new Date(Date.now() + request.durationMinutes * 60000),
        timeRemainingInSeconds: request.durationMinutes * 60,
      };
      DUMMY_DEALS.push(deal);
      observer.next(deal);
      observer.complete();
    });
    // return this.http.post<DealOverview>(this.baseUrl, request);
  }

  updateDeal(id: string, request: CreateDealRequest): Observable<DealOverview | null> {
    return new Observable(observer => {
      const deal = DUMMY_DEALS.find((item) => item.id === id);
      if (deal) {
        deal.dealPrice = request.dealPrice;
        deal.dealStock = request.dealStock;
        deal.minParticipants = request.minParticipants;
        deal.durationMinutes = request.durationMinutes;
        deal.endTime = new Date(Date.now() + request.durationMinutes * 60000);
        deal.timeRemainingInSeconds = request.durationMinutes * 60;
      }
      observer.next(deal ?? null);
      observer.complete();
    });
    // return this.http.patch<DealOverview>(`${this.baseUrl}/${id}`, request);
  }

  cancelDeal(id: string): Observable<DealOverview | null> {
    return new Observable(observer => {
      const deal = DUMMY_DEALS.find((item) => item.id === id);
      if (deal) {
        deal.status = DealStatus.CANCELLED;
      }
      observer.next(deal ?? null);
      observer.complete();
    });
    // return this.http.post<DealOverview>(`${this.baseUrl}/${id}/cancel`, {});
  }

  private toDealDetails(deal: DealOverview): DealDetails {
    return {
      ...deal,
      productDescription: `Group deal for the ${deal.productName}.`,
      productImages: [deal.productImageUrl],
    };
  }
}

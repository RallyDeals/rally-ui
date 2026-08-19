import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageResponse } from '../products/page-response';
import { DealStatus } from '../../shared/models/deal';
import { DealOverview } from './interfaces/DealOverview';
import { DealDetails } from './interfaces/DealDetails';
import { DealsAnalyticsResponse } from './interfaces/DealsAnalyticsResponse';
import { DealsQueryParams, DealSortKey } from './interfaces/DealsQueryParams';
import { CreateDealRequest } from './interfaces/CreateDealRequest';
import { ActivityEvent } from './interfaces/ActivityEvent';
import { DUMMY_DEALS, DUMMY_DEALS_ANALYTICS, DUMMY_DEAL_PARTICIPANTS } from '../../shared/mocks/deals.mock';
import { ProductsService } from '../products/products.service';

@Injectable({ providedIn: 'root' })
export class DealsService {
  private readonly baseUrl = `${environment.apiUrl}/deals`;

  constructor(
    private readonly http: HttpClient,
    private readonly productsService: ProductsService,
  ) {}

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
    const categories = params.categories?.length ? params.categories : undefined;
    const sellerId = params.sellerId;
    const participantId = params.userId;
    const productId = params.productId;
    const minPrice = params.minPrice;
    const maxPrice = params.maxPrice;
    const sort = params.sort;
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    return this.http.get<PageResponse<DealOverview>>(this.baseUrl, {
      params: {
        page,
        limit,
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
    });
  }

  private sortDeals(list: DealOverview[], sort?: DealSortKey): DealOverview[] {
    if (!sort || sort === 'relevance') {
      return list;
    }
    const copy = [...list];
    switch (sort) {
      case 'price-asc':
        return copy.sort((a, b) => a.dealPrice - b.dealPrice);
      case 'price-desc':
        return copy.sort((a, b) => b.dealPrice - a.dealPrice);
      case 'discount':
        return copy.sort((a, b) => discountOf(b) - discountOf(a));
      case 'ending-soon':
        return copy.sort((a, b) => a.endTime.getTime() - b.endTime.getTime());
      case 'most-joined':
        return copy.sort((a, b) => b.currentParticipants - a.currentParticipants);
      case 'newest':
        return copy.sort((a, b) => startTimeOf(b) - startTimeOf(a));
      default:
        return copy;
    }
  }

  getSellerDeals(sellerId: string, params: Omit<DealsQueryParams, 'sellerId'> = {}): Observable<PageResponse<DealOverview>> {
    return this.getDealsOverview({ ...params, sellerId });
  }

  // Buyer profile "My Deals": all statuses, scoped to deals this buyer has joined.
  getMyDeals(buyerId: string, params: Omit<DealsQueryParams, 'userId'> = {}): Observable<PageResponse<DealOverview>> {
    return this.getDealsOverview({ ...params, userId: buyerId });
  }

  getDealsDetails(id: string): Observable<DealDetails | null> {
    return this.http.get<DealDetails>(`${this.baseUrl}/${id}`);
  }

  getDeal(id: string): Observable<DealDetails | null> {
    return this.getDealsDetails(id);
  }

  joinDeal(id: string, paymentMethodId: string, address: string, referralCode?: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${id}/join`, { paymentMethodId, address, ...(referralCode && { referralCode }) });
  }

  leaveDeal(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}/leave`);
  }

  getDealActivity(id: string): Observable<ActivityEvent[]> {
    return this.http.get<ActivityEvent[]>(`${environment.apiUrl}/deals/${id}/activity`);
  }

  createDeal(request: CreateDealRequest): Observable<DealOverview> {
    return this.productsService.getProduct(request.productId).pipe(
      map((product) => {
        const deal: DealOverview = {
          id: crypto.randomUUID(),
          productId: request.productId,
          productName: product.name,
          productImageUrl: product.imageUrl ?? '',
          category: product.category?.name ?? 'Uncategorized',
          sku: product.sku ?? '',
          sellerId: product.sellerId,
          sellerName: product.sellerName,
          originalPrice: product.basePrice,
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
        return deal;
      }),
    );
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

function discountOf(deal: DealOverview): number {
  if (!deal.originalPrice || deal.originalPrice <= 0) {
    return 0;
  }
  return Math.round((1 - deal.dealPrice / deal.originalPrice) * 100);
}

// Deals carry no createdAt; the window a deal opened in is derived from when it ends minus how long it ran.
function startTimeOf(deal: DealOverview): number {
  return deal.endTime.getTime() - deal.durationMinutes * 60000;
}

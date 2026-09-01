import { inject, Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { MyProfile } from './interfaces/my-profile';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UpdateProfileRequest, UserProfile } from '../../core/auth/models';
import { AuthService } from '../../core/auth/auth.service';
import { PageResponse } from '../products/page-response';
import { DealOverview } from '../deals/interfaces/deal-overview';
import { DealResponse, toDealOverview } from '../deals/deal-overview.mapper';

export interface MyDealsQueryParams {
  page?: number;
  size?: number;
  participationStatus?: string;
  dealStatus?: string[];
}

export interface MyDealsSummary {
  activeDealsCount: number;
  savedAmount: number;
}

interface MyDealsResponse {
  deals: DealResponse[];
  page: number;
  size: number;
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/profile`;

  /**
   * GET /profile/my-deals — gateway-composed from Participation (the deals this user
   * joined), enriched with each deal's own record and its product display fields.
   */
  getMyDeals(params: MyDealsQueryParams = {}): Observable<PageResponse<DealOverview>> {
    return this.http
      .get<MyDealsResponse>(`${this.apiUrl}/my-deals`, {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
          ...(params.participationStatus && {
            participationStatus: params.participationStatus,
          }),
          ...(params.dealStatus?.length && { dealStatus: params.dealStatus }),
        },
      })
      .pipe(
        map((res) => ({
          items: res.deals.map(toDealOverview),
          page: res.page + 1,
          limit: res.size,
          total: res.totalElements,
        })),
      );
  }

  /**
   * GET /profile/my-deals/summary — totals over the user's entire join history
   * (walks every participation page server-side), not just the currently loaded page.
   */
  getMyDealsSummary(): Observable<MyDealsSummary> {
    return this.http.get<MyDealsSummary>(`${this.apiUrl}/my-deals/summary`);
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../products/page-response';
import { Deal } from '../../shared/models/deal';

export interface DealsCountResponse {
  total: number;
  active:number;
  completed: number
}

@Injectable({ providedIn: 'root' })
export class DealsService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getDealsCount(): Observable<DealsCountResponse> {
    return new Observable(observer => {
      observer.next({ total: 10, active: 7, completed: 3 });
      observer.complete();
    });
    // return this.http.get<DealsCountResponse>(`${this.apiUrl}/deals/count`);
  }
}

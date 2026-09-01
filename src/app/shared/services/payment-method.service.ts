import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreatePaymentMethodRequest, PaymentMethod, PaymentMethodListResponse, SetupIntentResponse } from '../models/payment-method';


@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private http = inject(HttpClient);
  private readonly baseUrl: string = `${environment.apiUrl}/api/payment-methods`;

  getMyPaymentMethods(): Observable<PaymentMethodListResponse> {
    return this.http.get<PaymentMethodListResponse>(`${this.baseUrl}`);
  }

  createSetupIntent(): Observable<SetupIntentResponse> {
    return this.http.post<SetupIntentResponse>(
      `${this.baseUrl}/setup-intent`,
      {},
    );
  }

  createPaymentMethod(request: CreatePaymentMethodRequest): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(`${this.baseUrl}`, request);
  }

  setDefault(id: string): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.baseUrl}/${id}/default`, {});
  }

  deletePaymentMethod(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

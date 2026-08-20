import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

export interface SavedPaymentMethod {
  id: string;
  brand: string;
  lastFourDigits: string;
  expiry: string;
  isDefault: boolean;
}

interface PaymentMethodResponse {
  id: string;
  userId: string;
  type: string;
  isDefault: boolean;
  cardBrand: string;
  cardLast4: string;
  cardExpMonth: string;
  cardExpYear: string;
}

interface SetupIntentResponse {
  setupIntentId: string;
  clientSecret: string;
  requiresAction: boolean;
}

interface ConfirmCreateRequest {
  paymentMethodId: string;
  isDefault: boolean;
}

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  private baseUrl(userId: string): string {
    return `${environment.apiUrl}/api/users/${userId}/payment-methods`;
  }

  listSavedCards(): Observable<SavedPaymentMethod[]> {
    const userId = this.tokenService.getUserId();
    if (!userId) return new Observable<SavedPaymentMethod[]>();
    return this.http.get<{ items: PaymentMethodResponse[] }>(this.baseUrl(userId)).pipe(
      map((res) =>
        (res.items ?? []).map((m) => ({
          id: m.id,
          brand: m.cardBrand ?? 'UNKNOWN',
          lastFourDigits: m.cardLast4 ?? '????',
          expiry: `${m.cardExpMonth?.padStart(2, '0') ?? '??'}/${m.cardExpYear?.slice(-2) ?? '??'}`,
          isDefault: m.isDefault,
        }))
      )
    );
  }

  createSetupIntent(): Observable<SetupIntentResponse> {
    const userId = this.tokenService.getUserId();
    if (!userId) throw new Error('Not authenticated');
    return this.http.post<SetupIntentResponse>(`${this.baseUrl(userId)}/setup-intent`, {});
  }

  confirmAndSave(stripePaymentMethodId: string, isDefault = false): Observable<SavedPaymentMethod> {
    const userId = this.tokenService.getUserId();
    if (!userId) throw new Error('Not authenticated');
    const body: ConfirmCreateRequest = { paymentMethodId: stripePaymentMethodId, isDefault };
    return this.http.post<PaymentMethodResponse>(this.baseUrl(userId), body).pipe(
      map((m) => ({
        id: m.id,
        brand: m.cardBrand ?? 'UNKNOWN',
        lastFourDigits: m.cardLast4 ?? '????',
        expiry: `${m.cardExpMonth?.padStart(2, '0') ?? '??'}/${m.cardExpYear?.slice(-2) ?? '??'}`,
        isDefault: m.isDefault,
      }))
    );
  }
}

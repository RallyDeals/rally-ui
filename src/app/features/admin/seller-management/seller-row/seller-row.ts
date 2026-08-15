import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Seller } from '../../interfaces/seller';

const HIGH_VOLUME_THRESHOLD = 30;
const ACTION_REQUIRED_THRESHOLD = 10;

@Component({
  selector: 'tr[app-seller-row]',
  imports: [DatePipe, RouterLink],
  templateUrl: './seller-row.html',
})
export class SellerRow {
  seller = input.required<Seller>();

  readonly initials = computed(() => this.seller().name.charAt(0).toUpperCase());

  readonly flagLabel = computed<string | undefined>(() => {
    const pendingApprovals = this.seller().pendingApprovals;
    if (pendingApprovals >= HIGH_VOLUME_THRESHOLD) {
      return 'High Volume';
    }
    if (pendingApprovals >= ACTION_REQUIRED_THRESHOLD) {
      return 'Action Required';
    }
    return undefined;
  });

  readonly pulsing = computed(() => this.seller().pendingApprovals >= HIGH_VOLUME_THRESHOLD);
}

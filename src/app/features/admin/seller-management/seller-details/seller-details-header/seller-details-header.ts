import { Component, input } from '@angular/core';
import { Seller } from '../../../interfaces/seller';

@Component({
  selector: 'app-seller-details-header',
  imports: [],
  templateUrl: './seller-details-header.html',
})
export class SellerDetailsHeader {
  seller = input<Seller | null>(null);
  loading = input(false);
}

import { Component, input } from '@angular/core';
import { Seller } from '../../../interfaces/seller';

@Component({
  selector: 'app-seller-details-stats',
  imports: [],
  templateUrl: './seller-details-stats.html',
})
export class SellerDetailsStats {
  seller = input<Seller | null>(null);
}

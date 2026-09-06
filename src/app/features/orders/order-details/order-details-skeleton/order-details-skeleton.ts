import { Component } from '@angular/core';

@Component({
  selector: 'app-order-details-skeleton',
  templateUrl: './order-details-skeleton.html',
})
export class OrderDetailsSkeleton {
  protected readonly skeletonRows = [0, 1, 2];
}

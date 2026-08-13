import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrderHeaderInfo } from '../../interfaces/order-header-info';
import { ShippingStatusBadge } from '../../../../shared/components/shipping-status-badge/shipping-status-badge';
import { OrderStatusBadge } from '../../../../shared/components/order-status-badge/order-status-badge';
import { CancelReasonBanner } from './cancel-reason-banner/cancel-reason-banner';

@Component({
  selector: 'app-order-header',
  imports: [DatePipe, ShippingStatusBadge, OrderStatusBadge, CancelReasonBanner],
  templateUrl: './order-header.html',
})
export class OrderHeader {
  info = input.required<OrderHeaderInfo>();
}

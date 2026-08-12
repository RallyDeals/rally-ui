import { Component } from '@angular/core';
import { OrderHeader } from './order-header/order-header';
import { ShippingAddressCard } from './shipping-address-card/shipping-address-card';
import { PaymentMethodCard } from './payment-method-card/payment-method-card';
import { OrderItemsList } from './order-items-list/order-items-list';
import { OrderSummaryComponent } from './order-summary/order-summary';
import { OrderHeaderInfo } from '../interfaces/order-header-info';
import { PaymentMethod } from '../interfaces/payment-method';
import { OrderItem } from '../interfaces/order-item';
import { OrderSummary } from '../interfaces/order-summary';

@Component({
  selector: 'app-order-details',
  imports: [
    OrderHeader,
    ShippingAddressCard,
    PaymentMethodCard,
    OrderItemsList,
    OrderSummaryComponent,
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails {
  header: OrderHeaderInfo = {
    deliveryType: 'STANDARD DELIVERY',
    placedDateLabel: 'Oct 24, 2024',
    orderNumber: 'R-9210',
    orderStatus: 'CONFIRMED',
    // orderStatus: 'CANCELLED',
    // cancelReason: 'PAYMENT_DECLINED',
    // paymentErrorMessage: 'No enough funds'
    shippingStatus: 'shipped',
  };

  shippingAddress = '2482 High-Tech Boulevard, Suite 400, Palo Alto, CA 94304';

  paymentMethod: PaymentMethod = {
    brand: 'VISA',
    lastFourDigits: '4242',
    expiry: '12/26',
    note: 'Billing matches shipping address',
  };

  orderItems: OrderItem[] = [
    {
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAp6h60RQxOchuGu8_rNKLCcCAciNfY1L3Lm9msdhQ3c0cZgUWDd68mXczHvxbDk6AhH0ISFougDQarGKWcttSJW0TjvgNuHqswGJZ6ec0Exul4a6scGQW2Y4Zkxo9vwUd-95Yq9Qaun8f-8k69-5_m6Biy3h5Ex2obuNqMjBNbQqamRxOrBwIdRUeT_-Kbn_uplzNJ1YvRHIqGfyUH6M7WLJqRaMsbBDUtjfGLf2-81pmbmWQKO0fR',
      imageAlt: 'Minimalist Pour-Over Coffee Set',
      name: 'Minimalist Pour-Over Coffee Set',
      quantity: 1,
      price: '$89.00',
    },
    {
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDCcFpFJvvl1yTF6vlFReDxzyzo-AW5Ukm6kSmhjEM6B8dcgA32eP8QuK6j4YjuqPA7BQQ9qzKirhjv2AQQyK78F_cIevH8FhXoOj-Bn4R045B4yGG_MmKjUpYCCPB5uF9IoGJalviVcDaYUeNxg0Osr_8WhupOLZP9JV6pnAwW-nI9ZtiNTd4SrGbOqGMOcJ4s09WDB6uB8q1OFbgDYcMb1_Cw4Kr__koojNP1DqvP228GGHbSzKsn',
      imageAlt: 'EcoSmart Temp Sensor',
      name: 'EcoSmart Temp Sensor',
      quantity: 1,
      price: '$124.50',
    },
  ];

  orderSummary: OrderSummary = {
    subtotal: '$213.50',
    shippingLabel: 'Shipping (Standard)',
    shippingCost: '$20',
    estimatedTaxes: '$17.08',
    total: '$250.58',
    totalNote: 'Including VAT',
    estimatedDeliveryRange: 'Oct 26 - Oct 28',
  };
}

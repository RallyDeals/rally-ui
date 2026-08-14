import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { DealStatus } from '../../../shared/models/deal';
import { MetricCard } from '../components/metric-card/metric-card';

interface ActivityItem {
  icon: string;
  title: string;
  text: string;
  time: string;
  tone: string;
  filled: boolean;
}

interface DealRow {
  name: string;
  image?: string;
  status: DealStatus;
  statusLabel: string;
  currentParticipants: number;
  dealStock: number;
  progress: number;
  revenue: string;
}

@Component({
  selector: 'app-seller-dashboard',
  imports: [NgClass, MetricCard],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.css',
})
export class SellerDashboard {
  private readonly router = inject(Router);

  readonly productImage = PLACEHOLDER_IMAGE;
  readonly resolveImageUrl = resolveImageUrl;

  readonly selectedDate = signal('');
  readonly onDateChange = ($event: Event) => {
    this.selectedDate.set(($event.target as HTMLInputElement).value);
  };

  goToCreateDeal = () => {
    this.router.navigate(['/seller/deals/new']);
  };

  readonly toneClasses: Record<string, string> = {
    primary: 'bg-surface-container-high text-primary',
    secondary: 'bg-secondary-container text-secondary',
    tertiary: 'bg-tertiary-container text-tertiary',
    'primary-fixed': 'bg-primary-fixed text-primary',
  };

  readonly statusClasses: Record<DealStatus, string> = {
    active: 'bg-surface-container-high text-on-surface-variant',
    succeeded: 'bg-secondary-container text-on-secondary-container',
    pending: 'bg-surface-container text-on-surface-variant',
    failed: 'bg-error-container text-on-error-container',
    cancelled: 'bg-surface-container-high text-on-surface-variant',
  };

  readonly barClasses: Record<DealStatus, string> = {
    active: 'bg-primary-container',
    succeeded: 'bg-secondary',
    pending: 'bg-outline-variant',
    failed: 'bg-error',
    cancelled: 'bg-outline-variant',
  };

  readonly activity: ActivityItem[] = [
    {
      icon: 'shopping_bag',
      tone: 'primary',
      filled: false,
      title: 'New order placed',
      text: 'User \'SarahM\' joined deal "Wireless Earbuds PRO".',
      time: '10 mins ago',
    },
    {
      icon: 'check_circle',
      tone: 'secondary',
      filled: true,
      title: 'Deal Completed!',
      text: '"Smart Home Hub" reached 100% capacity.',
      time: '45 mins ago',
    },
    {
      icon: 'campaign',
      tone: 'primary-fixed',
      filled: false,
      title: 'Deal Published',
      text: '"Ergonomic Office Chair" is now live.',
      time: '2 hours ago',
    },
  ];

  readonly deals: DealRow[] = [
    { name: 'Wireless Earbuds PRO', status: 'active', statusLabel: 'Active', currentParticipants: 42, dealStock: 50, progress: 84, revenue: '$2,100' },
    { name: 'Smart Home Hub', status: 'succeeded', statusLabel: 'Succeeded', currentParticipants: 100, dealStock: 100, progress: 100, revenue: '$8,900' },
  ];
}

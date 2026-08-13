import { Component } from '@angular/core';
import { StatCard } from './stat-card/stat-card';
import { MyDealCard } from './my-deal-card/my-deal-card';
import { DealStat } from '../interfaces/deal-stat';
import { MyDeal } from '../interfaces/my-deal';

@Component({
  selector: 'app-my-deals',
  imports: [StatCard, MyDealCard],
  templateUrl: './my-deals.html',
})
export class MyDeals {
  stats: DealStat[] = [
    {
      label: 'Active Deals',
      value: '3',
      icon: 'bolt',
      iconColorClass: 'text-primary',
      note: '2 nearing completion',
      noteIcon: 'arrow_upward',
      noteColorClass: 'text-secondary',
    },
    {
      label: 'Total Saved',
      value: '$142.50',
      icon: 'savings',
      iconColorClass: 'text-secondary',
      note: 'This month',
    },
  ];

  deals: MyDeal[] = [
    {
      id: 1,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBqXKHnylgjf2SM5o1iz3liSAxMTw8XZno6SN0pEvQ6Pf-0_cJC3hxrD2-d51aaIzfU4svF--RaKLtTlbI3Vra9eBYr8QsvIv_WUxKQa59VZ0nLa1MZ0pa5UdhMJqv30ZE6_asJaBiudgvLQheseiBYQUGzq8C3wrT4fgUOP_yPiEwEOwo3QAyL4A3wX4vPe-2PUQiZFQMSKwmqcwIvgMlYDmoMjbm0Sjti4iqmFU1rRiGJoS6I4uupsOb1Rc_tIZ6MZaeF83EiXWM',
      imageAlt: 'Sony WH-1000XM5 Headphones',
      title: 'Sony WH-1000XM5 Headphones',
      statusLabel: 'Urgent',
      statusBadgeClass: 'bg-error-container text-on-error-container',
      timeLabel: '12h left',
      timeIcon: 'timer',
      timeTextClass: 'text-primary',
      price: 249.99,
      originalPrice: 399.99,
      joined: 42,
      totalSpots: 50,
      progressPercent: 84,
      isCompleted: false,
    },
    {
      id: 2,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDo2sDZj7Tqt_pThH_6fO6pwEDbbLKkBaSaiB7XJEF-_nX8Mf_ayrqY9bAOUn_kHlsR49jFLsctybihKD8djAhE2QekWsgRtmb2yQgFGd2HeHS-YdA3uISr9vGwLE5gVF5LFjXXoItfUbEh-0xiFATgUZKWxGg9ae0JaLnigOx9BT_WWfX5XUvGZ3X_46iNGTjgy2_NMIcdHLpA62ZmB1Kb86-sk0cy0slG1emdgtEMSPAqye0IKFZdXradY_In98jUEBQ5VN-J5o0',
      imageAlt: 'Artisanal Coffee Set',
      title: 'Artisanal Pour-Over Set',
      statusLabel: 'Active',
      statusBadgeClass: 'bg-secondary-container text-on-secondary-container',
      timeLabel: '2d left',
      timeIcon: 'timer',
      timeTextClass: 'text-on-surface',
      price: 45.0,
      originalPrice: 75.0,
      joined: 15,
      totalSpots: 100,
      progressPercent: 15,
      isCompleted: false,
    },
    {
      id: 3,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCkvClMBIYfJYJXqdlx6fdjmXR_iFGIXer8rXZKjGuERKnZ9MMcNEeFJGJiaV-wd9UsQ7OVoqiRzdikRa6YWxoUvqTi8PaS48t7NhHI3x2FZzw8wR0CDdjahSYvTHgnsLtE2n15wBmDwB5Oe-m3lRxireeUuVhRmOMcW6JzpADHTpolwTrHeSuBhwq49ghsbkeNDQrElCQ7LbYH3c8Ovd22Sz11UJ1eqlGaGfov9OEK-maZmrh_bjki',
      imageAlt: 'Smart Watch',
      title: 'Series 8 Smart Watch',
      statusLabel: 'Completed',
      statusBadgeClass: 'bg-surface-container-high text-on-surface-variant',
      timeLabel: 'Ended',
      timeIcon: 'check_circle',
      timeTextClass: 'text-on-surface-variant',
      price: 199.0,
      originalPrice: 349.0,
      joined: 50,
      totalSpots: 50,
      progressPercent: 100,
      isCompleted: true,
    },
  ];
}

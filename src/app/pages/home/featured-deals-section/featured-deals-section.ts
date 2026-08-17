import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DealCard } from './deal-card/deal-card';
import { DealStatus } from '../../../shared/models/deal';
import { DealOverview } from '../../../features/deals/interfaces/DealOverview';

const hoursFromNow = (hours: number): Date => new Date(Date.now() + hours * 60 * 60 * 1000);

@Component({
  selector: 'app-featured-deals-section',
  imports: [DealCard, RouterLink],
  templateUrl: './featured-deals-section.html',
})
export class FeaturedDealsSection {
  deals: DealOverview[] = [
    {
      id: '8e2b0a2f-1111-4000-8000-000000000101',
      productId: '43326b0f-3f5a-7b34-1eb0-6e39aea121b7',
      productName: 'AuraTech Pro Noise Canceling Headphones',
      productImageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC1je5hKQEew_DKnev-fBRklI9fyrGub7O1rzQph5cXnvuJhzJWwMNLzN9N65U1sBDw4rNjdkUXc24Vz89evSwsiOR4WjwoJnecn49BrfSTvn5RR31e33mfCp5B0nmKDsxU-hbAAwc8N_MSIPUJWcEP6PzAvjzH3RbWHfskqXU3xXcSvWlWU8ltyVp7JR7kkh7j1eAgRMR9aai30vRKe97Zouqdm4zWbRU7IoeyA4CQs27hHaqS_xNJf0yCWaozLsUGRjbd39sXV8M',
      category: 'Electronics',
      sku: 'AUR-HP-BLK-001',
      sellerId: '3e2c1b0a-2222-4000-9000-000000000001',
      sellerName: 'AuraTech',
      originalPrice: 249,
      dealPrice: 149,
      dealStock: 30,
      currentParticipants: 25,
      neededCount: 5,
      progressPercent: 83,
      minParticipants: 10,
      status: DealStatus.ACTIVE,
      durationMinutes: 1440,
      endTime: hoursFromNow(4),
      timeRemainingInSeconds: 4 * 3600,
    },
    {
      id: '8e2b0a2f-1111-4000-8000-000000000102',
      productId: '23cb533f-d49b-1168-7f82-8ec86e656313',
      productName: 'Lumina 4K Portable Smart Projector',
      productImageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD62NIOdDtK1qtf_8Uy2d6yrMxQPhfME03qpxPGSKHiBaaHFdnjApTumFrKxRO0bdwRwpKhYRF4MtT-eQx8QmwVjfMQViTYKCHuOTC871mBuwyPcdJXZZpOJCIYiZV8vsntLqNbZ24VyqNTdpCNvnb1eFkIMDdhMs9APAzhbNJriuEutGpWHLEU0kKSrHfhOrxCWVJ_IvEUE4_0tZuTkrP8Hp2hw4LHgczOL2ox6GlPuOtxqZRAZE3_Y4Ij1RPTkud88cYYPMPAa_M',
      category: 'Electronics',
      sku: 'LUM-PRJ-4K-002',
      sellerId: '3e2c1b0a-2222-4000-9000-000000000002',
      sellerName: 'Lumina Home',
      originalPrice: 599,
      dealPrice: 399,
      dealStock: 50,
      currentParticipants: 42,
      neededCount: 8,
      progressPercent: 84,
      minParticipants: 40,
      status: DealStatus.ACTIVE,
      durationMinutes: 4320,
      endTime: hoursFromNow(24),
      timeRemainingInSeconds: 24 * 3600,
    },
    {
      id: '8e2b0a2f-1111-4000-8000-000000000103',
      productId: '20689b6f-d578-784d-bb4a-525e24aa4c33',
      productName: 'KeyCraft V2 Mechanical Keyboard',
      productImageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA996b8rbJp79qYPW3XroQ2LXYjI5ovwl1w8IxwWP0hqs8EIj1CSKrj1AnTqhiJa7_VZ4NZZBpjuac1LMtBYi5OJlttITxHUStCzXQxrpG2MEagjD-LK7KvsRbL3bKItJhyzu0Z9VCM5YzBfpnkA9LnBC47GRbQmdE78-ptew0t0NAjwLB5IO8csCUSHiqKHjymLz81RU5m5a8FhlLVD3iR7k_xGtsXd1QN3U6qhwYYCzytDNrrcIp5WxpAWyHgIRYCbsP82mBJn0g',
      category: 'Electronics',
      sku: 'KEY-CFT-V2-003',
      sellerId: '3e2c1b0a-2222-4000-9000-000000000003',
      sellerName: 'KeyCraft',
      originalPrice: 160,
      dealPrice: 119,
      dealStock: 100,
      currentParticipants: 12,
      neededCount: 13,
      progressPercent: 12,
      minParticipants: 50,
      status: DealStatus.PENDING,
      durationMinutes: 2880,
      endTime: hoursFromNow(46),
      timeRemainingInSeconds: 46 * 3600,
    },
  ];
}

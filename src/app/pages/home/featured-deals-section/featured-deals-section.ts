import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DealCard } from './deal-card/deal-card';
import { Deal } from './deal';

@Component({
  selector: 'app-featured-deals-section',
  imports: [DealCard, RouterLink],
  templateUrl: './featured-deals-section.html',
})
export class FeaturedDealsSection {
  deals: Deal[] = [
    {
      id: 1,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC1je5hKQEew_DKnev-fBRklI9fyrGub7O1rzQph5cXnvuJhzJWwMNLzN9N65U1sBDw4rNjdkUXc24Vz89evSwsiOR4WjwoJnecn49BrfSTvn5RR31e33mfCp5B0nmKDsxU-hbAAwc8N_MSIPUJWcEP6PzAvjzH3RbWHfskqXU3xXcSvWlWU8ltyVp7JR7kkh7j1eAgRMR9aai30vRKe97Zouqdm4zWbRU7IoeyA4CQs27hHaqS_xNJf0yCWaozLsUGRjbd39sXV8M',
      imageAlt: 'AuraTech Pro Noise Canceling Headphones',
      badge: {
        icon: 'timer',
        text: '12h 45m left',
        bgClass: 'bg-tertiary-container/30',
        textClass: 'text-on-tertiary-container',
      },
      joined: 25,
      minimum_participants: 10,
      totalSpots: 30,
      title: 'AuraTech Pro Noise Canceling Headphones',
      description:
        'Premium immersive audio experience with 40-hour battery life and adaptive ANC technology.',
      originalPrice: 149,
      dealPrice: 249,
      neededCount: 5,
      progressPercent: 83,
    },
    {
      id: 2,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD62NIOdDtK1qtf_8Uy2d6yrMxQPhfME03qpxPGSKHiBaaHFdnjApTumFrKxRO0bdwRwpKhYRF4MtT-eQx8QmwVjfMQViTYKCHuOTC871mBuwyPcdJXZZpOJCIYiZV8vsntLqNbZ24VyqNTdpCNvnb1eFkIMDdhMs9APAzhbNJriuEutGpWHLEU0kKSrHfhOrxCWVJ_IvEUE4_0tZuTkrP8Hp2hw4LHgczOL2ox6GlPuOtxqZRAZE3_Y4Ij1RPTkud88cYYPMPAa_M',
      imageAlt: 'Lumina 4K Portable Smart Projector',
      badge: {
        icon: 'local_fire_department',
        text: 'High Demand',
        bgClass: 'bg-error-container/30',
        textClass: 'text-on-error-container',
      },
      joined: 42,
      minimum_participants: 40,
      totalSpots: 50,
      title: 'Lumina 4K Portable Smart Projector',
      description:
        'Transform any room into a cinematic experience with native 4K resolution and built-in Android TV.',
      originalPrice: 599,
      dealPrice: 399,
      neededCount: 8,
      progressPercent: 84,
    },
    {
      id: 3,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA996b8rbJp79qYPW3XroQ2LXYjI5ovwl1w8IxwWP0hqs8EIj1CSKrj1AnTqhiJa7_VZ4NZZBpjuac1LMtBYi5OJlttITxHUStCzXQxrpG2MEagjD-LK7KvsRbL3bKItJhyzu0Z9VCM5YzBfpnkA9LnBC47GRbQmdE78-ptew0t0NAjwLB5IO8csCUSHiqKHjymLz81RU5m5a8FhlLVD3iR7k_xGtsXd1QN3U6qhwYYCzytDNrrcIp5WxpAWyHgIRYCbsP82mBJn0g',
      imageAlt: 'KeyCraft V2 Mechanical Keyboard',
      badge: {
        icon: 'new_releases',
        text: 'Just Added',
        bgClass: 'bg-secondary-container/30',
        textClass: 'text-on-secondary-container',
      },
      joined: 12,
      minimum_participants: 50,
      totalSpots: 100,
      title: 'KeyCraft V2 Mechanical Keyboard',
      description:
        'Customizable tactile switches, RGB underglow, and an aerospace-grade aluminum chassis.',
      originalPrice: 119,
      dealPrice: 160,
      neededCount: 13,
      progressPercent: 12,
    },
  ];
}

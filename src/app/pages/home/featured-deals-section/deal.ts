export interface DealBadge {
  icon: string;
  text: string;
  bgClass: string;
  textClass: string;
}

export interface Deal {
  id: number;
  image: string;
  imageAlt: string;
  badge: DealBadge;
  joined: number;
  minimum_participants: number;
  totalSpots: number;
  title: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  neededCount: number;
  progressPercent: number;
}

import { Deal } from '../../pages/home/featured-deals-section/deal';

export interface MockDeal extends Deal {
  productId: string;
  endsAt: string;
  createdAt: string;
}

// productId maps to the seeded catalog products. The catalog rewrites seed ids
// ('dummy-0078') to deterministic UUIDs (md5(id)::uuid) — see V3__convert_seed_ids_to_uuid.sql.
const CATALOG_PRODUCT_IDS = {
  'dummy-0078': '43326b0f-3f5a-7b34-1eb0-6e39aea121b7',
  'dummy-0088': '23cb533f-d49b-1168-7f82-8ec86e656313',
  'dummy-0001': '20689b6f-d578-784d-bb4a-525e24aa4c33',
} as const;

const hoursFromNow = (hours: number): string =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

export const MOCK_ACTIVE_DEALS: MockDeal[] = [
  {
    id: 101,
    productId: CATALOG_PRODUCT_IDS['dummy-0078'],
    image:
      'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp',
    imageAlt: 'Apple MacBook Pro 14 Inch Space Grey',
    badge: {
      icon: 'timer',
      text: 'Ending Soon',
      bgClass: 'bg-error-container/90',
      textClass: 'text-on-error-container',
    },
    joined: 142,
    minimum_participants: 40,
    totalSpots: 200,
    title: 'Apple MacBook Pro 14 Inch Space Grey',
    description:
      'Group deal for the Apple MacBook Pro 14 Inch — M1 Pro chip and a stunning Retina display.',
    originalPrice: 1999.99,
    dealPrice: 1799.99,
    neededCount: 58,
    progressPercent: 71,
    endsAt: hoursFromNow(4),
    createdAt: hoursFromNow(-48),
  },
  {
    id: 102,
    productId: CATALOG_PRODUCT_IDS['dummy-0088'],
    image:
      'https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp',
    imageAlt: 'Nike Air Jordan 1 Red And Black',
    badge: {
      icon: 'local_fire_department',
      text: 'Trending',
      bgClass: 'bg-primary-container/10',
      textClass: 'text-primary',
    },
    joined: 78,
    minimum_participants: 50,
    totalSpots: 120,
    title: 'Nike Air Jordan 1 Red And Black',
    description:
      'Group deal on the iconic Air Jordan 1 — high-performance and head-turning style.',
    originalPrice: 149.99,
    dealPrice: 119.99,
    neededCount: 42,
    progressPercent: 65,
    endsAt: hoursFromNow(20),
    createdAt: hoursFromNow(-72),
  },
  {
    id: 103,
    productId: CATALOG_PRODUCT_IDS['dummy-0001'],
    image:
      'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
    imageAlt: 'Essence Mascara Lash Princess',
    badge: {
      icon: 'timer',
      text: 'Ending Soon',
      bgClass: 'bg-error-container/90',
      textClass: 'text-on-error-container',
    },
    joined: 260,
    minimum_participants: 100,
    totalSpots: 400,
    title: 'Essence Mascara Lash Princess',
    description:
      'Group deal for the viral Lash Princess mascara — volumizing, lengthening and cruelty-free.',
    originalPrice: 9.99,
    dealPrice: 7.99,
    neededCount: 140,
    progressPercent: 65,
    endsAt: hoursFromNow(48),
    createdAt: hoursFromNow(-24),
  },
];

const DEAL_BY_PRODUCT = new Map(MOCK_ACTIVE_DEALS.map((deal) => [deal.productId, deal]));

export function getActiveDealForProduct(productId: string): MockDeal | undefined {
  return DEAL_BY_PRODUCT.get(productId);
}

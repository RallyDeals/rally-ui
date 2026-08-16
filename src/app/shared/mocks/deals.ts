import { DealView } from '../models/deal';
import { Category } from '../models/category';

export type MockDeal = DealView;

// Category ids match the catalog seed (V2__seed_catalog_data.sql). Kept on the
// deal mock so the browse-deals category filter works even when the catalog
// can't be reached (mergeProduct overwrites with the live catalog category).
const CATEGORY_ELECTRONICS: Category = {
  id: 'cat-seed-electronics',
  name: 'Electronics',
  description: 'Laptops, devices and mobile accessories',
  createdAt: '',
};
const CATEGORY_HOME: Category = {
  id: 'cat-seed-home',
  name: 'Home & Furniture',
  description: 'Furniture and decor for your home',
  createdAt: '',
};
const CATEGORY_SHOES: Category = {
  id: 'cat-seed-shoes',
  name: 'Shoes',
  description: 'Footwear for every occasion',
  createdAt: '',
};
const CATEGORY_BEAUTY: Category = {
  id: 'cat-seed-beauty',
  name: 'Beauty & Fragrance',
  description: 'Skincare, makeup and fragrances',
  createdAt: '',
};

// productId maps to the seeded catalog products. The catalog rewrites seed ids
// ('dummy-0078') to deterministic UUIDs (md5(id)::uuid) — see V3__convert_seed_ids_to_uuid.sql.
const CATALOG_PRODUCT_IDS = {
  'dummy-0078': '43326b0f-3f5a-7b34-1eb0-6e39aea121b7',
  'dummy-0088': '23cb533f-d49b-1168-7f82-8ec86e656313',
  'dummy-0001': '20689b6f-d578-784d-bb4a-525e24aa4c33',
} as const;

// Seller-demo deals reference products seeded in V6__seed_deal_products.sql
// using the same md5(id)::uuid conversion.
const DEAL_PRODUCT_IDS = {
  'dummy-0200': '2bf8a0ab-103d-f678-290b-bf4b1762fd01',
  'dummy-0201': 'fcf79a97-1202-28e3-7937-66b59b744a1a',
  'dummy-0202': '419c9562-6d38-1da9-47b2-b59e8fb16a70',
  'dummy-0203': '60930722-39b4-9b3a-3f08-07c0926e5450',
  'dummy-0204': '5a5352fb-86a2-ce81-d8ce-c746fb16a9c7',
  'dummy-0205': '52a9f1b9-ee61-ee54-eba2-2532c5d138ef',
} as const;

export const SELLER_ID = '3e2c1b0a-2222-4000-9000-000000000001';

const hoursFromNow = (hours: number): string =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

// Single in-memory deal store shared by the buyer and seller surfaces. It mocks
// the DealService repository, so CRUD here reflects everywhere in the app.
const DEAL_STORE: DealView[] = [
  {
    id: '8e2b0a2f-1111-4000-8000-000000000101',
    productId: CATALOG_PRODUCT_IDS['dummy-0078'],
    sellerId: SELLER_ID,
    category: CATEGORY_ELECTRONICS,
    image:
      'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp',
    imageAlt: 'Apple MacBook Pro 14 Inch Space Grey',
    badge: {
      icon: 'timer',
      text: 'Ending Soon',
      bgClass: 'bg-error-container/90',
      textClass: 'text-on-error-container',
    },
    title: 'Apple MacBook Pro 14 Inch Space Grey',
    description:
      'Group deal for the Apple MacBook Pro 14 Inch — M1 Pro chip and a stunning Retina display.',
    currentParticipants: 142,
    authorizedCount: 142,
    minParticipants: 40,
    dealStock: 200,
    originalPrice: 1999.99,
    dealPrice: 1799.99,
    status: 'ACTIVE',
    startTime: hoursFromNow(-92),
    durationMinutes: 5760,
    endTime: hoursFromNow(4),
    timeRemainingSeconds: 4 * 3600,
    createdAt: hoursFromNow(-96),
  },
  {
    id: '8e2b0a2f-1111-4000-8000-000000000102',
    productId: CATALOG_PRODUCT_IDS['dummy-0088'],
    sellerId: SELLER_ID,
    category: CATEGORY_SHOES,
    image:
      'https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp',
    imageAlt: 'Nike Air Jordan 1 Red And Black',
    badge: {
      icon: 'local_fire_department',
      text: 'Trending',
      bgClass: 'bg-primary-container/10',
      textClass: 'text-primary',
    },
    title: 'Nike Air Jordan 1 Red And Black',
    description:
      'Group deal on the iconic Air Jordan 1 — high-performance and head-turning style.',
    currentParticipants: 78,
    authorizedCount: 78,
    minParticipants: 50,
    dealStock: 120,
    originalPrice: 149.99,
    dealPrice: 119.99,
    status: 'ACTIVE',
    startTime: hoursFromNow(-124),
    durationMinutes: 8640,
    endTime: hoursFromNow(20),
    timeRemainingSeconds: 20 * 3600,
    createdAt: hoursFromNow(-144),
  },
  {
    id: '8e2b0a2f-1111-4000-8000-000000000104',
    productId: CATALOG_PRODUCT_IDS['dummy-0088'],
    sellerId: SELLER_ID,
    category: CATEGORY_SHOES,
    image:
      'https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp',
    imageAlt: 'Nike Air Jordan 1 Red And Black',
    badge: {
      icon: 'timer',
      text: 'Ending Soon',
      bgClass: 'bg-error-container/90',
      textClass: 'text-on-error-container',
    },
    title: 'Nike Air Jordan 1 Red And Black — Flash Drop',
    description:
      'Limited flash drop on the Air Jordan 1. Deeper discount for a short window only.',
    currentParticipants: 30,
    authorizedCount: 30,
    minParticipants: 25,
    dealStock: 50,
    originalPrice: 149.99,
    dealPrice: 99.99,
    status: 'ACTIVE',
    startTime: hoursFromNow(-1),
    durationMinutes: 240,
    endTime: hoursFromNow(3),
    timeRemainingSeconds: 3 * 3600,
    createdAt: hoursFromNow(-2),
  },
  {
    id: '8e2b0a2f-1111-4000-8000-000000000105',
    productId: CATALOG_PRODUCT_IDS['dummy-0088'],
    sellerId: SELLER_ID,
    category: CATEGORY_SHOES,
    image:
      'https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp',
    imageAlt: 'Nike Air Jordan 1 Red And Black',
    badge: {
      icon: 'new_releases',
      text: 'Just Added',
      bgClass: 'bg-secondary-container/30',
      textClass: 'text-on-secondary-container',
    },
    title: 'Nike Air Jordan 1 Red And Black — Bulk',
    description:
      'High-volume group deal on the Air Jordan 1 for large groups. Slightly smaller discount.',
    currentParticipants: 210,
    authorizedCount: 210,
    minParticipants: 100,
    dealStock: 500,
    originalPrice: 149.99,
    dealPrice: 129.99,
    status: 'ACTIVE',
    startTime: hoursFromNow(-6),
    durationMinutes: 4320,
    endTime: hoursFromNow(66),
    timeRemainingSeconds: 66 * 3600,
    createdAt: hoursFromNow(-12),
  },
  {
    id: '8e2b0a2f-1111-4000-8000-000000000106',
    productId: CATALOG_PRODUCT_IDS['dummy-0088'],
    sellerId: SELLER_ID,
    category: CATEGORY_SHOES,
    image:
      'https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp',
    imageAlt: 'Nike Air Jordan 1 Red And Black',
    badge: {
      icon: 'groups',
      text: 'Gathering',
      bgClass: 'bg-surface-container-high/60',
      textClass: 'text-on-surface-variant',
    },
    title: 'Nike Air Jordan 1 Red And Black — Pre-Launch',
    description:
      'Early-bird group deal ahead of the next restock. Lock the price before it goes up.',
    currentParticipants: 12,
    authorizedCount: 12,
    minParticipants: 60,
    dealStock: 150,
    originalPrice: 149.99,
    dealPrice: 109.99,
    status: 'ACTIVE',
    startTime: hoursFromNow(-1),
    durationMinutes: 2880,
    endTime: hoursFromNow(47),
    timeRemainingSeconds: 47 * 3600,
    createdAt: hoursFromNow(-4),
  },
  {
    id: '8e2b0a2f-1111-4000-8000-000000000103',
    productId: CATALOG_PRODUCT_IDS['dummy-0001'],
    sellerId: SELLER_ID,
    category: CATEGORY_BEAUTY,
    image:
      'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
    imageAlt: 'Essence Mascara Lash Princess',
    badge: {
      icon: 'local_fire_department',
      text: 'Popular',
      bgClass: 'bg-primary-container/10',
      textClass: 'text-primary',
    },
    title: 'Essence Mascara Lash Princess',
    description:
      'Group deal for the viral Lash Princess mascara — volumizing, lengthening and cruelty-free.',
    currentParticipants: 260,
    authorizedCount: 260,
    minParticipants: 100,
    dealStock: 400,
    originalPrice: 9.99,
    dealPrice: 7.99,
    status: 'ACTIVE',
    startTime: hoursFromNow(-120),
    durationMinutes: 4320,
    endTime: hoursFromNow(48),
    timeRemainingSeconds: 48 * 3600,
    createdAt: hoursFromNow(-168),
  },
  {
    id: '8e2b0a2f-3333-4000-8000-000000000201',
    productId: DEAL_PRODUCT_IDS['dummy-0200'],
    sellerId: SELLER_ID,
    category: CATEGORY_HOME,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSGkOu2tweFMl4s3ixgYD5Q2-gIzYt3WNvn3sJKDRFXRhCgb_XCTPoGbMspTbBu3sISO2ldSINv62qtessJlzvwOglK_cdJiNJsopUA-MFNmmOxR57AqoqHNC-pbY_Arx8sh2pvE-gjDRzTGMYM4QYvbg4LdlJkLTNP5nwBUF2NaGhwaPQG2hzAOWFjS0VVFlYPl_f0UlCl6hKd690Hq0U6BTY9oK4tfBek9EJFhte6Oxl98cNUXhcKOVz9ANdO-4HyXH9G4y5CwE',
    imageAlt: 'Artisan Ceramic Brew Set',
    badge: {
      icon: 'local_fire_department',
      text: 'Trending',
      bgClass: 'bg-primary-container/10',
      textClass: 'text-primary',
    },
    title: 'Artisan Ceramic Brew Set',
    description: 'Group deal for the Artisan Ceramic Brew Set.',
    currentParticipants: 142,
    authorizedCount: 142,
    dealStock: 200,
    minParticipants: 40,
    durationMinutes: 2880,
    startTime: hoursFromNow(-3),
    dealPrice: 34.99,
    originalPrice: 49.99,
    endTime: hoursFromNow(45),
    timeRemainingSeconds: null,
    createdAt: hoursFromNow(-24),
    status: 'ACTIVE',
  },
  {
    id: '8e2b0a2f-3333-4000-8000-000000000202',
    productId: DEAL_PRODUCT_IDS['dummy-0201'],
    sellerId: SELLER_ID,
    category: CATEGORY_ELECTRONICS,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwUCxSF-_QRIwIV2buXvV9w90sb7E4VDit2cGcMWMpQ-ntIOypgE1uOgxBWky-11Kyfj2626OfQ3RLftzl032QrFxFm5NQtgK-7jcbUKgsqIJtgFCx4QZrLH9vi3cxMjvpsqtySdpAYX-IygEzvJd4xweayGHNmgA9nCPmOiEubP7L2a4l3kTeqF9xB68WdR3CRAwDv_LS_VoVtoh7ajAgJDijm-rX_Hn0lSYv8Nl3-nX2fzit42S4STLWdi8935or6VJjIfTW-e4',
    imageAlt: 'Sonic Pro Wireless',
    badge: {
      icon: 'task_alt',
      text: 'Succeeded',
      bgClass: 'bg-secondary-container/30',
      textClass: 'text-on-secondary-container',
    },
    title: 'Sonic Pro Wireless',
    description: 'Group deal for the Sonic Pro Wireless.',
    currentParticipants: 500,
    authorizedCount: 500,
    dealStock: 500,
    minParticipants: 100,
    durationMinutes: 10080,
    startTime: '2026-08-04T10:00:00',
    dealPrice: 129.0,
    originalPrice: 199.0,
    endTime: '2026-08-11T10:00:00',
    timeRemainingSeconds: null,
    createdAt: '2026-08-01T09:00:00',
    status: 'SUCCEEDED',
  },
  {
    id: '8e2b0a2f-3333-4000-8000-000000000203',
    productId: DEAL_PRODUCT_IDS['dummy-0202'],
    sellerId: SELLER_ID,
    category: CATEGORY_HOME,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdum2tVVRwEgwEWwqrdWvCFaQ18f32GUkCr1O69zLXM6H1eCabBS_brs81RRYd54giYLj9iHwE45mweyusCcd8zdq6aMe2waSf8ThKpgAoKBAnL2RZnzobMoq05BpD0aBXK3o9Dow9ZrhBoSpwSY_3C0t47FnxP0icnOA9kLcTO7QYux1w7Du_7xSIEGCt_olhmbsSzJ1wp1kAakor2jpdjWT21RK_jo3-Fpphtg1v0bx_y-Nnsprn2Q7nk6ANAAAk16IJDzSca-Q',
    imageAlt: 'AquaSmart Hydration',
    badge: {
      icon: 'new_releases',
      text: 'Just Added',
      bgClass: 'bg-secondary-container/30',
      textClass: 'text-on-secondary-container',
    },
    title: 'AquaSmart Hydration',
    description: 'Group deal for the AquaSmart Hydration bottle.',
    currentParticipants: 0,
    authorizedCount: 0,
    dealStock: 150,
    minParticipants: 60,
    durationMinutes: 1440,
    startTime: hoursFromNow(-6),
    dealPrice: 22.5,
    originalPrice: 30.0,
    endTime: hoursFromNow(30),
    timeRemainingSeconds: null,
    createdAt: hoursFromNow(-4),
    status: 'ACTIVE',
  },
  {
    id: '8e2b0a2f-3333-4000-8000-000000000204',
    productId: DEAL_PRODUCT_IDS['dummy-0203'],
    sellerId: SELLER_ID,
    category: CATEGORY_ELECTRONICS,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDSmxS5Ux__--cPa3idO0LDpBMCzclCXsfH9YZpuq_qCY68xq2e2a5Mz05VS-9EuHJUK6_JNKPatVi-ar2aj_bN1XgCOUsIggbsuEOxjd_rsbrt-qE4IHOxZffbAyrlWLH2jt9kKuHALmtsCh437hYj6uH1Bl4dEjxG_woOwSM10AfytRrBvS-uB6d2rHOZBohrs29-S8ydsNfot9BGb6EbNl_AJ2SPaxm1K9rogyNlU_qgvuGsHu_4mVXjVxTU1z_lUAXhS2aAEg',
    imageAlt: 'EcoTech Tech Pouch',
    badge: {
      icon: 'local_fire_department',
      text: 'Trending',
      bgClass: 'bg-primary-container/10',
      textClass: 'text-primary',
    },
    title: 'EcoTech Tech Pouch',
    description: 'Group deal for the EcoTech Tech Pouch.',
    currentParticipants: 42,
    authorizedCount: 42,
    dealStock: 100,
    minParticipants: 80,
    durationMinutes: 4320,
    startTime: hoursFromNow(-24),
    dealPrice: 15.0,
    originalPrice: 25.0,
    endTime: hoursFromNow(12),
    timeRemainingSeconds: null,
    createdAt: hoursFromNow(-48),
    status: 'ACTIVE',
  },
  {
    id: '8e2b0a2f-3333-4000-8000-000000000205',
    productId: DEAL_PRODUCT_IDS['dummy-0204'],
    sellerId: SELLER_ID,
    category: CATEGORY_HOME,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt0vfHKyf-KWvrp3ab2lYy2T643Sjjl6sT_KcbSeqNzT-3k62dj5SQuaD4BjptmB35Zs9uSy5rdM1T9LN6iPeVW4xZYSrQjGctukrGc3-raf7dqF7unX_UN60G-LVJ1P7llFmGmXhLpV2ZBVHmShTFvWyMPpRkPEDNRxarGN2oKKcA3BFZaEqLh63N1gjaaCqBWn27oxodcDLG5koAADfFQZI4tpWq2bqll05fmsR1Nq_X81WrOOZ1wXqM1B8HCEw7MfpR8Gbmgo4',
    imageAlt: 'Summit Trail Backpack',
    badge: {
      icon: 'local_fire_department',
      text: 'Trending',
      bgClass: 'bg-primary-container/10',
      textClass: 'text-primary',
    },
    title: 'Summit Trail Backpack',
    description: 'Group deal for the Summit Trail Backpack.',
    currentParticipants: 78,
    authorizedCount: 78,
    dealStock: 120,
    minParticipants: 50,
    durationMinutes: 1440,
    startTime: hoursFromNow(-19),
    dealPrice: 45.0,
    originalPrice: 70.0,
    endTime: hoursFromNow(5),
    timeRemainingSeconds: null,
    createdAt: hoursFromNow(-48),
    status: 'ACTIVE',
  },
  {
    id: '8e2b0a2f-3333-4000-8000-000000000206',
    productId: DEAL_PRODUCT_IDS['dummy-0205'],
    sellerId: SELLER_ID,
    category: CATEGORY_HOME,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgxNrJsmbVdEsMq9E2yT7qkWEDEhhtW1gAlQKbdD0W-FyPJK6rhVuRLNUh9IoxlximM6CpdwvZOyQ1MoQN2VGx5p-DMDTeKHbvQXUCNRZfsHK0jhwVysf-7Y-4TY3PoqcRbignibynp97Ye0XNL7SwYGZ-ZVlnDFm1WiFLebxwJASm6kEoR3G_INAwp-yITH8yMr6wQiaU_6I_HaMM7t5X2LWa2P_h2-K2XspnTlMP2x5YYN5x4Qs106T9lYaK8wbwqGZg8vDtXMA',
    imageAlt: 'Lumen Desk Lamp',
    badge: {
      icon: 'groups',
      text: 'Gathering',
      bgClass: 'bg-surface-container-high/60',
      textClass: 'text-on-surface-variant',
    },
    title: 'Lumen Desk Lamp',
    description: 'Group deal for the Lumen Desk Lamp.',
    currentParticipants: 0,
    authorizedCount: 0,
    dealStock: 200,
    minParticipants: 80,
    durationMinutes: 2880,
    startTime: hoursFromNow(-12),
    dealPrice: 18.75,
    originalPrice: 32.0,
    endTime: hoursFromNow(47),
    timeRemainingSeconds: null,
    createdAt: hoursFromNow(-3),
    status: 'ACTIVE',
  },
];

export interface CreateDealInput {
  sellerId: string;
  productId: string;
  productName: string;
  image: string;
  originalPrice: number;
  dealPrice: number;
  dealStock: number;
  minParticipants: number;
  durationMinutes: number;
  startAt: string;
}

function makeId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function listDeals(): DealView[] {
  return DEAL_STORE;
}

export function listActiveDeals(): DealView[] {
  return DEAL_STORE.filter((deal) => deal.status === 'ACTIVE');
}

export function getDealById(id: string): DealView | undefined {
  return DEAL_STORE.find((deal) => deal.id === id);
}

export function getActiveDealForProduct(productId: string): DealView | undefined {
  return DEAL_STORE.find((deal) => deal.productId === productId && deal.status === 'ACTIVE');
}

export function getActiveDealsForProduct(productId: string): DealView[] {
  return DEAL_STORE.filter((deal) => deal.productId === productId && deal.status === 'ACTIVE');
}

export function createDeal(input: CreateDealInput): DealView {
  const start = new Date(input.startAt);
  const startTime = Number.isNaN(start.getTime())
    ? new Date().toISOString()
    : start.toISOString();
  const durationMinutes = Math.max(1, input.durationMinutes || 0);
  const endTime = new Date(new Date(startTime).getTime() + durationMinutes * 60000).toISOString();
  const deal: DealView = {
    id: makeId(),
    productId: input.productId,
    sellerId: input.sellerId,
    originalPrice: input.originalPrice,
    dealPrice: input.dealPrice,
    dealStock: input.dealStock,
    currentParticipants: 0,
    authorizedCount: 0,
    minParticipants: input.minParticipants,
    status: 'ACTIVE',
    startTime,
    durationMinutes,
    endTime,
    timeRemainingSeconds: durationMinutes * 60,
    createdAt: new Date().toISOString(),
    image: input.image,
    imageAlt: input.productName,
    title: input.productName,
    description: `Group deal for ${input.productName}.`,
    badge: {
      icon: 'new_releases',
      text: 'Just Added',
      bgClass: 'bg-secondary-container/30',
      textClass: 'text-on-secondary-container',
    },
  };
  DEAL_STORE.push(deal);
  return deal;
}

export function updateDeal(id: string, changes: Partial<DealView>): DealView | undefined {
  const index = DEAL_STORE.findIndex((deal) => deal.id === id);
  if (index === -1) {
    return undefined;
  }
  const next: DealView = { ...DEAL_STORE[index], ...changes, id };
  DEAL_STORE[index] = next;
  return next;
}

export function deleteDeal(id: string): void {
  const index = DEAL_STORE.findIndex((deal) => deal.id === id);
  if (index !== -1) {
    DEAL_STORE.splice(index, 1);
  }
}

/** Mocks a buyer joining: increments the counters and activates a pending deal. */
export function joinDeal(id: string): DealView | undefined {
  const index = DEAL_STORE.findIndex((deal) => deal.id === id);
  if (index === -1) {
    return undefined;
  }
  const deal = DEAL_STORE[index];
  if (deal.status === 'SUCCEEDED' || deal.status === 'FAILED' || deal.status === 'CANCELLED') {
    return deal;
  }
  if (deal.currentParticipants >= deal.dealStock) {
    return deal;
  }
  const next: DealView = {
    ...deal,
    currentParticipants: deal.currentParticipants + 1,
    authorizedCount: deal.authorizedCount + 1,
    status: deal.status === 'PENDING' ? 'ACTIVE' : deal.status,
  };
  DEAL_STORE[index] = next;
  return next;
}

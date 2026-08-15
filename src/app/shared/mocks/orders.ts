import { SellerOrder, SellerOrderItem, toSellerOrderPhase } from '../models/seller-order';
import { OrderStatus } from '../models/order-status';
import { OrderType } from '../models/order-type';
import { ShippingStatus } from '../models/shipping-status';

// Product thumbnails reference the same aida-public assets used by the catalog
// seed and the deal mock, so they resolve in the UI without a placeholder.
const PRODUCT_IMAGES = {
  headphones:
    'https://lh3.googleusercontent.com/aida/AP1WRLvXKA79oOBM1ogBCBsSTt4xaHEajPnU5M3kGUb8vxL8RJk6ObZNFZHtSP35iikAf__ML4j9752bzKjPGwwpA3TIdM59TlsoqD8tqBXszChijNfD1BQUlgcOPf7UCU9VA4c9dpE6chcrA7ime9S3592BFCgvosMiPUCFoxUl3MTeZ-0diAbcrV9miL_0i8C5fdAagAtQRVkIBfw5D0jTGMWSYh5JmAbFiDOnGasqvHnMNQBfgXPWilhJpKtPQwYm6I-W30dlraU73g',
  watch:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAM7mT9BXVVmlcREOXeHcfUVObLVCRe6udQ5jkdlNC7b_gOjiyc-_OA2U9BbLxVINCFkbCsQJTIUJPbhr7WH-ijS3IvScSjpDD52JC1EuwDE7TFFNpwmUPGhMH-WL8poyKA3oNm8YTb59STzcRsW10ZY4YKrqkdn_Tvc91u4iEEzbSwOI4wySaN6s5gNydACwafLBbTbLc5KaNfGUu0UMAwto5bIpJoxH97uS_zbPdjpYmLFqj-QJhj',
  keyboard:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDGbDdEeJRNh3lYZq_TshFAUJyneDDD62h8leUp1Yjpk12IDMc0fziu2LYpPzJynwhjeYQtyvroJV7C4v__lwQa1NvaXAOT-DUb4evXVo8IOg7coSaB3ow88KAdri9r2rTzzJkdVU2_Ws6A_KlOnJD5h2WTlFgT0PoOLwesNNCvOFPSxyTRUOOC2oNfgdg3Ts1qgE4D5NgLeZCVG-QewvxnL-UC2YR0ieKQGSfZBM3xIpA2L3thmXpF',
  brew:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDSGkOu2tweFMl4s3ixgYD5Q2-gIzYt3WNvn3sJKDRFXRhCgb_XCTPoGbMspTbBu3sISO2ldSINv62qtessJlzvwOglK_cdJiNJsopUA-MFNmmOxR57AqoqHNC-pbY_Arx8sh2pvE-gjDRzTGMYM4QYvbg4LdlJkLTNP5nwBUF2NaGhwaPQG2hzAOWFjS0VVFlYPl_f0UlCl6hKd690Hq0U6BTY9oK4tfBek9EJFhte6Oxl98cNUXhcKOVz9ANdO-4HyXH9G4y5CwE',
  sonic:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBwUCxSF-_QRIwIV2buXvV9w90sb7E4VDit2cGcMWMpQ-ntIOypgE1uOgxBWky-11Kyfj2626OfQ3RLftzl032QrFxFm5NQtgK-7jcbUKgsqIJtgFCx4QZrLH9vi3cxMjvpsqtySdpAYX-IygEzvJd4xweayGHNmgA9nCPmOiEubP7L2a4l3kTeqF9xB68WdR3CRAwDv_LS_VoVtoh7ajAgJDijm-rX_Hn0lSYv8Nl3-nX2fzit42S4STLWdi8935or6VJjIfTW-e4',
  backpack:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDt0vfHKyf-KWvrp3ab2lYy2T643Sjjl6sT_KcbSeqNzT-3k62dj5SQuaD4BjptmB35Zs9uSy5rdM1T9LN6iPeVW4xZYSrQjGctukrGc3-raf7dqF7unX_UN60G-LVJ1P7llFmGmXhLpV2ZBVHmShTFvWyMPpRkPEDNRxarGN2oKKcA3BFZaEqLh63N1gjaaCqBWn27oxodcDLG5koAADfFQZI4tpWq2bqll05fmsR1Nq_X81WrOOZ1wXqM1B8HCEw7MfpR8Gbmgo4',
  aqua:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBdum2tVVRwEgwEWwqrdWvCFaQ18f32GUkCr1O69zLXM6H1eCabBS_brs81RRYd54giYLj9iHwE45mweyusCcd8zdq6aMe2waSf8ThKpgAoKBAnL2RZnzobMoq05BpD0aBXK3o9Dow9ZrhBoSpwSY_3C0t47FnxP0icnOA9kLcTO7QYux1w7Du_7xSIEGCt_olhmbsSzJ1wp1kAakor2jpdjWT21RK_jo3-Fpphtg1v0bx_y-Nnsprn2Q7nk6ANAAAk16IJDzSca-Q',
  lamp:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCgxNrJsmbVdEsMq9E2yT7qkWEDEhhtW1gAlQKbdD0W-FyPJK6rhVuRLNUh9IoxlximM6CpdwvZOyQ1MoQN2VGx5p-DMDTeKHbvQXUCNRZfsHK0jhwVysf-7Y-4TY3PoqcRbignibynp97Ye0XNL7SwYGZ-ZVlnDFm1WiFLebxwJASm6kEoR3G_INAwp-yITH8yMr6wQiaU_6I_HaMM7t5X2LWa2P_h2-K2XspnTlMP2x5YYN5x4Qs106T9lYaK8wbwqGZg8vDtXMA',
  pouch:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCDSmxS5Ux__--cPa3idO0LDpBMCzclCXsfH9YZpuq_qCY68xq2e2a5Mz05VS-9EuHJUK6_JNKPatVi-ar2aj_bN1XgCOUsIggbsuEOxjd_rsbrt-qE4IHOxZffbAyrlWLH2jt9kKuHALmtsCh437hYj6uH1Bl4dEjxG_woOwSM10AfytRrBvS-uB6d2rHOZBohrs29-S8ydsNfot9BGb6EbNl_AJ2SPaxm1K9rogyNlU_qgvuGsHu_4mVXjVxTU1z_lUAXhS2aAEg',
};

// productId values are the seeded catalog UUIDs (V6__seed_deal_products.sql).
const PRODUCTS: Record<string, Omit<SellerOrderItem, 'quantity'>> = {
  headphones: {
    productId: 'fcf79a97-1202-28e3-7937-66b59b744a1a',
    productName: 'Premium Wireless Headphones',
    productImageUrl: PRODUCT_IMAGES.headphones,
    unitPrice: 149.0,
  },
  watch: {
    productId: '419c9562-6d38-1da9-47b2-b59e8fb16a70',
    productName: 'Active Smart Watch V2',
    productImageUrl: PRODUCT_IMAGES.watch,
    unitPrice: 299.0,
  },
  keyboard: {
    productId: '23cb533f-d49b-1168-7f82-8ec86e656313',
    productName: 'Mechanical Keyboard Pro',
    productImageUrl: PRODUCT_IMAGES.keyboard,
    unitPrice: 185.5,
  },
  brew: {
    productId: '2bf8a0ab-103d-f678-290b-bf4b1762fd01',
    productName: 'Artisan Ceramic Brew Set',
    productImageUrl: PRODUCT_IMAGES.brew,
    unitPrice: 49.99,
  },
  sonic: {
    productId: '60930722-39b4-9b3a-3f08-07c0926e5450',
    productName: 'Sonic Pro Wireless',
    productImageUrl: PRODUCT_IMAGES.sonic,
    unitPrice: 199.0,
  },
  backpack: {
    productId: '5a5352fb-86a2-ce81-d8ce-c746fb16a9c7',
    productName: 'Summit Trail Backpack',
    productImageUrl: PRODUCT_IMAGES.backpack,
    unitPrice: 70.0,
  },
  aqua: {
    productId: '52a9f1b9-ee61-ee54-eba2-2532c5d138ef',
    productName: 'AquaSmart Hydration',
    productImageUrl: PRODUCT_IMAGES.aqua,
    unitPrice: 30.0,
  },
  lamp: {
    productId: '43326b0f-3f5a-7b34-1eb0-6e39aea121b7',
    productName: 'Lumen Desk Lamp',
    productImageUrl: PRODUCT_IMAGES.lamp,
    unitPrice: 32.0,
  },
  pouch: {
    productId: '20689b6f-d578-784d-bb4a-525e24aa4c33',
    productName: 'EcoTech Tech Pouch',
    productImageUrl: PRODUCT_IMAGES.pouch,
    unitPrice: 25.0,
  },
};

const hoursFromNow = (hours: number): string =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

interface OrderSeed {
  id: string;
  orderType: OrderType;
  status: OrderStatus;
  shippingStatus?: ShippingStatus | null;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ product: keyof typeof PRODUCTS; quantity: number }>;
}

// Single in-memory seller order store. Mocks the Order Service data a seller
// would receive once the seller-orders endpoint lands.
const ORDER_SEEDS: OrderSeed[] = [
  {
    id: '10234',
    orderType: 'NORMAL',
    status: 'RESERVING',
    shippingStatus: null,
    createdAt: hoursFromNow(2),
    customerName: 'Alex Johnson',
    customerEmail: 'alex.j@example.com',
    items: [item('headphones', 2)],
  },
  {
    id: '10233',
    orderType: 'NORMAL',
    status: 'PENDING_CHARGE',
    shippingStatus: null,
    createdAt: hoursFromNow(3),
    customerName: 'Sarah Miller',
    customerEmail: 'sarah.m@domain.co',
    items: [item('watch', 1)],
  },
  {
    id: '10232',
    orderType: 'DEAL',
    status: 'PENDING_AUTHORIZATION',
    shippingStatus: null,
    createdAt: hoursFromNow(5),
    customerName: 'Dev Guru',
    customerEmail: 'dev_guru@startup.io',
    items: [item('keyboard', 3)],
  },
  {
    id: '10231',
    orderType: 'NORMAL',
    status: 'AUTHORIZED',
    shippingStatus: null,
    createdAt: hoursFromNow(8),
    customerName: 'Lina Karim',
    customerEmail: 'lina.k@example.com',
    items: [item('brew', 1)],
  },
  {
    id: '10230',
    orderType: 'DEAL',
    status: 'PENDING_CAPTURE',
    shippingStatus: null,
    createdAt: hoursFromNow(10),
    customerName: 'Mina Ali',
    customerEmail: 'm.ali@example.com',
    items: [item('pouch', 2)],
  },
  {
    id: '10229',
    orderType: 'NORMAL',
    status: 'PENDING_VOID',
    shippingStatus: null,
    createdAt: hoursFromNow(12),
    customerName: 'Tony Reyes',
    customerEmail: 'tony.r@example.com',
    items: [item('aqua', 1)],
  },
  {
    id: '10228',
    orderType: 'DEAL',
    status: 'CONFIRMED',
    shippingStatus: 'PROCESSING',
    createdAt: hoursFromNow(26),
    customerName: 'Nora Hassan',
    customerEmail: 'nora.h@example.com',
    items: [item('headphones', 1), item('keyboard', 1)],
  },
  {
    id: '10227',
    orderType: 'NORMAL',
    status: 'CONFIRMED',
    shippingStatus: 'PROCESSING',
    createdAt: hoursFromNow(30),
    customerName: 'Peter Wilson',
    customerEmail: 'peter.w@example.com',
    items: [item('backpack', 2)],
  },
  {
    id: '10226',
    orderType: 'NORMAL',
    status: 'CONFIRMED',
    shippingStatus: 'PROCESSING',
    createdAt: hoursFromNow(50),
    customerName: 'Ivy Chen',
    customerEmail: 'ivy.c@example.com',
    items: [item('lamp', 1)],
  },
  {
    id: '10225',
    orderType: 'DEAL',
    status: 'CONFIRMED',
    shippingStatus: 'PROCESSING',
    createdAt: hoursFromNow(52),
    customerName: 'Adam Khan',
    customerEmail: 'adam.k@example.com',
    items: [item('sonic', 1)],
  },
  {
    id: '10224',
    orderType: 'NORMAL',
    status: 'CONFIRMED',
    shippingStatus: 'SHIPPING',
    createdAt: hoursFromNow(74),
    customerName: 'Ruby Torres',
    customerEmail: 'ruby.t@example.com',
    items: [item('watch', 1), item('aqua', 1)],
  },
  {
    id: '10223',
    orderType: 'DEAL',
    status: 'CONFIRMED',
    shippingStatus: 'SHIPPING',
    createdAt: hoursFromNow(78),
    customerName: 'James Lee',
    customerEmail: 'james.l@example.com',
    items: [item('brew', 2)],
  },
  {
    id: '10222',
    orderType: 'NORMAL',
    status: 'CONFIRMED',
    shippingStatus: 'SHIPPING',
    createdAt: hoursFromNow(96),
    customerName: 'Zoe Martin',
    customerEmail: 'zoe.m@example.com',
    items: [item('keyboard', 1)],
  },
  {
    id: '10221',
    orderType: 'DEAL',
    status: 'CONFIRMED',
    shippingStatus: 'DELIVERED',
    createdAt: hoursFromNow(120),
    customerName: 'Sam Quinn',
    customerEmail: 'sam.q@example.com',
    items: [item('headphones', 1)],
  },
  {
    id: '10220',
    orderType: 'NORMAL',
    status: 'CONFIRMED',
    shippingStatus: 'DELIVERED',
    createdAt: hoursFromNow(140),
    customerName: 'Lea Novak',
    customerEmail: 'lea.n@example.com',
    items: [item('aqua', 1)],
  },
  {
    id: '10219',
    orderType: 'NORMAL',
    status: 'CANCELLED',
    shippingStatus: null,
    createdAt: hoursFromNow(160),
    customerName: 'Max Joseph',
    customerEmail: 'max.j@example.com',
    items: [item('lamp', 1)],
  },
  {
    id: '10218',
    orderType: 'DEAL',
    status: 'CANCELLED',
    shippingStatus: null,
    createdAt: hoursFromNow(168),
    customerName: 'Dina Salah',
    customerEmail: 'dina.s@example.com',
    items: [item('pouch', 2)],
  },
];

const seedOrders = (seeds: OrderSeed[]): Array<Omit<SellerOrder, 'phase'>> =>
  seeds.map((seed) => {
    const items: SellerOrderItem[] = seed.items.map(({ product, quantity }) => ({
      ...PRODUCTS[product],
      quantity,
    }));
    const totalPrice =
      Math.round(
        items.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0) * 100,
      ) / 100;
    return {
      id: seed.id,
      orderType: seed.orderType,
      status: seed.status,
      shippingStatus: seed.shippingStatus ?? null,
      createdAt: seed.createdAt,
      customerName: seed.customerName,
      customerEmail: seed.customerEmail,
      items,
      totalPrice,
    };
  });

function item(product: keyof typeof PRODUCTS, quantity: number): {
  product: keyof typeof PRODUCTS;
  quantity: number;
} {
  return { product, quantity };
}

// Wrap the seeds so every order carries a computed `phase`.
const ORDERS: SellerOrder[] = seedOrders(ORDER_SEEDS).map((order) => ({
  ...order,
  phase: toSellerOrderPhase(order.status, order.shippingStatus),
}));

export function listSellerOrders(): SellerOrder[] {
  return ORDERS;
}

export function getSellerOrderById(id: string): SellerOrder | undefined {
  return ORDERS.find((order) => order.id === id);
}

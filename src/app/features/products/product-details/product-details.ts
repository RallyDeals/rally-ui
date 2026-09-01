import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { Accordion } from './accordion/accordion';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { ProductCard } from '../components/product-card/product-card';
import { CartService } from '../../cart/cart.service';
import { Product, ActiveDeal } from '../../../shared/models/product';
import { ProductsService } from '../products.service';
import { InventoryService } from '../../../shared/services/inventory.service';
import { Inventory } from '../../../shared/models/inventory';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { Countdown } from '../../../shared/components/countdown/countdown';

export interface DisplayDeal {
  id: string;
  dealPrice: number;
  originalPrice: number;
  dealStock: number;
  currentParticipants: number;
  neededCount: number;
  progressPercent: number;
  status: string;
  endTime: string | null;
  durationMinutes: number;
  productName: string;
}

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, Breadcrumbs, Accordion, ProductCard, ErrorState, Countdown],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit, OnDestroy {
  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  inventory = signal<Inventory | null>(null);
  selectedImage = signal('');
  loading = signal(true);
  error = signal<ApiError | null>(null);
  quantity = signal(1);
  added = signal(false);
  private addTimer: ReturnType<typeof setTimeout> | undefined;

  readonly resolveImageUrl = resolveImageUrl;

  readonly displayDeals = computed<DisplayDeal[]>(() => {
    const product = this.product();
    if (!product?.deals?.length) return [];
    return product.deals.map((d) => this.toDisplayDeal(d, product));
  });

  readonly primaryDeal = computed(() => this.displayDeals()[0] ?? null);
  readonly availableStock = computed(() => {
    const stock = this.inventory()?.availableStock ?? 0;
    const product = this.product();
    if (!product) return stock;
    const cartItem = this.cartService.items().find((i) => i.id === product.id);
    return Math.max(0, stock - (cartItem?.quantity ?? 0));
  });
  readonly outOfStock = computed(() => this.availableStock() <= 0);

  readonly minDealPrice = computed(() => {
    const deals = this.displayDeals();
    return deals.length ? Math.min(...deals.map((d) => d.dealPrice)) : 0;
  });

  readonly maxDealDiscount = computed(() => {
    const deals = this.displayDeals();
    if (!deals.length) return 0;
    return Math.max(...deals.map((d) => {
      if (!d.originalPrice || d.originalPrice <= 0) return 0;
      return Math.round((1 - d.dealPrice / d.originalPrice) * 100);
    }));
  });

  scrollToDeals = () => {
    document.getElementById('product-group-deals')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  scrollToDescription = () => {
    document.getElementById('product-description')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  readonly galleryImages = computed<string[]>(() => {
    const product = this.product();
    if (!product) {
      return [];
    }
    const images = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
    return images.filter((url) => !!url);
  });

  breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const product = this.product();
    if (!product) {
      return [
        { label: 'Home', link: '/home' },
        { label: 'Products', link: '/products' },
      ];
    }
    return [
      { label: 'Home', link: '/home' },
      { label: 'Products', link: '/products' },
      { label: product.category.name, link: `/products?categoryId=${product.category.id}` },
      { label: product.name },
    ];
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productsService: ProductsService,
    private readonly cartService: CartService,
    private readonly inventoryService: InventoryService,
    private readonly titleService: Title,
  ) {}

  get imageSrc(): string {
    return resolveImageUrl(this.selectedImage() || this.galleryImages()[0], PLACEHOLDER_IMAGE);
  }

  selectImage = (url: string) => this.selectedImage.set(url);

  ngOnInit() {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.inventory.set(null);
    this.quantity.set(1);
    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.selectedImage.set(product.images?.[0] ?? product.imageUrl ?? '');
        this.loading.set(false);
        this.titleService.setTitle(product.name);
        this.loadRelatedProducts(product);
        this.loadInventory(product.id);
      },
      error: (err) => {
        this.error.set(toApiError(err));
        this.loading.set(false);
      },
    });
  }

  loadInventory(productId: string) {
    this.inventoryService.getInventory(productId).subscribe({
      next: (inventory) => this.inventory.set(inventory),
      error: () => this.inventory.set(null),
    });
  }

  loadRelatedProducts(product: Product) {
    this.productsService.getProducts({ categoryId: product.category.id, limit: 4 }).subscribe({
      next: (response) =>
        this.relatedProducts.set(response.items.filter((item) => item.id !== product.id)),
      error: () => this.relatedProducts.set([]),
    });
  }

  incrementQuantity = () => {
    if (this.quantity() < this.availableStock()) {
      const next = this.quantity() + 1;
      this.quantity.set(next);
    }
  };

  decrementQuantity = () => {
    this.quantity.set(Math.max(1, this.quantity() - 1));
  };

  addToCart = () => {
    const product = this.product();
    if (!product || this.outOfStock()) {
      return;
    }
    this.cartService.add(product, this.quantity());
    const remaining = this.availableStock() - this.quantity();
    this.inventory.set({ ...this.inventory()!, availableStock: remaining });
    this.quantity.set(1);
    this.added.set(true);
    clearTimeout(this.addTimer);
    this.addTimer = setTimeout(() => this.added.set(false), 1200);
  };

  retry = () => {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  };

  ngOnDestroy() {
    clearTimeout(this.addTimer);
  }

  dealDiscount(deal: DisplayDeal): number {
    if (!deal.originalPrice || deal.originalPrice <= 0) return 0;
    return Math.round((1 - deal.dealPrice / deal.originalPrice) * 100);
  }

  isDealPending(deal: DisplayDeal): boolean {
    return deal.status?.toLowerCase() === 'pending';
  }

  private toDisplayDeal(d: ActiveDeal, product: Product): DisplayDeal {
    const needed = Math.max(0, d.minParticipants - d.currentParticipants);
    const progress = d.dealStock > 0
      ? Math.min(100, Math.round((d.currentParticipants / d.dealStock) * 100))
      : 0;
    return {
      id: d.id,
      dealPrice: d.dealPrice,
      originalPrice: product.basePrice,
      dealStock: d.dealStock,
      currentParticipants: d.currentParticipants,
      neededCount: needed,
      progressPercent: progress,
      status: d.status,
      endTime: d.endTime,
      durationMinutes: d.durationMinutes,
      productName: product.name,
    };
  }
}

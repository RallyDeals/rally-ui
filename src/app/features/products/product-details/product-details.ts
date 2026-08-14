import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { Accordion } from './accordion/accordion';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { ProductCard } from '../components/product-card/product-card';
import { CartService } from '../../cart/cart.service';
import { Product } from '../../../shared/models/product';
import { ProductsService } from '../products.service';
import { ApiError } from '../../../shared/models/api-error';
import { toApiError } from '../../../shared/utils/api-error.util';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { resolveImageUrl } from '../../../shared/utils/image-url';
import { getActiveDealsForProduct } from '../../../shared/mocks/deals';
import { DealView, neededCount, progressPercent } from '../../../shared/models/deal';
import { Countdown } from '../../../shared/components/countdown/countdown';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, Breadcrumbs, Accordion, ProductCard, ErrorState, Countdown],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit, OnDestroy {
  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  activeDeals = signal<DealView[]>([]);
  selectedImage = signal('');
  loading = signal(true);
  error = signal<ApiError | null>(null);
  quantity = signal(1);
  added = signal(false);
  private addTimer: ReturnType<typeof setTimeout> | undefined;

  readonly resolveImageUrl = resolveImageUrl;
  readonly neededCount = neededCount;
  readonly progressPercent = progressPercent;

  readonly primaryDeal = computed(() => this.activeDeals()[0] ?? null);

  dealDiscount = (deal: DealView): number => {
    if (!deal.originalPrice || deal.originalPrice <= 0) {
      return 0;
    }
    return Math.round((1 - deal.dealPrice / deal.originalPrice) * 100);
  };

  readonly minDealPrice = computed(() => {
    const deals = this.activeDeals();
    return deals.length ? Math.min(...deals.map((deal) => deal.dealPrice)) : 0;
  });

  readonly maxDealDiscount = computed(() => {
    const deals = this.activeDeals();
    return deals.length ? Math.max(...deals.map((deal) => this.dealDiscount(deal))) : 0;
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
    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.activeDeals.set(getActiveDealsForProduct(product.id));
        this.selectedImage.set(product.images?.[0] ?? product.imageUrl ?? '');
        this.loading.set(false);
        this.loadRelatedProducts(product);
      },
      error: (err) => {
        this.error.set(toApiError(err));
        this.loading.set(false);
      },
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
    this.quantity.set(this.quantity() + 1);
  };

  decrementQuantity = () => {
    this.quantity.set(Math.max(1, this.quantity() - 1));
  };

  addToCart = () => {
    const product = this.product();
    if (!product) {
      return;
    }
    this.cartService.add(product, this.quantity());
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
}

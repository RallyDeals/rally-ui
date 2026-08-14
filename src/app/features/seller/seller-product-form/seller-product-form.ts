import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Category } from '../../../shared/models/category';
import { Product } from '../../../shared/models/product';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';
import { CategoriesService } from '../../categories/categories.service';
import { ProductsService, UpsertProductRequest } from '../../products/products.service';
import { PLACEHOLDER_IMAGE } from '../../../shared/constants/placeholder';
import { resolveImageUrl } from '../../../shared/utils/image-url';

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg'];

export interface ProductImage {
  id: string;
  url: string;
  file?: File;
}

function newImageId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

@Component({
  selector: 'app-seller-product-form',
  imports: [Breadcrumbs],
  templateUrl: './seller-product-form.html',
  styleUrl: './seller-product-form.css',
})
export class SellerProductForm implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly placeholderImage = PLACEHOLDER_IMAGE;
  readonly resolveImageUrl = resolveImageUrl;
  productId = signal<string | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  categories = signal<Category[]>([]);

  name = signal('');
  description = signal('');
  categoryId = signal('');

  basePrice = signal('');
  stockQuantity = signal('');
  sku = signal('');
  active = signal(true);
  tags = signal<string[]>([]);
  tagInput = signal('');
  images = signal<ProductImage[]>([]);
  imageError = signal<string | null>(null);

  readonly isEdit = computed(() => this.productId() !== null);

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Products', link: '/seller/products' },
    { label: this.isEdit() ? 'Edit Product' : 'New Product' },
  ]);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'] as string | undefined;
      this.productId.set(id ?? null);
      if (id) {
        this.loadProduct(id);
      }
    });
    this.categoriesService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {},
    });
  }

  loadProduct(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.name.set(product.name);
        this.description.set(product.description);
        this.categoryId.set(product.category.id);
        this.basePrice.set(product.basePrice ? String(product.basePrice) : '');
        this.sku.set(product.sku ?? '');
        this.active.set(product.visible);
        this.tags.set(product.tags ?? []);
        this.images.set([
          ...(product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : []).map(
            (url) => ({ id: newImageId(), url }),
          ),
        ]);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load product. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  onCategoryChange = (value: string) => {
    this.categoryId.set(value);
  };

  onAddImage = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const dropEvent = event as DragEvent;
    const file = target.files?.[0] ?? dropEvent.dataTransfer?.files?.[0];
    if (!file) {
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      this.imageError.set('Unsupported file type. Use SVG, PNG, or JPG.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      this.imageError.set(`Image too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }
    this.imageError.set(null);
    this.images.set([
      ...this.images(),
      { id: newImageId(), url: URL.createObjectURL(file), file },
    ]);
    if (target.value !== undefined) {
      target.value = '';
    }
  };

  removeImage = (id: string) => {
    const image = this.images().find((existing) => existing.id === id);
    if (image?.file) {
      URL.revokeObjectURL(image.url);
    }
    this.images.set(this.images().filter((existing) => existing.id !== id));
  };

  private async uploadAllImages(): Promise<string[]> {
    const paths = await Promise.all(
      this.images().map(async (image) => {
        if (image.file) {
          const response = await lastValueFrom(this.productsService.uploadImage(image.file as File));
          return response.path;
        }
        return image.url;
      }),
    );
    return paths;
  }

  addTag = () => {
    const tag = this.tagInput().trim();
    if (tag && !this.tags().includes(tag)) {
      this.tags.set([...this.tags(), tag]);
    }
    this.tagInput.set('');
  };

  removeTag = (tag: string) => {
    this.tags.set(this.tags().filter((existing) => existing !== tag));
  };

  cancel = () => {
    this.router.navigate(['/seller/products']);
  };

  save = async () => {
    this.saving.set(true);
    this.error.set(null);

    let images: string[] = [];
    try {
      images = await this.uploadAllImages();
    } catch {
      this.saving.set(false);
      this.error.set('Failed to upload images. Please try again later.');
      return;
    }

    const request: UpsertProductRequest = {
      name: this.name().trim(),
      description: this.description().trim(),
      categoryId: this.categoryId() || undefined,
      basePrice: Number(this.basePrice()) || 0,
      sku: this.sku().trim() || undefined,
      visible: this.active(),
      tags: this.tags(),
      imageUrl: images[0],
      images,
    };

    const id = this.productId();
    const operation = id
      ? this.productsService.updateProduct(id, request)
      : this.productsService.createProduct(request);

    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/seller/products']);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Failed to save product. Please try again later.');
      },
    });
  };
}

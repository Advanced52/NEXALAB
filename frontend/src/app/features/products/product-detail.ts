import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { Product, ProductVariant } from '../../core/models/api.models';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  loading = signal(true);
  error = signal<string | null>(null);
  product = signal<Product | null>(null);
  selectedImage = signal<string>('assets/brand/icon.png');
  selectedVariantId = signal<string | null>(null);
  quantity = 1;

  readonly activeVariants = computed(
    () => this.product()?.variants?.filter((v) => v.isActive) ?? [],
  );

  readonly selectedVariant = computed(() => {
    const id = this.selectedVariantId();
    return this.activeVariants().find((v) => v.id === id) ?? null;
  });

  readonly displayPrice = computed(() => {
    const variant = this.selectedVariant();
    const product = this.product();
    if (!product) return 0;
    if (variant?.price != null && variant.price !== '') {
      return Number(variant.price);
    }
    return Number(product.price);
  });

  readonly availableStock = computed(() => {
    const variant = this.selectedVariant();
    if (variant) return variant.stock;
    return this.product()?.stock ?? 0;
  });

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.loading.set(true);
          this.error.set(null);
          const slug = params.get('itemSlug') || '';
          const divisionSlug = params.get('divisionSlug') || undefined;
          return this.catalog.getProduct(slug, divisionSlug).pipe(
            catchError(() => of(null)),
          );
        }),
      )
      .subscribe({
        next: (product) => {
          if (!product) {
            this.product.set(null);
            this.error.set('Producto no encontrado.');
            this.loading.set(false);
            return;
          }
          this.product.set(product);
          this.selectedImage.set(
            product.images?.[0]?.url || 'assets/brand/icon.png',
          );
          const firstVariant = product.variants?.find((v) => v.isActive) ?? null;
          this.selectedVariantId.set(firstVariant?.id ?? null);
          this.applySeo(product);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Producto no encontrado.');
          this.loading.set(false);
        },
      });
  }

  selectVariant(variant: ProductVariant) {
    this.selectedVariantId.set(variant.id);
    if (variant.imageUrl) {
      this.selectedImage.set(variant.imageUrl);
    }
  }

  selectImage(url: string) {
    this.selectedImage.set(url);
  }

  addToCart() {
    const product = this.product();
    if (!product) return;

    if (this.availableStock() <= 0) {
      this.toast.error('Producto sin stock disponible');
      return;
    }

    if (this.activeVariants().length && !this.selectedVariant()) {
      this.toast.error('Selecciona una variante');
      return;
    }

    const variant = this.selectedVariant();
    const division = product.division;
    const categorySlug = product.category?.slug || 'producto';

    this.cart.add({
      itemType: variant ? 'variant' : 'product',
      productId: product.id,
      variantId: variant?.id,
      divisionId: product.divisionId,
      divisionName: division?.name || 'NEXALAB',
      name: product.name,
      variantLabel: variant
        ? [variant.size?.name, variant.color?.name]
            .filter(Boolean)
            .join(' / ')
        : undefined,
      imageUrl: this.selectedImage(),
      unitPrice: this.displayPrice(),
      quantity: this.quantity,
      slugPath: `/${division?.slug || 'tienda'}/${categorySlug}/${product.slug}`,
    });

    this.toast.success('Producto agregado al carrito.');
  }

  private applySeo(product: Product) {
    const pageTitle =
      product.seoTitle || `NEXALAB | ${product.name}`;
    const description =
      product.seoDescription || product.shortDescription || '';
    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    const image = product.images?.[0]?.url;
    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image });
    }
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { Category, Division, Product } from '../../core/models/api.models';
import { CatalogService } from '../../core/services/catalog.service';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-shop-page',
  imports: [FormsModule, ProductCard],
  templateUrl: './shop-page.html',
  styleUrl: './shop-page.scss',
  host: {
    '(document:keydown.escape)': 'filtersOpen.set(false)',
  },
})
export class ShopPage implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly title = inject(Title);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  loading = signal(true);
  filtersOpen = signal(false);
  products = signal<Product[]>([]);
  divisions = signal<Division[]>([]);
  categories = signal<Category[]>([]);

  filters = {
    divisionSlug: '',
    categorySlug: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    inStock: false,
    type: '',
    search: '',
  };

  ngOnInit() {
    this.title.setTitle('NEXALAB | Tienda');

    this.route.queryParamMap.subscribe((params) => {
      this.filters.divisionSlug = params.get('division') || '';
      this.filters.categorySlug = params.get('category') || '';
      this.filters.minPrice = params.get('minPrice')
        ? Number(params.get('minPrice'))
        : null;
      this.filters.maxPrice = params.get('maxPrice')
        ? Number(params.get('maxPrice'))
        : null;
      this.filters.inStock = params.get('inStock') === 'true';
      this.filters.type = params.get('type') || '';
      this.filters.search = params.get('q') || '';
      this.loadProducts();
    });

    forkJoin({
      divisions: this.catalog.getDivisions(),
      categories: this.catalog.getCategories(),
    }).subscribe({
      next: ({ divisions, categories }) => {
        this.divisions.set(divisions);
        this.categories.set(categories);
      },
    });
  }

  filteredCategories() {
    if (!this.filters.divisionSlug) return this.categories();
    const division = this.divisions().find(
      (d) => d.slug === this.filters.divisionSlug,
    );
    if (!division) return [];
    return this.categories().filter((c) => c.divisionId === division.id);
  }

  activeFilterCount() {
    const f = this.filters;
    return [
      f.divisionSlug,
      f.categorySlug,
      f.type,
      f.minPrice != null,
      f.maxPrice != null,
      f.inStock,
    ].filter(Boolean).length;
  }

  selectDivision(slug: string) {
    this.filters.divisionSlug = slug;
    this.filters.categorySlug = '';
    this.applyFilters();
  }

  onDivisionChange() {
    this.filters.categorySlug = '';
  }

  applyFilters() {
    this.filtersOpen.set(false);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        division: this.filters.divisionSlug || null,
        category: this.filters.categorySlug || null,
        minPrice: this.filters.minPrice ?? null,
        maxPrice: this.filters.maxPrice ?? null,
        inStock: this.filters.inStock ? true : null,
        type: this.filters.type || null,
        q: this.filters.search || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  clearFilters() {
    this.filters = {
      divisionSlug: '',
      categorySlug: '',
      minPrice: null,
      maxPrice: null,
      inStock: false,
      type: '',
      search: '',
    };
    this.filtersOpen.set(false);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  private loadProducts() {
    this.loading.set(true);
    this.catalog
      .getProducts({
        divisionSlug: this.filters.divisionSlug || undefined,
        categorySlug: this.filters.categorySlug || undefined,
        minPrice: this.filters.minPrice ?? undefined,
        maxPrice: this.filters.maxPrice ?? undefined,
        inStock: this.filters.inStock || undefined,
        type: this.filters.type || undefined,
        search: this.filters.search || undefined,
      })
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.loading.set(false);
        },
        error: () => {
          this.products.set([]);
          this.loading.set(false);
        },
      });
  }
}

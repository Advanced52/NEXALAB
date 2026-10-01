import { Component, OnInit, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Category, Product, ServiceItem } from '../../core/models/api.models';
import { CatalogService } from '../../core/services/catalog.service';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-category-page',
  imports: [RouterLink, ProductCard],
  templateUrl: './category-page.html',
  styleUrl: './category-page.scss',
})
export class CategoryPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  loading = signal(true);
  error = signal<string | null>(null);
  category = signal<Category | null>(null);
  products = signal<Product[]>([]);
  services = signal<ServiceItem[]>([]);
  divisionSlug = signal('');

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.loading.set(true);
          const divisionSlug = params.get('divisionSlug') || '';
          const categorySlug = params.get('categorySlug') || '';
          this.divisionSlug.set(divisionSlug);

          return forkJoin({
            category: this.catalog.getCategory(divisionSlug, categorySlug).pipe(
              catchError(() => of(null)),
            ),
            products: this.catalog
              .getProducts({ divisionSlug, categorySlug })
              .pipe(catchError(() => of([]))),
            services: this.catalog.getServices(divisionSlug).pipe(
              catchError(() => of([])),
            ),
          });
        }),
      )
      .subscribe({
        next: ({ category, products, services }) => {
          if (!category) {
            this.error.set('Categoría no encontrada.');
            this.category.set(null);
            this.loading.set(false);
            return;
          }
          this.category.set(category);
          this.products.set(products);
          this.services.set(
            services.filter((s) => s.categoryId === category.id),
          );
          this.title.setTitle(
            `NEXALAB | ${category.division?.name || ''} · ${category.name}`,
          );
          this.meta.updateTag({
            name: 'description',
            content: category.description || category.name,
          });
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Categoría no encontrada.');
          this.loading.set(false);
        },
      });
  }
}

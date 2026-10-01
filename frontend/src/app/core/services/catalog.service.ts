import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import {
  Category,
  Division,
  Product,
  ProductFilters,
  ServiceItem,
  Setting,
} from '../models/api.models';
import { ApiService } from './api.service';

export interface HomeHero {
  brand: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly api = inject(ApiService);

  getDivisions() {
    return this.api.get<Division[]>('/divisions');
  }

  getDivision(slug: string) {
    return this.api.get<Division>(`/divisions/${slug}`);
  }

  getCategories(divisionId?: string) {
    const qs = divisionId ? `?divisionId=${divisionId}` : '';
    return this.api.get<Category[]>(`/categories${qs}`);
  }

  getCategory(divisionSlug: string, categorySlug: string) {
    return this.api.get<Category>(
      `/divisions/${divisionSlug}/categories/${categorySlug}`,
    );
  }

  getProducts(filters: ProductFilters = {}) {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });
    const qs = query.toString();
    return this.api.get<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  }

  getProduct(slug: string, divisionSlug?: string) {
    const qs = divisionSlug ? `?divisionSlug=${divisionSlug}` : '';
    return this.api.get<Product>(`/products/${slug}${qs}`);
  }

  getServices(divisionSlug?: string) {
    const qs = divisionSlug ? `?divisionSlug=${divisionSlug}` : '';
    return this.api.get<ServiceItem[]>(`/services${qs}`);
  }

  getService(slug: string, divisionSlug?: string) {
    const qs = divisionSlug ? `?divisionSlug=${divisionSlug}` : '';
    return this.api.get<ServiceItem>(`/services/${slug}${qs}`);
  }

  getPublicSettings() {
    return this.api.get<Setting[]>('/settings/public');
  }

  getHomeHero() {
    return this.getPublicSettings().pipe(
      map((settings) => {
        const hero = settings.find((s) => s.key === 'home.hero');
        const defaults: HomeHero = {
          brand: 'NEXALAB',
          headline: 'Creatividad, tecnología y fabricación.',
          subheadline:
            'Moda, impresión 3D, tecnología y robótica bajo una misma marca.',
          ctaLabel: 'Explora NEXALAB',
          ctaHref: '#explora',
        };
        if (hero && typeof hero.value === 'object' && hero.value) {
          return { ...defaults, ...(hero.value as Partial<HomeHero>) };
        }
        return defaults;
      }),
    );
  }
}

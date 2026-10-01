import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/api.models';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <a class="card" [routerLink]="link">
      <div class="card__media">
        <img [src]="image" [alt]="product.name" />
        @if (product.isFeatured) {
          <span class="card__badge">Destacado</span>
        }
      </div>
      <div class="card__body">
        @if (product.division?.name) {
          <span class="card__division">{{ product.division!.name }}</span>
        }
        <h3>{{ product.name }}</h3>
        @if (product.shortDescription) {
          <p>{{ product.shortDescription }}</p>
        }
        <div class="card__price">
          <strong>{{ product.price | currency: 'USD' : 'symbol-narrow' }}</strong>
          @if (product.compareAtPrice) {
            <s>{{ product.compareAtPrice | currency: 'USD' : 'symbol-narrow' }}</s>
          }
        </div>
        <span class="card__stock" [class.out]="product.stock <= 0">
          {{ product.stock > 0 ? 'Disponible' : 'Agotado' }}
        </span>
      </div>
    </a>
  `,
  styles: `
    .card {
      display: grid;
      background: var(--nx-surface);
      border: 1px solid var(--nx-border);
      border-radius: 12px;
      overflow: hidden;
      height: 100%;
      transition: border-color 0.15s ease, transform 0.15s ease;
    }
    .card:hover {
      border-color: var(--nx-cyan);
      transform: translateY(-2px);
    }
    .card__media {
      position: relative;
      aspect-ratio: 4 / 3;
      background: #111;
    }
    .card__media img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .card__badge {
      position: absolute;
      top: 0.65rem;
      left: 0.65rem;
      background: var(--nx-cyan);
      color: #000;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
    }
    .card__body {
      padding: 1rem;
      display: grid;
      gap: 0.35rem;
    }
    .card__division {
      color: var(--nx-cyan);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    h3 {
      margin: 0;
      font-size: 1.05rem;
    }
    p {
      margin: 0;
      color: var(--nx-muted);
      font-size: 0.9rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card__price {
      display: flex;
      gap: 0.55rem;
      align-items: baseline;
      margin-top: 0.25rem;
    }
    .card__price s {
      color: var(--nx-muted);
      font-size: 0.85rem;
    }
    .card__stock {
      font-size: 0.8rem;
      color: var(--nx-success);
    }
    .card__stock.out {
      color: var(--nx-danger);
    }
  `,
})
export class ProductCard {
  @Input({ required: true }) product!: Product;

  get image() {
    return this.product.images?.[0]?.url || 'assets/brand/icon.png';
  }

  get link() {
    const division = this.product.division?.slug || 'tienda';
    const category = this.product.category?.slug || 'producto';
    return ['/', division, category, this.product.slug];
  }
}

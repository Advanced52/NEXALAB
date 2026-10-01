import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Division, Product } from '../../core/models/api.models';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <a class="card" [routerLink]="link" [style.--accent]="accent">
      <div class="card__media" [class.card__media--empty]="!image">
        @if (image) {
          <img [src]="image" [alt]="product.name" loading="lazy" />
        } @else {
          <div class="card__placeholder" aria-hidden="true">
            @if (owner?.logoUrl) {
              <img [src]="owner!.logoUrl!" alt="" loading="lazy" />
            } @else {
              <span>{{ initials }}</span>
            }
          </div>
        }
        <div class="card__tags">
          @if (product.isFeatured) {
            <span class="card__tag card__tag--accent">Destacado</span>
          }
          @if (discount) {
            <span class="card__tag card__tag--sale">-{{ discount }}%</span>
          }
        </div>
        @if (product.stock <= 0) {
          <span class="card__soldout">Agotado</span>
        }
      </div>
      <div class="card__body">
        @if (owner?.name) {
          <span class="card__division">{{ owner!.name }}</span>
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
      </div>
    </a>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .card {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--nx-surface);
      border: 1px solid var(--nx-border);
      border-radius: var(--nx-radius);
      overflow: hidden;
      transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover {
      border-color: var(--accent);
      transform: translateY(-3px);
      box-shadow: var(--nx-shadow);
    }
    .card__media {
      position: relative;
      aspect-ratio: 1;
      background: var(--nx-media-bg);
      overflow: hidden;
    }
    .card__media > img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease;
    }
    .card:hover .card__media > img {
      transform: scale(1.04);
    }
    .card__placeholder {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 65%),
        linear-gradient(160deg, var(--nx-surface-2), var(--nx-media-bg));
    }
    .card__placeholder img {
      width: 38%;
      max-width: 120px;
      opacity: 0.85;
      filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.5));
    }
    .card__placeholder span {
      font-size: clamp(1.6rem, 6vw, 2.6rem);
      font-weight: 700;
      letter-spacing: 0.04em;
      color: color-mix(in srgb, var(--accent) 70%, var(--nx-white));
    }
    .card__tags {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }
    .card__tag {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: var(--nx-pill);
      letter-spacing: 0.02em;
    }
    .card__tag--accent {
      background: var(--nx-cyan);
      color: var(--nx-on-accent);
    }
    .card__tag--sale {
      background: var(--nx-danger);
      color: var(--nx-white);
    }
    .card__soldout {
      position: absolute;
      inset: auto 0 0 0;
      padding: 0.35rem;
      text-align: center;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(0, 0, 0, 0.72);
      color: var(--nx-muted);
    }
    .card__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      padding: 0.75rem;
    }
    .card__division {
      color: var(--accent);
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    h3 {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    p {
      display: none;
      margin: 0;
      color: var(--nx-muted);
      font-size: 0.88rem;
      line-height: 1.4;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card__price {
      display: flex;
      flex-wrap: wrap;
      gap: 0.2rem 0.5rem;
      align-items: baseline;
      margin-top: auto;
      padding-top: 0.35rem;
    }
    .card__price strong {
      font-size: 1.05rem;
    }
    .card__price s {
      color: var(--nx-muted);
      font-size: 0.82rem;
    }
    @media (min-width: 640px) {
      .card__body {
        padding: 1rem;
      }
      h3 {
        font-size: 1.02rem;
      }
      p {
        display: -webkit-box;
      }
      .card__price strong {
        font-size: 1.15rem;
      }
    }
  `,
})
export class ProductCard {
  @Input({ required: true }) product!: Product;
  /** División de respaldo cuando el producto viene sin la relación cargada. */
  @Input() division?: Division | null;

  get owner(): Division | undefined | null {
    return this.product.division || this.division;
  }

  get accent() {
    return this.owner?.primaryColor || 'var(--nx-cyan)';
  }

  get image() {
    return this.product.images?.[0]?.url || null;
  }

  get initials() {
    return (this.owner?.name || 'NEXALAB')
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  }

  get discount() {
    const price = Number(this.product.price);
    const compareAtPrice = Number(this.product.compareAtPrice);
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round((1 - price / compareAtPrice) * 100);
  }

  get link() {
    const division = this.owner?.slug || 'tienda';
    const category = this.product.category?.slug || 'producto';
    return ['/', division, category, this.product.slug];
  }
}

import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Division, ServiceItem } from '../../core/models/api.models';

@Component({
  selector: 'app-service-card',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <a class="card" [routerLink]="link" [style.--accent]="accent">
      <div class="card__media">
        @if (service.imageUrl) {
          <img [src]="service.imageUrl" [alt]="service.name" loading="lazy" />
        } @else {
          <div class="card__placeholder" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
        }
        <span class="card__kind">Servicio</span>
      </div>
      <div class="card__body">
        @if (owner?.name) {
          <span class="card__division">{{ owner!.name }}</span>
        }
        <h3>{{ service.name }}</h3>
        @if (service.description) {
          <p>{{ service.description }}</p>
        }
        <div class="card__foot">
          <strong>
            @if (service.priceType === 'quote') {
              Bajo cotización
            } @else if (service.priceType === 'from') {
              <small>Desde</small> {{ service.price | currency: 'USD' : 'symbol-narrow' }}
            } @else {
              {{ service.price | currency: 'USD' : 'symbol-narrow' }}
            }
          </strong>
          @if (service.durationApprox) {
            <span class="card__duration">{{ service.durationApprox }}</span>
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
      aspect-ratio: 16 / 10;
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
      color: var(--accent);
      background:
        radial-gradient(circle at 70% 30%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 65%),
        linear-gradient(160deg, var(--nx-surface-2), var(--nx-media-bg));
    }
    .card__kind {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: var(--nx-pill);
      background: rgba(0, 0, 0, 0.65);
      border: 1px solid color-mix(in srgb, var(--accent) 60%, transparent);
      color: var(--nx-white);
      backdrop-filter: blur(4px);
    }
    .card__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      padding: 1rem;
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
      font-size: 1.02rem;
      line-height: 1.3;
    }
    p {
      margin: 0;
      color: var(--nx-muted);
      font-size: 0.88rem;
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card__foot {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.35rem 0.75rem;
      margin-top: auto;
      padding-top: 0.6rem;
      border-top: 1px solid var(--nx-border);
    }
    .card__foot strong {
      color: var(--accent);
      font-size: 1rem;
    }
    .card__foot small {
      color: var(--nx-muted);
      font-weight: 500;
      font-size: 0.78rem;
    }
    .card__duration {
      color: var(--nx-muted);
      font-size: 0.8rem;
    }
  `,
})
export class ServiceCard {
  @Input({ required: true }) service!: ServiceItem;
  /** División de respaldo cuando el servicio viene sin la relación cargada. */
  @Input() division?: Division | null;

  get owner(): Division | undefined | null {
    return this.service.division || this.division;
  }

  get accent() {
    return this.owner?.primaryColor || 'var(--nx-cyan)';
  }

  get link() {
    const division = this.owner?.slug || 'tienda';
    const category = this.service.category?.slug || 'servicio';
    return ['/', division, category, this.service.slug];
  }
}

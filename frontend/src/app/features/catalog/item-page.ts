import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { Product, ServiceItem } from '../../core/models/api.models';
import { CatalogService } from '../../core/services/catalog.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductDetailPage } from '../products/product-detail';

/**
 * Resuelve /:divisionSlug/:categorySlug/:itemSlug
 * Intentando primero producto y luego servicio.
 */
@Component({
  selector: 'app-catalog-item-page',
  imports: [RouterLink, CurrencyPipe, ProductDetailPage],
  template: `
    @if (mode() === 'loading') {
      <div class="nx-empty">Cargando…</div>
    } @else if (mode() === 'product') {
      <app-product-detail />
    } @else if (mode() === 'service' && service()) {
      <section class="service nx-container" [style.--accent]="service()!.division?.primaryColor || null">
        <nav class="nx-crumbs" aria-label="Ruta">
          <a routerLink="/">NEXALAB</a>
          <span>/</span>
          @if (service()!.division) {
            <a [routerLink]="['/', service()!.division!.slug]">{{ service()!.division!.name }}</a>
            <span>/</span>
          }
          <span>{{ service()!.name }}</span>
        </nav>
        <div class="service__grid">
          @if (service()!.imageUrl) {
            <img [src]="service()!.imageUrl" [alt]="service()!.name" />
          } @else {
            <div class="service__placeholder" aria-hidden="true"></div>
          }
          <div>
            <p class="nx-eyebrow">Servicio · {{ service()!.division?.name }}</p>
            <h1>{{ service()!.name }}</h1>
            <p class="desc">{{ service()!.description }}</p>
            <p class="price">
              @if (service()!.priceType === 'quote') { Bajo cotización }
              @else if (service()!.priceType === 'from') {
                Desde {{ service()!.price | currency: 'USD' : 'symbol-narrow' }}
              } @else {
                {{ service()!.price | currency: 'USD' : 'symbol-narrow' }}
              }
            </p>
            @if (service()!.durationApprox) {
              <p class="meta">Duración aprox.: {{ service()!.durationApprox }}</p>
            }
            @if (service()!.features?.length) {
              <ul class="features">
                @for (f of service()!.features!; track f) {
                  <li>{{ f }}</li>
                }
              </ul>
            }
            <button class="nx-btn nx-btn-primary" type="button" (click)="requestService()">
              Solicitar servicio
            </button>
          </div>
        </div>
      </section>
    } @else {
      <div class="nx-empty">
        <p>No encontramos este ítem.</p>
        <a class="nx-btn nx-btn-primary" routerLink="/tienda">Ir a la tienda</a>
      </div>
    }
  `,
  styles: `
    .service { --accent: var(--nx-cyan); padding-top: 1.5rem; padding-bottom: 4rem; }
    .service__grid { display: grid; gap: 1.75rem; }
    .service__grid > img,
    .service__placeholder { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: var(--nx-radius-lg); border: 1px solid var(--nx-border); background: var(--nx-media-bg); }
    .service__placeholder { background: radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 65%), linear-gradient(160deg, var(--nx-surface-2), var(--nx-media-bg)); }
    h1 { margin: 0 0 .75rem; font-size: clamp(1.6rem, 4vw, 2.4rem); line-height: 1.15; letter-spacing: -.02em; }
    .desc { color: var(--nx-muted); line-height: 1.6; }
    .price { font-size: 1.5rem; font-weight: 700; color: var(--accent); margin: 1.25rem 0 .35rem; }
    .meta { color: var(--nx-muted); margin: 0 0 1.25rem; }
    .features { list-style: none; padding: 0; margin: 0 0 1.5rem; display: grid; gap: .55rem; }
    .features li { position: relative; padding-left: 1.6rem; color: var(--nx-white); line-height: 1.45; }
    .features li::before { content: ''; position: absolute; left: 0; top: .2rem; width: 1rem; height: 1rem; border-radius: 50%; background: color-mix(in srgb, var(--accent) 22%, transparent); box-shadow: inset 0 0 0 1px var(--accent); }
    @media (min-width: 960px) {
      .service { padding-top: 2rem; }
      .service__grid { grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }
    }
  `,
})
export class CatalogItemPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  mode = signal<'loading' | 'product' | 'service' | 'missing'>('loading');
  service = signal<ServiceItem | null>(null);

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.mode.set('loading');
          const slug = params.get('itemSlug') || '';
          const divisionSlug = params.get('divisionSlug') || undefined;
          return this.catalog.getProduct(slug, divisionSlug).pipe(
            catchError(() => of(null as Product | null)),
            switchMap((product) => {
              if (product) {
                return of({ kind: 'product' as const, product, service: null });
              }
              return this.catalog.getService(slug, divisionSlug).pipe(
                catchError(() => of(null)),
                switchMap((service) =>
                  of({
                    kind: service ? ('service' as const) : ('missing' as const),
                    product: null,
                    service,
                  }),
                ),
              );
            }),
          );
        }),
      )
      .subscribe({
        next: (result) => {
          if (result.kind === 'product') {
            this.mode.set('product');
            return;
          }
          if (result.kind === 'service' && result.service) {
            this.service.set(result.service);
            this.mode.set('service');
            const pageTitle =
              result.service.seoTitle || `NEXALAB | ${result.service.name}`;
            this.title.setTitle(pageTitle);
            this.meta.updateTag({
              name: 'description',
              content:
                result.service.seoDescription ||
                result.service.description ||
                '',
            });
            return;
          }
          this.mode.set('missing');
        },
        error: () => this.mode.set('missing'),
      });
  }

  requestService() {
    this.toast.success('Solicitud registrada. Te contactaremos pronto.');
  }
}

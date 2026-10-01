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
      <section class="service">
        <nav class="crumbs">
          <a routerLink="/">NEXALAB</a>
          <span>/</span>
          @if (service()!.division) {
            <a [routerLink]="['/', service()!.division!.slug]">{{ service()!.division!.name }}</a>
            <span>/</span>
          }
          <span>{{ service()!.name }}</span>
        </nav>
        <div class="service__grid">
          <img [src]="service()!.imageUrl || 'assets/brand/icon.png'" [alt]="service()!.name" />
          <div>
            <p class="eyebrow">{{ service()!.division?.name }}</p>
            <h1>{{ service()!.name }}</h1>
            <p class="desc">{{ service()!.description }}</p>
            <p class="price">
              @if (service()!.priceType === 'quote') { Solicitar cotización }
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
              <ul>
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
    .service { padding: 1.5rem 1.25rem 3.5rem; }
    .crumbs { display:flex; flex-wrap:wrap; gap:.4rem; color:var(--nx-muted); font-size:.85rem; margin-bottom:1.5rem; }
    .crumbs a:hover { color: var(--nx-cyan); }
    .service__grid { display:grid; gap:1.5rem; }
    .service__grid img { width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:14px; border:1px solid var(--nx-border); background:#111; }
    .eyebrow { margin:0 0 .4rem; color:var(--nx-cyan); text-transform:uppercase; letter-spacing:.08em; font-size:.78rem; }
    h1 { margin:0 0 .75rem; font-size:clamp(1.6rem,3vw,2.3rem); }
    .desc { color:var(--nx-muted); line-height:1.55; }
    .price { font-size:1.35rem; font-weight:700; color:var(--nx-cyan); }
    .meta { color:var(--nx-muted); }
    ul { padding-left:1.1rem; color:var(--nx-muted); }
    @media (min-width:900px) {
      .service { padding: 2rem 2.5rem 4rem; }
      .service__grid { grid-template-columns: .9fr 1.1fr; gap:2.5rem; align-items:start; }
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

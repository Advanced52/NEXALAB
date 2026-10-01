import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Division, Product } from '../../core/models/api.models';
import {
  CatalogService,
  HomeHero,
} from '../../core/services/catalog.service';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(true);
  error = signal<string | null>(null);
  hero = signal<HomeHero>({
    brand: 'NEXALAB',
    headline: 'Creatividad, tecnología y fabricación.',
    subheadline:
      'Moda, impresión 3D, tecnología y robótica bajo una misma marca.',
    ctaLabel: 'Ver catálogo',
    ctaHref: '/tienda',
  });
  divisions = signal<Division[]>([]);
  featured = signal<Product[]>([]);
  activeSlide = signal(0);
  carouselPaused = signal(false);

  private carouselTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.title.setTitle('NEXALAB | Creatividad, tecnología y fabricación');
    this.meta.updateTag({
      name: 'description',
      content:
        'NEXALAB — moda, impresión 3D, tecnología y robótica bajo una misma marca.',
    });

    this.destroyRef.onDestroy(() => this.stopCarousel());

    forkJoin({
      hero: this.catalog.getHomeHero(),
      divisions: this.catalog.getDivisions(),
      featured: this.catalog
        .getProducts({ featured: true })
        .pipe(catchError(() => of([] as Product[]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ hero, divisions, featured }) => {
          this.hero.set(hero);
          this.divisions.set(divisions);
          this.featured.set(featured.slice(0, 8));
          this.loading.set(false);
          this.startCarousel();
        },
        error: () => {
          this.error.set(
            'No se pudo conectar con la API. Verifica que el backend esté en marcha.',
          );
          this.loading.set(false);
        },
      });
  }

  slideImage(division: Division): string {
    return division.bannerUrl || division.logoUrl || 'assets/brand/icon.png';
  }

  selectSlide(index: number) {
    const total = this.divisions().length;
    if (!total) return;
    this.activeSlide.set(((index % total) + total) % total);
  }

  nextSlide() {
    this.selectSlide(this.activeSlide() + 1);
  }

  prevSlide() {
    this.selectSlide(this.activeSlide() - 1);
  }

  pauseCarousel() {
    this.carouselPaused.set(true);
  }

  resumeCarousel() {
    this.carouselPaused.set(false);
  }

  scrollToExplore(event: Event) {
    event.preventDefault();
    document.querySelector('#explora')?.scrollIntoView({ behavior: 'smooth' });
  }

  private startCarousel() {
    this.stopCarousel();
    if (this.divisions().length < 2) return;

    this.carouselTimer = setInterval(() => {
      if (!this.carouselPaused()) {
        this.nextSlide();
      }
    }, 4500);
  }

  private stopCarousel() {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
      this.carouselTimer = null;
    }
  }
}

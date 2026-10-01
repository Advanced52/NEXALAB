import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { Division } from '../../core/models/api.models';
import { CatalogService } from '../../core/services/catalog.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-division-page',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './division-page.html',
  styleUrl: './division-page.scss',
})
export class DivisionPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  loading = signal(true);
  error = signal<string | null>(null);
  division = signal<Division | null>(null);

  ngOnInit() {
    this.route.paramMap
      .pipe(switchMap((params) => this.catalog.getDivision(params.get('slug') || '')))
      .subscribe({
        next: (division) => {
          this.division.set(division);
          this.loading.set(false);
          this.error.set(null);
          this.applySeo(division);
        },
        error: () => {
          this.division.set(null);
          this.loading.set(false);
          this.error.set('División no encontrada.');
        },
      });
  }

  private applySeo(division: Division) {
    const pageTitle = division.seoTitle || `NEXALAB | ${division.name}`;
    const description =
      division.seoDescription ||
      division.shortDescription ||
      division.description ||
      '';
    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    if (division.ogImage || division.bannerUrl) {
      this.meta.updateTag({
        property: 'og:image',
        content: division.ogImage || division.bannerUrl || '',
      });
    }
  }
}

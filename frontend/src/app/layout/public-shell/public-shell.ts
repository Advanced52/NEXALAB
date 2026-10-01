import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Division } from '../../core/models/api.models';

@Component({
  selector: 'app-public-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './public-shell.html',
  styleUrl: './public-shell.scss',
})
export class PublicShell {
  private readonly catalog = inject(CatalogService);
  readonly cart = inject(CartService);
  readonly toast = inject(ToastService);
  readonly menuOpen = signal(false);
  readonly divisions = signal<Division[]>([]);
  readonly year = new Date().getFullYear();

  constructor() {
    this.catalog.getDivisions().subscribe({
      next: (items) => this.divisions.set(items),
      error: () => this.divisions.set([]),
    });
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}

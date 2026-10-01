import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  stats = signal({
    divisions: 0,
    categories: 0,
    products: 0,
    services: 0,
    users: 0,
  });

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    forkJoin({
      divisions: this.api.getDivisions(),
      categories: this.api.getCategories(),
      products: this.api.getProducts(),
      services: this.api.getServices(),
      users: this.api.getUsers(),
    }).subscribe({
      next: (data) => {
        this.stats.set({
          divisions: data.divisions.length,
          categories: data.categories.length,
          products: data.products.length,
          services: data.services.length,
          users: data.users.length,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No se pudo cargar el dashboard. ¿Backend activo?');
      },
    });
  }
}

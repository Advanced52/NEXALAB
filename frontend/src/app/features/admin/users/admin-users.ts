import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthUser } from '../../../core/models/api.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);

  items = signal<AuthUser[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.getUsers().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Error al cargar usuarios');
      },
    });
  }
}

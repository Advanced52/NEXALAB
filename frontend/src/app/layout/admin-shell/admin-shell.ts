import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
})
export class AdminShell {
  readonly auth = inject(AuthService);
  readonly toast = inject(ToastService);
  readonly menuOpen = signal(false);

  readonly links = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/divisions', label: 'Divisiones', exact: false },
    { path: '/admin/categories', label: 'Categorías', exact: false },
    { path: '/admin/products', label: 'Productos', exact: false },
    { path: '/admin/services', label: 'Servicios', exact: false },
    { path: '/admin/orders', label: 'Pedidos', exact: false },
    { path: '/admin/customers', label: 'Clientes', exact: false },
    { path: '/admin/inventory', label: 'Inventario', exact: false },
    { path: '/admin/users', label: 'Usuarios', exact: false },
    { path: '/admin/settings', label: 'Configuración', exact: false },
  ];

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  logout() {
    this.auth.logout();
    this.toast.info('Sesión cerrada');
  }
}

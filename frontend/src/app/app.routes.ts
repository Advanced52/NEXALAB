import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin/login/admin-login').then((m) => m.AdminLogin),
  },
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./layout/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard').then(
            (m) => m.AdminDashboard,
          ),
      },
      {
        path: 'divisions',
        loadComponent: () =>
          import('./features/admin/divisions/admin-divisions').then(
            (m) => m.AdminDivisions,
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/admin-categories').then(
            (m) => m.AdminCategories,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products/admin-products').then(
            (m) => m.AdminProducts,
          ),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/admin/services/admin-services').then(
            (m) => m.AdminServices,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/admin-users').then((m) => m.AdminUsers),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/settings/admin-settings').then(
            (m) => m.AdminSettings,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/placeholder/admin-placeholder').then(
            (m) => m.AdminPlaceholder,
          ),
        data: { title: 'Pedidos', subtitle: 'Gestión de pedidos multi-división.' },
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/admin/placeholder/admin-placeholder').then(
            (m) => m.AdminPlaceholder,
          ),
        data: { title: 'Clientes', subtitle: 'Base de clientes NEXALAB.' },
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/admin/placeholder/admin-placeholder').then(
            (m) => m.AdminPlaceholder,
          ),
        data: { title: 'Inventario', subtitle: 'Control de stock e inventario.' },
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/public-shell/public-shell').then((m) => m.PublicShell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home').then((m) => m.HomePage),
      },
      {
        path: 'tienda',
        loadComponent: () =>
          import('./features/shop/shop-page').then((m) => m.ShopPage),
      },
      {
        path: 'carrito',
        loadComponent: () =>
          import('./features/cart/cart-page').then((m) => m.CartPage),
      },
      {
        path: ':divisionSlug/:categorySlug/:itemSlug',
        loadComponent: () =>
          import('./features/catalog/item-page').then((m) => m.CatalogItemPage),
      },
      {
        path: ':divisionSlug/:categorySlug',
        loadComponent: () =>
          import('./features/categories/category-page').then(
            (m) => m.CategoryPage,
          ),
      },
      {
        path: ':slug',
        loadComponent: () =>
          import('./features/divisions/division-page').then(
            (m) => m.DivisionPage,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category, Division, Product } from '../../../core/models/api.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ImageUpload } from '../../../shared/image-upload/image-upload';

@Component({
  selector: 'app-admin-products',
  imports: [FormsModule, ImageUpload],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss',
})
export class AdminProducts implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);

  items = signal<Product[]>([]);
  divisions = signal<Division[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId: string | null = null;

  form = {
    divisionId: '',
    categoryId: '',
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    price: 0,
    compareAtPrice: null as number | null,
    sku: '',
    stock: 0,
    isActive: true,
    isFeatured: false,
    imageUrl: '',
  };

  ngOnInit() {
    this.api.getDivisions().subscribe({ next: (d) => this.divisions.set(d) });
    this.api.getCategories().subscribe({ next: (c) => this.categories.set(c) });
    this.load();
  }

  filteredCategories() {
    return this.categories().filter((c) => c.divisionId === this.form.divisionId);
  }

  load() {
    this.loading.set(true);
    this.api.getProducts().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Error al cargar productos');
      },
    });
  }

  openCreate() {
    this.editingId = null;
    this.form = {
      divisionId: this.divisions()[0]?.id || '',
      categoryId: '',
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      price: 0,
      compareAtPrice: null,
      sku: '',
      stock: 0,
      isActive: true,
      isFeatured: false,
      imageUrl: '',
    };
    this.showForm.set(true);
  }

  openEdit(item: Product) {
    this.editingId = item.id;
    this.form = {
      divisionId: item.divisionId,
      categoryId: item.categoryId || '',
      name: item.name,
      slug: item.slug,
      shortDescription: item.shortDescription || '',
      description: item.description || '',
      price: Number(item.price),
      compareAtPrice: item.compareAtPrice != null ? Number(item.compareAtPrice) : null,
      sku: item.sku || '',
      stock: item.stock,
      isActive: item.isActive,
      isFeatured: item.isFeatured,
      imageUrl: item.images?.[0]?.url || '',
    };
    this.showForm.set(true);
  }

  save() {
    const payload: Record<string, unknown> = {
      divisionId: this.form.divisionId,
      categoryId: this.form.categoryId || undefined,
      name: this.form.name,
      slug: this.form.slug || undefined,
      shortDescription: this.form.shortDescription || undefined,
      description: this.form.description || undefined,
      price: Number(this.form.price),
      compareAtPrice: this.form.compareAtPrice != null ? Number(this.form.compareAtPrice) : undefined,
      sku: this.form.sku || undefined,
      stock: Number(this.form.stock),
      isActive: this.form.isActive,
      isFeatured: this.form.isFeatured,
    };

    if (this.form.imageUrl) {
      payload['images'] = [{ url: this.form.imageUrl, isPrimary: true, sortOrder: 0 }];
    }

    const req = this.editingId
      ? this.api.updateProduct(this.editingId, payload)
      : this.api.createProduct(payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'Producto actualizado' : 'Producto creado');
        this.showForm.set(false);
        this.load();
      },
      error: (err) => this.toast.error(err?.error?.message || 'No se pudo guardar'),
    });
  }

  remove(item: Product) {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;
    this.api.deleteProduct(item.id).subscribe({
      next: () => {
        this.toast.success('Producto eliminado');
        this.load();
      },
      error: () => this.toast.error('No se pudo eliminar'),
    });
  }
}

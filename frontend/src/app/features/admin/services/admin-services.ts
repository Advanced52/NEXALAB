import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category, Division, ServiceItem } from '../../../core/models/api.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ImageUpload } from '../../../shared/image-upload/image-upload';

@Component({
  selector: 'app-admin-services',
  imports: [FormsModule, ImageUpload, CurrencyPipe],
  templateUrl: './admin-services.html',
  styleUrl: './admin-services.scss',
})
export class AdminServices implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);

  items = signal<ServiceItem[]>([]);
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
    description: '',
    priceType: 'quote',
    price: null as number | null,
    durationApprox: '',
    imageUrl: '',
    isActive: true,
    isFeatured: false,
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
    this.api.getServices().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Error al cargar servicios');
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
      description: '',
      priceType: 'quote',
      price: null,
      durationApprox: '',
      imageUrl: '',
      isActive: true,
      isFeatured: false,
    };
    this.showForm.set(true);
  }

  openEdit(item: ServiceItem) {
    this.editingId = item.id;
    this.form = {
      divisionId: item.divisionId,
      categoryId: item.categoryId || '',
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      priceType: item.priceType,
      price: item.price != null ? Number(item.price) : null,
      durationApprox: item.durationApprox || '',
      imageUrl: item.imageUrl || '',
      isActive: item.isActive,
      isFeatured: item.isFeatured,
    };
    this.showForm.set(true);
  }

  save() {
    const payload = {
      divisionId: this.form.divisionId,
      categoryId: this.form.categoryId || undefined,
      name: this.form.name,
      slug: this.form.slug || undefined,
      description: this.form.description || undefined,
      priceType: this.form.priceType,
      price: this.form.price != null ? Number(this.form.price) : undefined,
      durationApprox: this.form.durationApprox || undefined,
      imageUrl: this.form.imageUrl || undefined,
      isActive: this.form.isActive,
      isFeatured: this.form.isFeatured,
    };

    const req = this.editingId
      ? this.api.updateService(this.editingId, payload)
      : this.api.createService(payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'Servicio actualizado' : 'Servicio creado');
        this.showForm.set(false);
        this.load();
      },
      error: (err) => this.toast.error(err?.error?.message || 'No se pudo guardar'),
    });
  }

  remove(item: ServiceItem) {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;
    this.api.deleteService(item.id).subscribe({
      next: () => {
        this.toast.success('Servicio eliminado');
        this.load();
      },
      error: () => this.toast.error('No se pudo eliminar'),
    });
  }
}

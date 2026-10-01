import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Division } from '../../../core/models/api.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ImageUpload } from '../../../shared/image-upload/image-upload';

@Component({
  selector: 'app-admin-divisions',
  imports: [FormsModule, ImageUpload],
  templateUrl: './admin-divisions.html',
  styleUrl: './admin-divisions.scss',
})
export class AdminDivisions implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);

  items = signal<Division[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId: string | null = null;

  form = {
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    primaryColor: '#34b3f1',
    sortOrder: 0,
    isActive: true,
    logoUrl: '',
    bannerUrl: '',
    heroImageUrl: '',
    seoTitle: '',
    seoDescription: '',
  };

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getDivisions().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Error al cargar divisiones');
      },
    });
  }

  openCreate() {
    this.editingId = null;
    this.form = {
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      primaryColor: '#34b3f1',
      sortOrder: this.items().length + 1,
      isActive: true,
      logoUrl: '',
      bannerUrl: '',
    heroImageUrl: '',
      seoTitle: '',
      seoDescription: '',
    };
    this.showForm.set(true);
  }

  openEdit(item: Division) {
    this.editingId = item.id;
    this.form = {
      name: item.name,
      slug: item.slug,
      shortDescription: item.shortDescription || '',
      description: item.description || '',
      primaryColor: item.primaryColor || '#34b3f1',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      logoUrl: item.logoUrl || '',
      bannerUrl: item.bannerUrl || '',
      heroImageUrl: item.heroImageUrl || '',
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
    };
    this.showForm.set(true);
  }

  save() {
    const payload = {
      ...this.form,
      slug: this.form.slug || undefined,
      logoUrl: this.form.logoUrl || undefined,
      bannerUrl: this.form.bannerUrl || undefined,
      // null permite quitar la imagen y volver a usar el banner
      heroImageUrl: this.form.heroImageUrl || null,
      seoTitle: this.form.seoTitle || undefined,
      seoDescription: this.form.seoDescription || undefined,
    };

    const req = this.editingId
      ? this.api.updateDivision(this.editingId, payload)
      : this.api.createDivision(payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'División actualizada' : 'División creada');
        this.showForm.set(false);
        this.load();
      },
      error: (err) => this.toast.error(err?.error?.message || 'No se pudo guardar'),
    });
  }

  remove(item: Division) {
    if (!confirm(`¿Eliminar la división "${item.name}"?`)) return;
    this.api.deleteDivision(item.id).subscribe({
      next: () => {
        this.toast.success('División eliminada');
        this.load();
      },
      error: () => this.toast.error('No se pudo eliminar'),
    });
  }
}

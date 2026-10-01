import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category, Division } from '../../../core/models/api.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ImageUpload } from '../../../shared/image-upload/image-upload';

@Component({
  selector: 'app-admin-categories',
  imports: [FormsModule, ImageUpload],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.scss',
})
export class AdminCategories implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);

  items = signal<Category[]>([]);
  divisions = signal<Division[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId: string | null = null;

  form = {
    divisionId: '',
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    sortOrder: 0,
    isActive: true,
  };

  ngOnInit() {
    this.api.getDivisions().subscribe({
      next: (d) => this.divisions.set(d),
    });
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getCategories().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Error al cargar categorías');
      },
    });
  }

  openCreate() {
    this.editingId = null;
    this.form = {
      divisionId: this.divisions()[0]?.id || '',
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      sortOrder: 0,
      isActive: true,
    };
    this.showForm.set(true);
  }

  openEdit(item: Category) {
    this.editingId = item.id;
    this.form = {
      divisionId: item.divisionId,
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    };
    this.showForm.set(true);
  }

  save() {
    const payload = {
      ...this.form,
      slug: this.form.slug || undefined,
      imageUrl: this.form.imageUrl || undefined,
    };
    const req = this.editingId
      ? this.api.updateCategory(this.editingId, payload)
      : this.api.createCategory(payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'Categoría actualizada' : 'Categoría creada');
        this.showForm.set(false);
        this.load();
      },
      error: (err) => this.toast.error(err?.error?.message || 'No se pudo guardar'),
    });
  }

  remove(item: Category) {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;
    this.api.deleteCategory(item.id).subscribe({
      next: () => {
        this.toast.success('Categoría eliminada');
        this.load();
      },
      error: () => this.toast.error('No se pudo eliminar'),
    });
  }
}

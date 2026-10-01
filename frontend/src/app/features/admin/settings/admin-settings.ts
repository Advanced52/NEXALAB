import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Setting } from '../../../core/models/api.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-settings',
  imports: [FormsModule],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.scss',
})
export class AdminSettings implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);

  items = signal<Setting[]>([]);
  loading = signal(true);

  hero = {
    brand: 'NEXALAB',
    headline: 'Creatividad, tecnología y fabricación.',
    subheadline: 'Moda, impresión 3D, tecnología y robótica bajo una misma marca.',
    ctaLabel: 'Explora NEXALAB',
    ctaHref: '#divisiones',
  };

  ngOnInit() {
    this.api.getSettings().subscribe({
      next: (items) => {
        this.items.set(items);
        const hero = items.find((s) => s.key === 'home.hero');
        if (hero && typeof hero.value === 'object' && hero.value) {
          this.hero = { ...this.hero, ...(hero.value as typeof this.hero) };
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Error al cargar configuración');
      },
    });
  }

  saveHero() {
    this.api
      .upsertSetting({
        key: 'home.hero',
        value: this.hero,
        description: 'Contenido del hero de la página principal',
        isPublic: true,
      })
      .subscribe({
        next: () => this.toast.success('Hero actualizado'),
        error: () => this.toast.error('No se pudo guardar'),
      });
  }
}

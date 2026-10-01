import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-admin-placeholder',
  template: `
    <section>
      <h1 class="nx-page-title">{{ data()?.['title'] || 'Módulo' }}</h1>
      <p class="nx-page-sub">{{ data()?.['subtitle'] || 'Próximamente.' }}</p>
      <div class="nx-card nx-empty">
        Módulo preparado. Se completará en las fases de carrito, checkout y pedidos.
      </div>
    </section>
  `,
})
export class AdminPlaceholder {
  private readonly route = inject(ActivatedRoute);
  readonly data = toSignal(this.route.data.pipe(map((d) => d)));
}

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  email = 'admin@nexalab.local';
  password = '';
  loading = signal(false);

  submit() {
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.toast.success('Sesión iniciada');
        void this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err?.error?.message || 'Credenciales inválidas');
      },
      complete: () => this.loading.set(false),
    });
  }
}

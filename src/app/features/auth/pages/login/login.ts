import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly verClave = signal(false);

  protected readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.maxLength(72)]]
  });

  protected get expirada(): boolean {
    return this.route.snapshot.queryParamMap.get('expirada') === '1';
  }

  ingresar(): void {
    if (this.enviando()) {
      return;
    }

    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);

    this.auth.login(this.form.getRawValue())
      .pipe(
        finalize(() => this.enviando.set(false))
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(this.destino());
        },
        error: (err: unknown) => {
          this.form.controls.password.reset();

          if (err instanceof HttpErrorResponse && err.status === 401) {
            this.error.set('Usuario o contraseña incorrectos.');
          } else if (
            err instanceof HttpErrorResponse &&
            err.status === 0
          ) {
            this.error.set(
              'No se pudo conectar con el servidor. Intente nuevamente.'
            );
          } else {
            this.error.set(
              'No se pudo iniciar sesión. Intente nuevamente.'
            );
          }
        }
      });
  }

  /** Solo permite volver a una dirección interna de la aplicación. */
  private destino(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');

    if (
      !url ||
      !url.startsWith('/') ||
      url.startsWith('//') ||
      /[\\\u0000-\u0020]/.test(url)
    ) {
      return '/inicio';
    }

    const ruta = url.split(/[?#]/)[0].replace(/\/+$/, '');

    return ruta === '/login' ? '/inicio' : url;
  }
}

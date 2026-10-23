import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';
import { AuthService } from '../../../../core/auth/auth-service';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe, SiPermiso],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css'
})
export class ProductoList implements OnInit {
  private readonly servicio = inject(ProductoService);
  private readonly auth = inject(AuthService);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(false);
  protected readonly procesando = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly mensaje = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.servicio.listar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: productos => this.productos.set(productos),
        error: (err: unknown) => {
          this.error.set(this.mensajeError(err));
        }
      });
  }

  darDeBaja(producto: Producto): void {
    if (
      !this.auth.tienePermiso('CATALOGO_ESCRIBIR') ||
      !producto.estado ||
      this.procesando() !== null
    ) {
      return;
    }

    const confirmado = window.confirm(
      `¿Desea dar de baja el producto "${producto.nombre}"?`
    );

    if (!confirmado) {
      return;
    }

    this.procesando.set(producto.id);
    this.error.set(null);
    this.mensaje.set(null);

    this.servicio.darDeBaja(producto)
      .pipe(finalize(() => this.procesando.set(null)))
      .subscribe({
        next: actualizado => {
          this.productos.update(lista =>
            lista.map(item =>
              item.id === actualizado.id ? actualizado : item
            )
          );

          this.mensaje.set('Producto dado de baja correctamente.');
        },
        error: (err: unknown) => {
          this.error.set(this.mensajeError(err));
        }
      });
  }

  private mensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 403) {
        return 'No tiene permiso para realizar esta operación.';
      }

      if (err.status === 0) {
        return 'No se pudo conectar con el servidor.';
      }

      const detalle = err.error?.mensaje ?? err.error?.message;

      if (typeof detalle === 'string' && detalle.trim()) {
        return detalle;
      }

      return `No se pudo completar la operación. Código HTTP: ${err.status}.`;
    }

    return 'Ocurrió un error inesperado.';
  }
}

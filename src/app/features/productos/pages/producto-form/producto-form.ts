import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';

import { ProductoService } from '../../services/producto-service';
import { ProductoRequest } from '../../models/producto.model';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { AuthService } from '../../../../core/auth/auth-service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css'
})
export class ProductoForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productos = inject(ProductoService);
  private readonly categoriasService = inject(CategoriaService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private productoId: number | null = null;

  protected readonly editando = signal(false);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly listo = signal(false);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150),
        Validators.pattern(/\S/)
      ]
    ],
    precio: [
      0,
      [
        Validators.required,
        Validators.min(0.01),
        Validators.max(99999999.99),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]
    ],
    stock: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(2147483647),
        Validators.pattern(/^\d+$/)
      ]
    ],
    estado: [true, Validators.required],
    categoriaId: [
      0,
      [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^\d+$/)
      ]
    ]
  });

  ngOnInit(): void {
    const idTexto = this.route.snapshot.paramMap.get('id');

    if (idTexto !== null) {
      const id = Number(idTexto);

      if (!Number.isSafeInteger(id) || id <= 0) {
        this.error.set('El identificador del producto no es válido.');
        this.cargando.set(false);
        return;
      }

      this.productoId = id;
      this.editando.set(true);
    }

    forkJoin({
      categorias: this.categoriasService.listar(),
      producto: this.productoId !== null
        ? this.productos.obtener(this.productoId)
        : of(null)
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ categorias, producto }) => {
          this.categorias.set(categorias);

          if (producto) {
            this.form.setValue({
              nombre: producto.nombre,
              precio: producto.precio,
              stock: producto.stock,
              estado: producto.estado,
              categoriaId: producto.categoriaId
            });
          }

          this.listo.set(true);
        },
        error: (err: unknown) => {
          this.error.set(this.mensajeError(err));
        }
      });
  }

  guardar(): void {
    if (
      this.guardando() ||
      this.cargando() ||
      !this.listo()
    ) {
      return;
    }

    this.error.set(null);

    if (!this.auth.tienePermiso('CATALOGO_ESCRIBIR')) {
      this.error.set('No tiene permiso para guardar productos.');
      return;
    }

    this.form.controls.nombre.setValue(
      this.form.controls.nombre.value.trim()
    );

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos: ProductoRequest = this.form.getRawValue();

    const categoriaExiste = this.categorias().some(
      categoria => categoria.id === datos.categoriaId
    );

    if (!categoriaExiste) {
      this.error.set('Seleccione una categoría válida.');
      return;
    }

    const peticion = this.productoId === null
      ? this.productos.crear(datos)
      : this.productos.actualizar(this.productoId, datos);

    this.guardando.set(true);

    peticion
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/productos']);
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

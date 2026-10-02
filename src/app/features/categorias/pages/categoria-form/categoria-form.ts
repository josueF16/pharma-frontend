import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CategoriaService } from '../../services/categoria-service';
import { CategoriaRequest } from '../../models/categoria.model';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './categoria-form.html',
  styleUrl: './categoria-form.css'
})
export class CategoriaForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(CategoriaService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');

  id: number | null = null;

  readonly formulario = this.fb.nonNullable.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]
    ],
    descripcion: ['', Validators.maxLength(200)],
    estado: [true]
  });

  ngOnInit(): void {
    const parametro = this.ruta.snapshot.paramMap.get('id');

    if (parametro === null) {
      return;
    }

    this.id = Number(parametro);

    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.error.set('El ID de la categoría no es válido.');
      this.formulario.disable();
      return;
    }

    this.cargando.set(true);
    this.formulario.disable();

    this.servicio.obtener(this.id).subscribe({
      next: (categoria) => {
        this.formulario.patchValue({
          nombre: categoria.nombre,
          descripcion: categoria.descripcion ?? '',
          estado: categoria.estado
        });

        this.formulario.enable();
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(
          err.error?.mensaje ||
          err.error?.message ||
          'No se pudo cargar la categoría.'
        );

        this.cargando.set(false);
      }
    });
  }

  guardar(): void {
    if (this.guardando() || this.formulario.disabled) {
      return;
    }

    const nombre = this.formulario.controls.nombre.value.trim();
    this.formulario.controls.nombre.setValue(nombre);
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) {
      return;
    }

    const valores = this.formulario.getRawValue();

    const datos: CategoriaRequest = {
      nombre: valores.nombre,
      descripcion: valores.descripcion.trim() || null,
      estado: valores.estado
    };

    this.guardando.set(true);
    this.error.set('');

    const peticion = this.id === null
      ? this.servicio.crear(datos)
      : this.servicio.actualizar(this.id, datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);

        this.router.navigate(['/categorias']).catch(() => {
          this.error.set(
            'La categoría se guardó, pero no se pudo abrir el listado.'
          );
        });
      },
      error: (err) => {
        this.error.set(
          err.error?.mensaje ||
          err.error?.message ||
          'No se pudo guardar la categoría.'
        );

        this.guardando.set(false);
      }
    });
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { ReporteService } from '../../services/reporte-service';
import { VentaPorCategoria } from '../../models/reporte.model';
import { mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-ventas-categoria',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './ventas-categoria.html',
  styleUrl: './ventas-categoria.css'
})
export class VentasCategoria {
  private readonly reporteService = inject(ReporteService);

  desde = '';
  hasta = '';

  readonly datos = signal<VentaPorCategoria[]>([]);
  readonly cargando = signal(false);
  readonly consultado = signal(false);
  readonly error = signal('');

  readonly totalUnidades = computed(() =>
    this.datos().reduce(
      (total, fila) => total + fila.cantidadVendida, 0
    )
  );

  readonly totalMonto = computed(() => {
    const total = this.datos().reduce(
      (suma, fila) => suma + fila.montoTotal, 0
    );

    return Math.round((total + Number.EPSILON) * 100) / 100;
  });

  readonly montoMaximo = computed(() =>
    this.datos().reduce(
      (maximo, fila) => Math.max(maximo, fila.montoTotal), 0
    )
  );

  porcentaje(monto: number): number {
    const maximo = this.montoMaximo();
    return maximo > 0 ? (monto / maximo) * 100 : 0;
  }

  generar(): void {
    if (this.cargando()) return;

    this.error.set('');
    this.datos.set([]);
    this.consultado.set(false);

    if (this.desde && this.hasta && this.desde > this.hasta) {
      this.error.set(
        'La fecha Desde no puede ser posterior a la fecha Hasta.'
      );
      return;
    }

    this.cargando.set(true);

    this.reporteService.ventasPorCategoria(
      this.desde || null,
      this.hasta || null
    ).subscribe({
      next: datos => {
        this.datos.set(datos);
        this.consultado.set(true);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeError(error));
        this.cargando.set(false);
      }
    });
  }
}

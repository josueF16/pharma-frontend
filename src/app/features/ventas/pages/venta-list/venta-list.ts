import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { VentaService } from '../../services/venta-service';
import { FiltroVentas, Venta } from '../../models/venta.model';

@Component({
  selector: 'app-venta-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venta-list.html',
  styleUrl: './venta-list.css',
})
export class VentaList implements OnInit {
  private readonly ventaService = inject(VentaService);

  ventas = signal<Venta[]>([]);
  cargando = signal(false);
  error = signal('');
  ventaSeleccionada = signal<Venta | null>(null);

  filtro: FiltroVentas = this.crearFiltroVacio();

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    if (this.cargando()) {
      return;
    }

    this.error.set('');

    const { clienteId, desde, hasta } = this.filtro;

    if (
      clienteId !== null &&
      (!Number.isInteger(clienteId) || clienteId <= 0)
    ) {
      this.error.set('El ID del cliente debe ser un número entero positivo.');
      return;
    }

    if (desde && hasta && desde > hasta) {
      this.error.set('La fecha Desde no puede ser posterior a Hasta.');
      return;
    }

    this.cargando.set(true);
    this.ventas.set([]);
    this.ventaSeleccionada.set(null);

    this.ventaService.buscar({ ...this.filtro }).subscribe({
      next: (ventas) => {
        this.ventas.set(ventas);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al consultar ventas:', error);

        this.error.set(
          error.status === 0
            ? 'No se pudo conectar con el backend. Revisa que esté encendido y que la URL de la API sea correcta.'
            : `No se pudieron consultar las ventas. Código HTTP: ${error.status}.`
        );

        this.cargando.set(false);
      },
    });
  }

  limpiar(): void {
    if (this.cargando()) {
      return;
    }

    this.filtro = this.crearFiltroVacio();
    this.buscar();
  }

  verDetalle(venta: Venta): void {
    this.ventaSeleccionada.set(venta);
  }

  cerrarDetalle(): void {
    this.ventaSeleccionada.set(null);
  }

  private crearFiltroVacio(): FiltroVentas {
    return {
      clienteId: null,
      estado: null,
      desde: null,
      hasta: null,
    };
  }
}

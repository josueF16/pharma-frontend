import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { VentaService } from '../../services/venta-service';
import { Venta } from '../../models/venta.model';
import { mensajeError } from '../../../../core/utils/http-error';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-venta-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './venta-detalle.html',
  styleUrl: './venta-detalle.css',
})
export class VentaDetalle implements OnInit {
  private readonly ruta = inject(ActivatedRoute);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly detector = inject(ChangeDetectorRef);

  readonly dniCliente = signal('');

  readonly venta = signal<Venta | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly fechaImpresion = signal(new Date());

imprimir(): void {
  if (this.cargando() || !this.venta()) return;

  this.fechaImpresion.set(new Date());
  window.print();
}

private imprimirSiCorresponde(): void {
  const imprimir = this.ruta.snapshot.queryParamMap.get('imprimir');

  if (imprimir === '1') {
    // Actualiza el comprobante, incluido el DNI, antes de imprimir.
    this.detector.detectChanges();
    this.imprimir();
  }
}

  ngOnInit(): void {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.error.set('El identificador de la venta no es válido.');
      this.cargando.set(false);
      return;
    }

    this.ventaService.obtener(id).subscribe({
  next: (venta) => {
    this.venta.set(venta);
    this.cargando.set(false);

    this.clienteService.obtener(venta.clienteId).subscribe({
      next: (cliente) => {
        this.dniCliente.set(cliente.dni);
        this.imprimirSiCorresponde();
      },
      error: () => {
        // Mantiene visible la venta aunque falle la consulta del DNI.
        this.dniCliente.set('');
        this.imprimirSiCorresponde();
      },
    });
  },
  error: (error: HttpErrorResponse) => {
    this.error.set(
      error.status === 404
        ? 'No se encontró la venta solicitada.'
        : mensajeError(error)
    );
    this.cargando.set(false);
  },
});
  }
}


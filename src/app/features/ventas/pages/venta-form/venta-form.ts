import {
  Component, computed, inject, OnInit, signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { mensajeError } from '../../../../core/utils/http-error';
import { redondear } from '../../../../core/utils/numeros';
import { coincide } from '../../../../core/utils/texto';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { Producto } from '../../../productos/models/producto.model';
import { ProductoService } from '../../../productos/services/producto-service';
import { VentaRequest } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

interface LineaForm {
  productoId: FormControl<number>;
  cantidad: FormControl<number>;
}

@Component({
  selector: 'app-venta-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './venta-form.html',
  styleUrl: './venta-form.css'
})
export class VentaForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly ventaService = inject(VentaService);
  private readonly router = inject(Router);

  readonly clientes = signal<Cliente[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly confirmacion = signal(false);
  readonly imprimirAlRegistrar = signal(false);

  readonly buscarCliente = new FormControl('', { nonNullable: true });
  readonly buscarProducto = new FormControl('', { nonNullable: true });

  readonly formulario = this.fb.group({
    clienteId: this.fb.control<number | null>(
      null, Validators.required
    ),
    detalles: this.fb.array<FormGroup<LineaForm>>(
      [], Validators.required
    )
  });

  get detalles() {
    return this.formulario.controls.detalles;
  }

  private readonly textoCliente = toSignal(
    this.buscarCliente.valueChanges, { initialValue: '' }
  );

  private readonly textoProducto = toSignal(
    this.buscarProducto.valueChanges, { initialValue: '' }
  );

  private readonly valores = toSignal(
    this.formulario.valueChanges,
    { initialValue: this.formulario.value }
  );

  readonly clientesEncontrados = computed(() =>
    this.clientes()
      .filter(cliente => coincide(
        this.textoCliente(),
        cliente.dni,
        cliente.nombres,
        cliente.apellidos
      ))
      .slice(0, 6)
  );

  readonly productosEncontrados = computed(() =>
    this.productos()
      .filter(producto => coincide(
        this.textoProducto(),
        producto.nombre,
        producto.categoriaNombre
      ))
      .slice(0, 6)
  );

  readonly clienteSeleccionado = computed(() =>
    this.clientes().find(
      cliente => cliente.id === this.valores().clienteId
    ) ?? null
  );

  readonly lineas = computed(() =>
    (this.valores().detalles ?? []).map(linea => {
      const producto = this.productos().find(
        item => item.id === linea.productoId
      );

      const cantidad = Number(linea.cantidad ?? 0);

      return {
        producto,
        cantidad,
        subtotal: redondear((producto?.precio ?? 0) * cantidad),
        excedeStock: cantidad > (producto?.stock ?? 0)
      };
    })
  );

  readonly total = computed(() =>
    redondear(this.lineas().reduce(
      (suma, linea) => suma + linea.subtotal, 0
    ))
  );

  ngOnInit(): void {
    forkJoin({
      clientes: this.clienteService.listar(),
      productos: this.productoService.listar()
    }).subscribe({
      next: datos => {
        this.clientes.set(
          datos.clientes.filter(cliente => cliente.estado)
        );

        this.productos.set(
          datos.productos.filter(
            producto => producto.estado && producto.stock > 0
          )
        );

        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeError(error));
        this.cargando.set(false);
      }
    });
  }

  seleccionarCliente(cliente: Cliente): void {
    if (this.confirmacion() || this.guardando()) return;

    this.formulario.controls.clienteId.setValue(cliente.id);
    this.buscarCliente.setValue('');
    this.error.set('');
  }

  agregarProducto(producto: Producto): void {
    if (this.confirmacion() || this.guardando()) return;

    const existente = this.detalles.controls.find(
      linea => linea.controls.productoId.value === producto.id
    );

    if (existente) {
      const cantidad = existente.controls.cantidad.value;

      if (cantidad >= producto.stock) {
        this.error.set('No puedes agregar más unidades: stock insuficiente.');
        return;
      }

      existente.controls.cantidad.setValue(cantidad + 1);
    } else {
      this.detalles.push(
        this.fb.group({
          productoId: this.fb.control(
            producto.id, Validators.required
          ),
          cantidad: this.fb.control(1, [
            Validators.required,
            Validators.min(1),
            Validators.max(producto.stock),
            Validators.pattern(/^[1-9]\d*$/)
          ])
        })
      );
    }

    this.buscarProducto.setValue('');
    this.error.set('');
  }

  agregarPrimerProducto(evento: Event): void {
    evento.preventDefault();

    const producto = this.productosEncontrados()[0];
    if (producto) this.agregarProducto(producto);
  }

  quitarLinea(indice: number): void {
    if (this.confirmacion() || this.guardando()) return;
    this.detalles.removeAt(indice);
  }

  revisar(): void {
    if (this.cargando() || this.guardando()) return;

    this.formulario.markAllAsTouched();
    this.error.set('');

    if (
      this.formulario.invalid ||
      !this.clienteSeleccionado() ||
      this.lineas().some(linea =>
        !linea.producto || linea.excedeStock
      )
    ) {
      this.error.set(
        'Selecciona un cliente y agrega productos con cantidades enteras válidas, sin superar el stock.'
      );
      return;
    }

    this.confirmacion.set(true);
  }

  volverAEditar(): void {
    if (!this.guardando()) this.confirmacion.set(false);
  }

  confirmar(): void {
    if (
      !this.confirmacion() ||
      this.guardando() ||
      this.formulario.invalid
    ) return;

    const valores = this.formulario.getRawValue();
    if (valores.clienteId === null) return;

    const datos: VentaRequest = {
      clienteId: valores.clienteId,
      detalles: valores.detalles.map(linea => ({
        productoId: linea.productoId,
        cantidad: linea.cantidad
      }))
    };

    this.guardando.set(true);
    this.error.set('');

    this.ventaService.registrar(datos).subscribe({
      next: venta => {
        this.router.navigate(['/ventas', venta.id], {
          queryParams: this.imprimirAlRegistrar() ? { imprimir: 1 } : {}
        }).then(abierta => {
          if (!abierta) {
            this.error.set(
              `Venta ${venta.id} registrada. Abre su detalle desde la consulta de ventas.`
            );
          }
        }).catch(() => {
          this.error.set(
            `Venta ${venta.id} registrada, pero no se pudo abrir su detalle.`
          );
        });

        // Impide registrar nuevamente la misma venta.
        this.confirmacion.set(false);
        this.formulario.reset();
        this.detalles.clear();
        this.guardando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(mensajeError(error));
        this.confirmacion.set(false);
        this.guardando.set(false);
      }
    });
  }
}

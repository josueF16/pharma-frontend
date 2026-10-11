export type EstadoVenta = 'REGISTRADA' | 'ANULADA';

// Una línea de la venta, tal como la devuelve el backend.
export interface DetalleVenta {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

// La venta completa que devuelve el backend.
export interface Venta {
  id: number;
  fechaRegistro: string;
  clienteId: number;
  clienteNombre: string;
  estado: EstadoVenta;
  total: number;
  detalles: DetalleVenta[];
}

// Los datos que enviamos para registrar una venta.
export interface VentaRequest {
  clienteId: number;
  detalles: {
    productoId: number;
    cantidad: number;
  }[];
}

// Los filtros para consultar ventas.
export interface FiltroVentas {
  clienteId: number | null;
  estado: EstadoVenta | null;
  desde: string | null;
  hasta: string | null;
}

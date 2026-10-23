export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  estado: boolean;
  categoriaId: number;
  categoriaNombre: string;
  fechaCreacion: string;
  fechaModificacion: string | null;
}

export interface ProductoRequest {
  nombre: string;
  precio: number;
  stock: number;
  estado: boolean;
  categoriaId: number;
}

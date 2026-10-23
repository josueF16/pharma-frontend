import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Producto,
  ProductoRequest
} from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.url);
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }

  crear(datos: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(this.url, datos);
  }

  actualizar(
    id: number,
    datos: ProductoRequest
  ): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
  darDeBaja(producto: Producto): Observable<Producto> {
  return this.actualizar(producto.id, {
    nombre: producto.nombre,
    precio: producto.precio,
    stock: producto.stock,
    estado: false,
    categoriaId: producto.categoriaId
  });
}
}

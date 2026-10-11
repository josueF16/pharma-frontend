import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  FiltroVentas,
  Venta,
  VentaRequest
} from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/ventas`;

  registrar(datos: VentaRequest): Observable<Venta> {
    return this.http.post<Venta>(this.url, datos);
  }

  obtener(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.url}/${id}`);
  }

  buscar(filtro: FiltroVentas): Observable<Venta[]> {
    let params = new HttpParams()
      .set('ordenarPor', 'fecha')
      .set('direccion', 'desc');

    if (filtro.clienteId !== null) {
      params = params.set('clienteId', filtro.clienteId);
    }

    if (filtro.estado !== null) {
      params = params.set('estado', filtro.estado);
    }

    if (filtro.desde) {
      params = params.set('desde', filtro.desde);
    }

    if (filtro.hasta) {
      params = params.set('hasta', filtro.hasta);
    }

    return this.http.get<Venta[]>(
      `${this.url}/buscar`,
      { params }
    );
  }
}

import { Routes } from '@angular/router';

import {
  permisoGuardGuard
} from '../../core/guards/permiso-guard-guard';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Productos',
    loadComponent: () =>
      import('./pages/producto-list/producto-list')
        .then(m => m.ProductoList)
  },
  {
    path: 'nuevo',
    title: 'Nuevo producto',
    canActivate: [permisoGuardGuard],
    data: { permiso: 'CATALOGO_ESCRIBIR' },
    loadComponent: () =>
      import('./pages/producto-form/producto-form')
        .then(m => m.ProductoForm)
  },
  {
    path: ':id/editar',
    title: 'Editar producto',
    canActivate: [permisoGuardGuard],
    data: { permiso: 'CATALOGO_ESCRIBIR' },
    loadComponent: () =>
      import('./pages/producto-form/producto-form')
        .then(m => m.ProductoForm)
  }
];

import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'inicio',
        title: 'Inicio',
        loadComponent: () =>
          import('./features/inicio/pages/inicio/inicio')
            .then(m => m.Inicio)
      },
      {
        path: 'categorias',
        loadChildren: () =>
          import('./features/categorias/categorias.routes')
            .then(m => m.CATEGORIAS_ROUTES)
      },
      {
        path: 'ventas',
        loadChildren: () =>
          import('./features/ventas/ventas.routes')
            .then(m => m.VENTAS_ROUTES)
      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('./features/reportes/reportes.routes')
            .then(m => m.REPORTES_ROUTES)
      }
    ]
  }
];

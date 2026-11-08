import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Permiso } from '../auth/auth.model';
import { AuthService } from '../auth/auth-service';

/** Comprueba el permiso indicado en la configuración de la ruta. */
export const permisoGuardGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.token()) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        returnUrl: state.url
      }
    });
  }

  const permiso = route.data['permiso'] as Permiso | undefined;

  if (!permiso || auth.tienePermiso(permiso)) {
    return true;
  }

  return router.createUrlTree(['/acceso-denegado']);
};

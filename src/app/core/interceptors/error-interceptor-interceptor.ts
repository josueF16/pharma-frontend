import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth-service';
import { environment } from '../../../environments/environment';

export const errorInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const apiUrl = environment.apiUrl.replace(/\/+$/, '');
  const urlSinParametros = req.url.split(/[?#]/)[0];

  const esApi =
    urlSinParametros === apiUrl ||
    urlSinParametros.startsWith(`${apiUrl}/`);

  const esLogin =
    urlSinParametros.replace(/\/+$/, '') === `${apiUrl}/auth/login`;

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        esApi &&
        !esLogin
      ) {
        auth.cerrarSesion('expirada', router.url);
      }

      return throwError(() => error);
    })
  );
};

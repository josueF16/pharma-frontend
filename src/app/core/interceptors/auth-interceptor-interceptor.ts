import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { AuthService } from '../auth/auth-service';
import { environment } from '../../../environments/environment';

export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const apiUrl = environment.apiUrl.replace(/\/+$/, '');
  const urlSinParametros = req.url.split(/[?#]/)[0];

  const esApi =
    urlSinParametros === apiUrl ||
    urlSinParametros.startsWith(`${apiUrl}/`);

  const esLogin =
    urlSinParametros.replace(/\/+$/, '') === `${apiUrl}/auth/login`;

  const token = auth.token();

  if (esApi && !esLogin && token) {
    const peticionConToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(peticionConToken);
  }

  return next(req);
};

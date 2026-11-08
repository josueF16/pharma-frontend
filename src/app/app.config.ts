import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { routes } from './app.routes';
import {
  authInterceptorInterceptor
} from './core/interceptors/auth-interceptor-interceptor';
import {
  errorInterceptorInterceptor
} from './core/interceptors/error-interceptor-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptorInterceptor,
        errorInterceptorInterceptor
      ])
    )
  ]
};

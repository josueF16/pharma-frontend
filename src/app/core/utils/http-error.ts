import { HttpErrorResponse } from '@angular/common/http';

export function mensajeError(error: HttpErrorResponse): string {
  const cuerpo = error.error;

  if (typeof cuerpo?.mensaje === 'string' && cuerpo.mensaje.trim()) {
    return cuerpo.mensaje;
  }

  if (typeof cuerpo?.message === 'string' && cuerpo.message.trim()) {
    return cuerpo.message;
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté iniciado.';
  }

  return 'No se pudo completar la operación. Inténtalo nuevamente.';
}

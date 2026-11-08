/** Permisos que devuelve el backend. */
export type Permiso =
  | 'CATALOGO_LEER'
  | 'CATALOGO_ESCRIBIR'
  | 'CLIENTES_LEER'
  | 'CLIENTES_ESCRIBIR'
  | 'VENTAS_LEER'
  | 'VENTAS_REGISTRAR'
  | 'REPORTES_VER'
  | 'USUARIOS_ADMINISTRAR';

/** Datos que enviamos para iniciar sesión. */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Respuesta del backend cuando el login es correcto. */
export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: Permiso[];
}

/** Información de la sesión que guardaremos en el navegador. */
export interface Sesion {
  token: string;
  expiraEn: number;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: Permiso[];
}

// PUNTO DE INTEGRACIÓN DEL ROL 3. No es una persistencia simulada.
import 'server-only';
import { AppError } from '../errors.mjs';
export function ensurePersistenceReady() {
  throw new AppError(501, 'Pendiente rol 3: conectar guardarArchivo con Neon antes de habilitar las subidas.');
}
export async function guardarArchivo(metadata) {
  // ROL 3: insertar metadata mediante getDb() y archivos; devolver fila con id y fechaSubida.
  throw new AppError(501, 'Pendiente implementar guardarArchivo.');
}

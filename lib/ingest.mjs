// ROL 2. Inyección de dependencias: permite probar sin cuentas reales.
import { validateForm } from './validation.mjs';
import { AppError } from './errors.mjs';
export async function ingest(form, { ensureReady, upload, save, remove }) {
  const { buffer, extension, metadata } = await validateForm(form);
  // Si el rol 3 aún no está conectado, NO subir un archivo huérfano.
  await ensureReady();
  const uploaded = await upload(buffer, metadata.mime, extension);
  try {
    return await save({ ...metadata, ...uploaded });
  } catch {
    try { await remove(uploaded.publicId); }
    catch {
      // Solo identificador del objeto; nunca secretos. Revisar antes de borrar manualmente.
      console.error('Reconciliar objeto tras fallo de persistencia:', uploaded.publicId);
      throw new AppError(503, 'Falló la persistencia y su compensación. No repitas la carga; avisa al equipo.');
    }
    throw new AppError(502, 'No se pudo guardar el registro. Se retiró el archivo recién subido.');
  }
}

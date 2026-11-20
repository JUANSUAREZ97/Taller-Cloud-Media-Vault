// ROL 2. Validación real en servidor, además de la validación del frontend.
import { fileTypeFromBuffer } from 'file-type';
import { MAX_BYTES, MIME_EXTENSIONS, categoryFor } from './limits.mjs';
import { AppError } from './errors.mjs';
function field(form, key, max) {
  const value = form.get(key);
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new AppError(400, `${key} es obligatorio y admite hasta ${max} caracteres.`);
  }
  return value.trim();
}
export async function validateForm(form) {
  for (const key of ['archivo', 'titulo', 'subidoPor']) {
    if (form.getAll(key).length !== 1) throw new AppError(400, `Se requiere exactamente un campo ${key}.`);
  }
  const titulo = field(form, 'titulo', 120);
  const subidoPor = field(form, 'subidoPor', 80);
  const file = form.get('archivo');
  if (!file || typeof file.arrayBuffer !== 'function' || typeof file.name !== 'string') {
    throw new AppError(400, 'Selecciona un archivo.');
  }
  if (!file.size) throw new AppError(400, 'El archivo está vacío.');
  if (file.size > MAX_BYTES) throw new AppError(413, 'El archivo supera 10 MiB (10.485.760 bytes).');
  if (!MIME_EXTENSIONS[file.type]) throw new AppError(415, 'Formato permitido: JPG, PNG, WebP, MP4 o PDF.');
  const buffer = Buffer.from(await file.arrayBuffer());
  let detected;
  try { detected = await fileTypeFromBuffer(buffer); } catch { /* archivo truncado */ }
  if (!detected || detected.mime !== file.type || !MIME_EXTENSIONS[detected.mime]) {
    throw new AppError(415, 'El contenido no coincide con el tipo MIME declarado.');
  }
  return { buffer, extension: MIME_EXTENSIONS[detected.mime], metadata: {
    titulo, subidoPor, nombreOriginal: file.name.slice(0, 255),
    mime: detected.mime, tipoArchivo: categoryFor(detected.mime), tamanoBytes: file.size,
  }};
}

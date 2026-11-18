import { MAX_REQUEST_BYTES } from './limits.mjs';
import { AppError } from './errors.mjs';
// Limita también el cuerpo completo, aunque no venga Content-Length.
export async function readLimitedForm(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('multipart/form-data;')) {
    throw new AppError(415, 'Envía multipart/form-data con archivo, titulo y subidoPor.');
  }
  if (Number(request.headers.get('content-length')) > MAX_REQUEST_BYTES) {
    throw new AppError(413, 'La petición supera el límite permitido.');
  }
  if (!request.body) throw new AppError(400, 'La petición no tiene cuerpo.');
  const reader = request.body.getReader();
  const chunks = []; let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new AppError(413, 'La petición supera el límite permitido.');
      }
      chunks.push(value);
    }
    const buffered = new Request('http://local.invalid', {
      method: 'POST', headers: { 'content-type': contentType }, body: Buffer.concat(chunks),
    });
    return await buffered.formData();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(400, 'Formulario multipart incompleto o inválido.');
  } finally { reader.releaseLock(); }
}

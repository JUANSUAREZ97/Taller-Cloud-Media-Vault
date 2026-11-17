// ROLES 1/2: cliente de servidor y transferencia cloud.
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { requiredEnv } from './env.mjs';
import { AppError } from './errors.mjs';
function storage() {
  const client = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SECRET_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client.storage.from(requiredEnv('SUPABASE_BUCKET'));
}
export async function uploadBinary(buffer, mime, extension) {
  const bucket = storage();
  const publicId = `archivos/${randomUUID()}.${extension}`;
  const { error } = await bucket.upload(publicId, buffer, { contentType: mime, upsert: false, cacheControl: '60' });
  if (error) throw new AppError(502, 'No se pudo subir a Supabase. Revisa bucket, clave y conexión.');
  const { data } = bucket.getPublicUrl(publicId);
  return { publicId, url: data.publicUrl };
}
// Utilidad de compensación del rol 2, reutilizable por el DELETE del rol 3.
export async function removeBinary(publicId) {
  const { error } = await storage().remove([publicId]);
  if (error) throw new AppError(502, 'No se pudo eliminar el objeto en Supabase.');
}

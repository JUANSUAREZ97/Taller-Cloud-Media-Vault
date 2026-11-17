// ROL 1: comprueba conexión Y existencia de tabla, sin insertar datos.
import { sql } from 'drizzle-orm';
import { getDb } from '../lib/db/client.mjs';
try {
  await getDb().execute(sql`SELECT id, titulo, nombre_original, url, public_id, tipo_archivo, mime, tamano_bytes, fecha_subida, subido_por FROM archivos LIMIT 0`);
  console.log('OK: Neon conecta y la tabla archivos tiene las columnas esperadas.');
} catch {
  console.error('No se pudo comprobar Neon. Revisa DATABASE_URL y ejecuta sql/001_archivos.sql.');
  process.exitCode = 1;
}

// Prueba independiente de los roles 1/2. No es el CRUD final ni guarda metadatos.
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { validateForm } from '../lib/validation.mjs';
import { uploadBinary, removeBinary } from '../lib/storage.mjs';
const [path, mime] = process.argv.slice(2);
if (!path || !mime) {
  console.error('Uso: npm run test:storage -- "C:/ruta/foto.png" image/png');
  process.exit(1);
}
let publicId;
try {
  const bytes = await readFile(path);
  const form = new FormData();
  form.set('archivo', new File([bytes], basename(path), { type: mime }));
  form.set('titulo', 'Prueba técnica roles 1 y 2');
  form.set('subidoPor', 'Equipo de desarrollo');
  const validated = await validateForm(form);
  const uploaded = await uploadBinary(validated.buffer, validated.metadata.mime, validated.extension);
  publicId = uploaded.publicId;
  console.log('OK: objeto subido. No se insertó ninguna fila en Neon.');
  console.log('Ruta:', publicId);
  console.log('URL pública:', uploaded.url);
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  await rl.question('Revisa el bucket y abre la URL. Pulsa ENTER para borrar SOLO este objeto de prueba.');
  rl.close();
} catch (error) {
  console.error(error.status ? error.message : 'Falló la prueba. Revisa ruta, formato y configuración.');
  process.exitCode = 1;
} finally {
  if (publicId) {
    try { await removeBinary(publicId); console.log('OK: objeto de prueba eliminado del bucket.'); }
    catch { console.error('Limpieza pendiente. Elimina manualmente este objeto:', publicId); process.exitCode = 1; }
  }
}

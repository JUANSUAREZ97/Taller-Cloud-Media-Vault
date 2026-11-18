// POST: ROL 2. El rol 3 añadirá aquí su export GET (sin reemplazar POST).
import { assertWriteAccess } from '../../../lib/auth.mjs';
import { readLimitedForm } from '../../../lib/read-form.mjs';
import { ingest } from '../../../lib/ingest.mjs';
import { uploadBinary, removeBinary } from '../../../lib/storage.mjs';
import { ensurePersistenceReady, guardarArchivo } from '../../../lib/repositories/archivos.mjs';
import { errorResponse } from '../../../lib/errors.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request) {
  try {
    assertWriteAccess(request);
    const form = await readLimitedForm(request);
    const archivo = await ingest(form, {
      ensureReady: ensurePersistenceReady, upload: uploadBinary,
      save: guardarArchivo, remove: removeBinary,
    });
    return Response.json({ archivo }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}

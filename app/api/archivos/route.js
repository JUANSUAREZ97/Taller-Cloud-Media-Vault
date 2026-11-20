
import { assertWriteAccess } from '../../../lib/auth.mjs';
import { readLimitedForm } from '../../../lib/read-form.mjs';
import { ingest } from '../../../lib/ingest.mjs';
import { uploadBinary, removeBinary } from '../../../lib/storage.mjs';
import {
  ensurePersistenceReady,
  guardarArchivo,
  listarArchivos,
} from '../../../lib/repositories/archivos.mjs';
import { errorResponse } from '../../../lib/errors.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: consultar archivos con filtros opcionales.
export async function GET(request) {
  try {
    const params = new URL(request.url).searchParams;

    const archivos = await listarArchivos({
      tipo: params.get('tipo') || undefined,
      busqueda: params.get('busqueda') || undefined,
    });

    return Response.json({ archivos });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: subir archivo y guardar sus metadatos.
export async function POST(request) {
  try {
    assertWriteAccess(request);

    const form = await readLimitedForm(request);

    const archivo = await ingest(form, {
      ensureReady: ensurePersistenceReady,
      upload: uploadBinary,
      save: guardarArchivo,
      remove: removeBinary,
    });

    return Response.json({ archivo }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

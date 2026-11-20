
import { assertWriteAccess } from '../../../../lib/auth.mjs';
import { removeBinary } from '../../../../lib/storage.mjs';
import {
  obtenerArchivoPorId,
  eliminarArchivoPorId,
  restaurarArchivo,
} from '../../../../lib/repositories/archivos.mjs';
import { AppError, errorResponse } from '../../../../lib/errors.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// DELETE: eliminar un archivo por su ID.
export async function DELETE(request, { params }) {
  try {
    assertWriteAccess(request);

    const { id } = await params;

    // Validar que el ID tenga formato UUID.
    const uuidValido =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidValido.test(id)) {
      throw new AppError(400, 'El ID del archivo no es válido.');
    }

    // Buscar el archivo en Neon.
    const archivo = await obtenerArchivoPorId(id);

    if (!archivo) {
      throw new AppError(404, 'El archivo no existe.');
    }

    // Eliminar primero los metadatos de Neon.
    const eliminado = await eliminarArchivoPorId(id);

    if (!eliminado) {
      throw new AppError(404, 'El archivo no existe.');
    }

    // Eliminar el archivo físico de Supabase.
    try {
      await removeBinary(archivo.publicId);
    } catch {
      // Si falla Supabase, restaurar los metadatos en Neon.
      try {
        await restaurarArchivo(eliminado);
      } catch {
        throw new AppError(
          503,
          'Falló la eliminación en Supabase y no se pudieron restaurar los metadatos. Se requiere revisión.'
        );
      }

      throw new AppError(
        502,
        'No se pudo eliminar el archivo de Supabase. El registro se conservó.'
      );
    }

    return Response.json({
      mensaje: 'El archivo se eliminó correctamente.',
      id,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

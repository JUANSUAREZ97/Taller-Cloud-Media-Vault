
import 'server-only';
import { and, desc, eq, ilike } from 'drizzle-orm';
import { getDb } from '../db/client.mjs';
import { archivos } from '../db/schema.mjs';
import { AppError } from '../errors.mjs';

export async function ensurePersistenceReady() {
  try {
    const db = getDb();
    await db.select({ id: archivos.id }).from(archivos).limit(1);
  } catch {
    throw new AppError(
      503,
      'La base de datos no está disponible o la tabla archivos no existe. Revisa la conexión y ejecuta el SQL de creación.'
    );
  }
}

export async function guardarArchivo(metadata) {
  try {
    const db = getDb();

    const [archivo] = await db
      .insert(archivos)
      .values({
        titulo: metadata.titulo,
        nombreOriginal: metadata.nombreOriginal,
        subidoPor: metadata.subidoPor,
        mime: metadata.mime,
        tipoArchivo: metadata.tipoArchivo,
        tamanoBytes: metadata.tamanoBytes,
        url: metadata.url,
        publicId: metadata.publicId,
      })
      .returning();

    if (!archivo) {
      throw new Error('No se recibió el registro insertado.');
    }

    return archivo;
  } catch {
    throw new AppError(
      503,
      'No se pudo guardar el registro en la base de datos.'
    );
  }
}

export async function listarArchivos({ tipo, busqueda } = {}) {
  try {
    const db = getDb();
    const condiciones = [];

    if (tipo && tipo !== 'todos') {
      const tipoBD = tipo === 'pdf' ? 'documento' : tipo;

      if (!['imagen', 'video', 'documento'].includes(tipoBD)) {
        throw new AppError(400, 'El filtro de tipo no es válido.');
      }

      condiciones.push(eq(archivos.tipoArchivo, tipoBD));
    }

    if (busqueda?.trim()) {
      condiciones.push(
        ilike(archivos.titulo, `%${busqueda.trim()}%`)
      );
    }

    const consulta = db
      .select()
      .from(archivos)
      .orderBy(desc(archivos.fechaSubida));

    return condiciones.length
      ? await consulta.where(and(...condiciones))
      : await consulta;
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError(
      503,
      'No se pudieron consultar los archivos.'
    );
  }
}

// Busca un archivo por su ID.
export async function obtenerArchivoPorId(id) {
  try {
    const db = getDb();

    const [archivo] = await db
      .select()
      .from(archivos)
      .where(eq(archivos.id, id))
      .limit(1);

    return archivo || null;
  } catch {
    throw new AppError(
      503,
      'No se pudo consultar el archivo.'
    );
  }
}

// Elimina los metadatos y devuelve el registro eliminado.
export async function eliminarArchivoPorId(id) {
  try {
    const db = getDb();

    const [archivo] = await db
      .delete(archivos)
      .where(eq(archivos.id, id))
      .returning();

    return archivo || null;
  } catch {
    throw new AppError(
      503,
      'No se pudo eliminar el registro de la base de datos.'
    );
  }
}

// Restaura los metadatos si falla la eliminación en Supabase.
export async function restaurarArchivo(archivo) {
  try {
    const db = getDb();

    await db.insert(archivos).values({
      id: archivo.id,
      titulo: archivo.titulo,
      nombreOriginal: archivo.nombreOriginal,
      subidoPor: archivo.subidoPor,
      mime: archivo.mime,
      tipoArchivo: archivo.tipoArchivo,
      tamanoBytes: archivo.tamanoBytes,
      url: archivo.url,
      publicId: archivo.publicId,
      fechaSubida: archivo.fechaSubida,
    });
  } catch {
    throw new AppError(
      503,
      'No se pudieron restaurar los metadatos del archivo.'
    );
  }
}

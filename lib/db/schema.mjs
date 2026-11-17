// ROL 1: diseño del modelo; el CRUD corresponde al rol 3.
import { pgTable, uuid, varchar, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
export const archivos = pgTable('archivos', {
  id: uuid('id').primaryKey().defaultRandom(),
  titulo: varchar('titulo', { length: 120 }).notNull(),
  nombreOriginal: varchar('nombre_original', { length: 255 }).notNull(),
  url: text('url').notNull(),
  publicId: text('public_id').notNull().unique(),
  tipoArchivo: varchar('tipo_archivo', { length: 20 }).notNull(),
  mime: varchar('mime', { length: 100 }).notNull(),
  tamanoBytes: integer('tamano_bytes').notNull(),
  fechaSubida: timestamp('fecha_subida', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  subidoPor: varchar('subido_por', { length: 80 }).notNull(),
}, (table) => [index('archivos_fecha_idx').on(table.fechaSubida), index('archivos_tipo_idx').on(table.tipoArchivo)]);

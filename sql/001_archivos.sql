-- ROL 1. Ejecutar una vez en el SQL Editor de NEON, no en Supabase.
CREATE TABLE IF NOT EXISTS archivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo varchar(120) NOT NULL,
  nombre_original varchar(255) NOT NULL,
  url text NOT NULL,
  public_id text NOT NULL UNIQUE,
  tipo_archivo varchar(20) NOT NULL CHECK (tipo_archivo IN ('imagen','video','documento')),
  mime varchar(100) NOT NULL CHECK (mime IN ('image/jpeg','image/png','image/webp','video/mp4','application/pdf')),
  tamano_bytes integer NOT NULL CHECK (tamano_bytes BETWEEN 1 AND 3145728),
  fecha_subida timestamptz NOT NULL DEFAULT now(),
  subido_por varchar(80) NOT NULL
);
CREATE INDEX IF NOT EXISTS archivos_fecha_idx ON archivos (fecha_subida);
CREATE INDEX IF NOT EXISTS archivos_tipo_idx ON archivos (tipo_archivo);
-- IF NOT EXISTS no actualiza una tabla ya creada con otro esquema.

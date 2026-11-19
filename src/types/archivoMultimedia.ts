/** Metadatos de un activo multimedia almacenado en el vault. */
export interface ArchivoMultimedia {
  id: string;
  titulo: string;
  url: string;
  publicId: string;
  tipoArchivo: string;
  tamanoBytes: number;
  fechaSubida: string;
  subidoPor: string;
}

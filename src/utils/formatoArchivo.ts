/** Devuelve el tamaño con dos decimales en KB o MB. */
export function formatearTamano(tamanoBytes: number): string {
  if (!Number.isFinite(tamanoBytes) || tamanoBytes < 0) return '0 KB';
  const megabyte = 1024 * 1024;
  if (tamanoBytes >= megabyte) return `${(tamanoBytes / megabyte).toFixed(2)} MB`;
  return `${(tamanoBytes / 1024).toFixed(2)} KB`;
}

/** Presenta la fecha de subida en el formato local de Colombia. */
export function formatearFecha(fechaSubida: string | Date): string {
  const fecha = fechaSubida instanceof Date ? fechaSubida : new Date(fechaSubida);
  if (Number.isNaN(fecha.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fecha);
}

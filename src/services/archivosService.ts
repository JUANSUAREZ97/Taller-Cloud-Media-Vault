import type { ArchivoMultimedia } from '../types/archivoMultimedia';

const API_URL = '/api/archivos';
let vaultToken: string | null = null;

/** Conserva la clave de escritura solo en memoria durante la sesión de página. */
export function establecerTokenVault(token: string | null): void {
  vaultToken = token?.trim() || null;
}

async function comprobarRespuesta(response: Response): Promise<void> {
  if (response.ok) return;

  let message = `Error ${response.status} al comunicarse con el servicio de archivos.`;
  try {
    const body = await response.json();
    if (typeof body?.error === 'string') message = body.error;
    else if (typeof body?.message === 'string') message = body.message;
  } catch {
    // Conserva el mensaje HTTP cuando el servidor no devuelve JSON.
  }
  throw new Error(message);
}

export async function obtenerArchivos(
  tipo?: string,
  busqueda?: string,
): Promise<ArchivoMultimedia[]> {
  const params = new URLSearchParams();
  if (tipo?.trim()) params.set('tipo', tipo.trim());
  if (busqueda?.trim()) params.set('busqueda', busqueda.trim());
  const query = params.toString();
  const response = await fetch(query ? `${API_URL}?${query}` : API_URL);
  await comprobarRespuesta(response);

  const body = await response.json();
  return Array.isArray(body) ? body : (body.archivos ?? []);
}

export async function subirArchivo(formData: FormData): Promise<ArchivoMultimedia> {
  const headers = new Headers();
  if (vaultToken) headers.set('X-Vault-Token', vaultToken);

  const response = await fetch(API_URL, { method: 'POST', headers, body: formData });
  await comprobarRespuesta(response);
  const body = await response.json();
  return body.archivo ?? body;
}

export async function eliminarArchivo(id: string): Promise<void> {
  const headers = new Headers();
  if (vaultToken) headers.set('X-Vault-Token', vaultToken);

  const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });
  await comprobarRespuesta(response);
}

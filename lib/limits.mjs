// Compartido con el frontend. No contiene secretos.
export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_REQUEST_BYTES = MAX_BYTES + 64 * 1024;
export const MIME_EXTENSIONS = Object.freeze({
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'video/mp4': 'mp4', 'application/pdf': 'pdf',
});
export const ACCEPT = Object.keys(MIME_EXTENSIONS).join(',');
export function categoryFor(mime) {
  return mime.startsWith('image/') ? 'imagen' : mime.startsWith('video/') ? 'video' : 'documento';
}

export class AppError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function errorResponse(error) {
  if (error instanceof AppError) return Response.json({ error: error.message }, { status: error.status });
  // No devolver errores del proveedor: podrían incluir detalles de conexión.
  console.error('Error interno de Cloud Media Vault; revisar servicios y configuración.');
  return Response.json({ error: 'Error interno del servidor.' }, { status: 500 });
}

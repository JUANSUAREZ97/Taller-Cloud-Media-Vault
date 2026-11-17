import 'server-only';
import { AppError } from './errors.mjs';
export function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value || value.includes('REEMPLAZAR') || value.includes('TU-PROYECTO')) {
    throw new AppError(503, `Falta configurar ${name} en el servidor.`);
  }
  return value;
}

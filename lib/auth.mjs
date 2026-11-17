import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { requiredEnv } from './env.mjs';
import { AppError } from './errors.mjs';
// Protección mínima de escritura para la demo, no es un sistema de usuarios.
export function assertWriteAccess(request) {
  const expected = Buffer.from(requiredEnv('VAULT_WRITE_TOKEN'));
  const received = Buffer.from(request.headers.get('x-vault-token') || '');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    throw new AppError(401, 'Clave de escritura incorrecta o ausente.');
  }
}

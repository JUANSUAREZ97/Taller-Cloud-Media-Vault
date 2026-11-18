import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { requiredEnv } from '../env.mjs';
import * as schema from './schema.mjs';
export function getDb() {
  return drizzle(neon(requiredEnv('DATABASE_URL')), { schema });
}

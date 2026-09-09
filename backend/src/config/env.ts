/**
 * Centralised environment configuration.
 *
 * Values come from `.env` (see `.env.example`). No secret is ever hardcoded;
 * the LLM key is read here and nowhere else.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Minimal .env loader. Avoids pulling in `dotenv` for four variables and keeps
 * process.env as the single source of truth.
 */
function loadDotEnv(): void {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

function readNumber(key: string, fallback: number): number {
  const parsed = Number(process.env[key]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  port: readNumber('PORT', 4000),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  databasePath:
    process.env.DATABASE_PATH ??
    (process.env.VERCEL ? '/tmp/bodha.db' : './data/bodha.db'),
  /** Empty in the demo - the rule-based listing optimizer is used instead. */
  llmApiKey: process.env.LLM_API_KEY ?? '',
  llmModel: process.env.LLM_MODEL ?? 'claude-sonnet-5',
} as const;

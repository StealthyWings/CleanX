import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { buildSeed } from "./seed";

// Local SQLite file by default. Point DATABASE_URL (and DATABASE_AUTH_TOKEN)
// at a Turso database to run the same code in a hosted/serverless deploy.
const DEFAULT_FILE = path.join(process.cwd(), "data", "cleanx.db");
const url = process.env.DATABASE_URL ?? `file:${DEFAULT_FILE}`;

type Db = LibSQLDatabase<typeof schema>;

// Cache on globalThis so dev hot-reloads don't open a new connection each time
const globalForDb = globalThis as unknown as {
  cleanxClient?: Client;
  cleanxDb?: Db;
  cleanxReady?: Promise<void>;
};

function getClient() {
  if (!globalForDb.cleanxClient) {
    if (url.startsWith("file:")) {
      fs.mkdirSync(path.dirname(url.slice("file:".length)), { recursive: true });
    }
    globalForDb.cleanxClient = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  }
  return globalForDb.cleanxClient;
}

export const db: Db = (globalForDb.cleanxDb ??= drizzle(getClient(), { schema }));

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    image_url TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    claimed_by TEXT,
    volunteer_id TEXT,
    cleaned_at INTEGER,
    after_image_url TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS volunteers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    cleanup_count INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    last_cleanup INTEGER,
    duplicate_attempts INTEGER NOT NULL DEFAULT 0,
    flagged INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS activity (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    params TEXT NOT NULL,
    report_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS activity_timestamp_idx ON activity (timestamp)`,
  `CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    mime TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS image_hashes (
    hash TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL
  )`,
];

async function migrateAndSeed() {
  const client = getClient();
  await client.batch(CREATE_TABLES, "write");

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(schema.reports);
  if (count > 0) return;

  const seed = buildSeed();
  await db.batch([
    db.insert(schema.reports).values(seed.reports),
    db.insert(schema.volunteers).values(seed.volunteers),
    db.insert(schema.activity).values(seed.activity),
  ]);
}

/** Creates tables and demo data on first use. Safe to call on every request. */
export function ensureDb() {
  globalForDb.cleanxReady ??= migrateAndSeed().catch((err) => {
    globalForDb.cleanxReady = undefined; // let the next request retry
    throw err;
  });
  return globalForDb.cleanxReady;
}

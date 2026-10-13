// Wipes all data and restores the demo seed. Run with: npm run db:reset
// (Node 24 runs this TypeScript file directly.)
import path from "node:path";
import fs from "node:fs";
import { createClient } from "@libsql/client";
import { buildSeed } from "../src/db/seed.ts";

const file = path.join(process.cwd(), "data", "cleanx.db");
const url = process.env.DATABASE_URL ?? `file:${file}`;

if (url.startsWith("file:") && !fs.existsSync(file)) {
  console.log("No database yet — it will be created and seeded when the app first runs.");
  process.exit(0);
}

const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
const seed = buildSeed();

await client.batch(
  [
    "DELETE FROM reports",
    "DELETE FROM volunteers",
    "DELETE FROM activity",
    "DELETE FROM images",
    "DELETE FROM image_hashes",
    ...seed.reports.map((r) => ({
      sql: `INSERT INTO reports (id, lat, lng, image_url, severity, status, timestamp, claimed_by, volunteer_id, cleaned_at, after_image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [r.id, r.lat, r.lng, r.imageUrl, r.severity, r.status, r.timestamp,
        r.claimedBy ?? null, r.volunteerId ?? null, r.cleanedAt ?? null, r.afterImageUrl ?? null],
    })),
    ...seed.volunteers.map((v) => ({
      sql: `INSERT INTO volunteers (id, name, cleanup_count, total_points, last_cleanup, duplicate_attempts, flagged)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [v.id, v.name, v.cleanupCount, v.totalPoints, v.lastCleanup ?? null, v.duplicateAttempts, v.flagged ? 1 : 0],
    })),
    ...seed.activity.map((a) => ({
      sql: "INSERT INTO activity (id, type, params, report_id, timestamp) VALUES (?, ?, ?, ?, ?)",
      args: [a.id, a.type, JSON.stringify(a.params), a.reportId, a.timestamp],
    })),
  ],
  "write"
);

console.log(`Database reset: ${seed.reports.length} reports, ${seed.volunteers.length} volunteers restored.`);
client.close();

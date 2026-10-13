import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  imageUrl: text("image_url").notNull(),
  severity: text("severity", { enum: ["low", "medium", "high"] }).notNull(),
  status: text("status", { enum: ["reported", "in-progress", "cleaned"] }).notNull(),
  timestamp: integer("timestamp").notNull(),
  claimedBy: text("claimed_by"),
  volunteerId: text("volunteer_id"),
  cleanedAt: integer("cleaned_at"),
  afterImageUrl: text("after_image_url"),
});

export const volunteers = sqliteTable("volunteers", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  cleanupCount: integer("cleanup_count").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  lastCleanup: integer("last_cleanup"),
  duplicateAttempts: integer("duplicate_attempts").notNull().default(0),
  flagged: integer("flagged", { mode: "boolean" }).notNull().default(false),
});

export const activity = sqliteTable("activity", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  params: text("params", { mode: "json" }).$type<Record<string, string>>().notNull(),
  reportId: text("report_id").notNull(),
  timestamp: integer("timestamp").notNull(),
});

// Uploaded photos, stored as base64 so the DB file is the only thing to back up
export const images = sqliteTable("images", {
  id: text("id").primaryKey(),
  mime: text("mime").notNull(),
  data: text("data").notNull(),
  createdAt: integer("created_at").notNull(),
});

// Fingerprints of accepted cleanup-proof photos, used to reject reused images
export const imageHashes = sqliteTable("image_hashes", {
  hash: text("hash").primaryKey(),
  createdAt: integer("created_at").notNull(),
});

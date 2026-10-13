import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, ensureDb } from "./index";
import { activity, imageHashes, images, reports, volunteers } from "./schema";
import { generateId, hashImageData } from "@/lib/utils";
import {
  SEVERITY_POINTS,
  type ActivityEntry,
  type ActivityType,
  type AppState,
  type CleanResult,
  type Report,
  type Severity,
  type Volunteer,
} from "@/lib/types";

const ACTIVITY_LIMIT = 50;
const FLAG_AFTER_DUPLICATES = 3;

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type ReportRow = typeof reports.$inferSelect;
type VolunteerRow = typeof volunteers.$inferSelect;

// SQLite returns NULL for unset columns; the client types use optional fields
function toReport(row: ReportRow): Report {
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    imageUrl: row.imageUrl,
    severity: row.severity,
    status: row.status,
    timestamp: row.timestamp,
    claimedBy: row.claimedBy ?? undefined,
    volunteerId: row.volunteerId ?? undefined,
    cleanedAt: row.cleanedAt ?? undefined,
    afterImageUrl: row.afterImageUrl ?? undefined,
  };
}

function toVolunteer(row: VolunteerRow): Volunteer {
  return { ...row, lastCleanup: row.lastCleanup ?? undefined };
}

function activityRow(type: ActivityType, params: Record<string, string>, reportId: string) {
  return { id: `act-${generateId()}`, type, params, reportId, timestamp: Date.now() };
}

export async function getState(): Promise<AppState> {
  await ensureDb();
  const [reportRows, volunteerRows, activityRows, hashRows] = await Promise.all([
    db.select().from(reports).orderBy(desc(reports.timestamp)),
    db.select().from(volunteers),
    db.select().from(activity).orderBy(desc(activity.timestamp)).limit(ACTIVITY_LIMIT),
    db.select({ hash: imageHashes.hash }).from(imageHashes),
  ]);

  return {
    reports: reportRows.map(toReport),
    volunteers: volunteerRows.map(toVolunteer),
    activity: activityRows.map((a) => ({ ...a, type: a.type as ActivityType }) satisfies ActivityEntry),
    imageHashes: hashRows.map((h) => h.hash),
  };
}

/** Stores a data: URL photo and returns the URL it is served from. */
async function saveImage(dataUrl: string): Promise<string> {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) throw new HttpError(400, "Image must be a base64 data URL");
  const id = generateId() + generateId();
  await db.insert(images).values({ id, mime: match[1], data: match[2], createdAt: Date.now() });
  return `/api/images/${id}`;
}

export async function getImage(id: string) {
  await ensureDb();
  const [row] = await db.select().from(images).where(eq(images.id, id)).limit(1);
  return row;
}

export async function addReport(input: { lat: number; lng: number; imageDataUrl: string; severity: Severity }) {
  await ensureDb();
  const imageUrl = await saveImage(input.imageDataUrl);
  const id = `rpt-${generateId()}`;
  const now = Date.now();

  await db.batch([
    db.insert(reports).values({
      id,
      lat: input.lat,
      lng: input.lng,
      imageUrl,
      severity: input.severity,
      status: "reported",
      timestamp: now,
    }),
    db.insert(activity).values(activityRow("report_submitted", { severity: input.severity }, id)),
  ]);
}

export async function claimReport(id: string, volunteerName: string) {
  await ensureDb();
  const [report] = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  if (!report) throw new HttpError(404, "Report not found");
  if (report.status !== "reported") throw new HttpError(409, "Report has already been claimed");

  // Find or create the volunteer
  let [volunteer] = await db.select().from(volunteers).where(eq(volunteers.name, volunteerName)).limit(1);
  if (!volunteer) {
    [volunteer] = await db
      .insert(volunteers)
      .values({ id: `vol-${generateId()}`, name: volunteerName })
      .returning();
  }

  await db.batch([
    db
      .update(reports)
      .set({ status: "in-progress", claimedBy: volunteerName, volunteerId: volunteer.id })
      .where(eq(reports.id, id)),
    db.insert(activity).values(activityRow("report_claimed", { reportShort: id.slice(-3), volunteerName }, id)),
  ]);
}

export async function markCleaned(id: string, afterImageDataUrl: string): Promise<CleanResult> {
  await ensureDb();
  const [report] = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  if (!report) throw new HttpError(404, "Report not found");
  if (report.status !== "in-progress" || !report.volunteerId) {
    throw new HttpError(409, "Report is not awaiting cleanup proof");
  }
  const volunteerName = report.claimedBy || "Unknown";

  // --- Image deduplication check ---
  const hash = hashImageData(afterImageDataUrl);
  const [existing] = await db.select().from(imageHashes).where(eq(imageHashes.hash, hash)).limit(1);
  if (existing) {
    const [vol] = await db.select().from(volunteers).where(eq(volunteers.id, report.volunteerId)).limit(1);
    const dupeCount = (vol?.duplicateAttempts ?? 0) + 1;
    const shouldFlag = dupeCount >= FLAG_AFTER_DUPLICATES;

    await db.batch([
      db
        .update(volunteers)
        .set({ duplicateAttempts: dupeCount, flagged: shouldFlag || !!vol?.flagged })
        .where(eq(volunteers.id, report.volunteerId)),
      db.insert(activity).values(activityRow("image_duplicate", { volunteerName, reportShort: id.slice(-3) }, id)),
      ...(shouldFlag ? [db.insert(activity).values(activityRow("account_flagged", { volunteerName }, id))] : []),
    ]);
    return shouldFlag ? "flagged" : "duplicate";
  }

  // --- All good, mark as cleaned and award points ---
  const afterImageUrl = await saveImage(afterImageDataUrl);
  const points = SEVERITY_POINTS[report.severity];
  const [vol] = await db.select().from(volunteers).where(eq(volunteers.id, report.volunteerId)).limit(1);
  const now = Date.now();

  await db.batch([
    db.insert(imageHashes).values({ hash, createdAt: now }),
    db.update(reports).set({ status: "cleaned", cleanedAt: now, afterImageUrl }).where(eq(reports.id, id)),
    db
      .update(volunteers)
      .set({
        cleanupCount: (vol?.cleanupCount ?? 0) + 1,
        totalPoints: (vol?.totalPoints ?? 0) + points,
        lastCleanup: now,
      })
      .where(eq(volunteers.id, report.volunteerId)),
    db.insert(activity).values(
      activityRow("report_cleaned", { reportShort: id.slice(-3), volunteerName, points: String(points) }, id)
    ),
  ]);
  return "success";
}

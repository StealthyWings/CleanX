import { addReport, HttpError } from "@/db/queries";
import { readJson, requireString, respondWithState } from "@/db/http";
import type { Severity } from "@/lib/types";

// ~15MB of base64 ≈ a 10MB photo
const MAX_IMAGE_CHARS = 15 * 1024 * 1024;
const SEVERITIES: Severity[] = ["low", "medium", "high"];

export async function POST(request: Request) {
  return respondWithState(async () => {
    const body = await readJson(request);
    const { lat, lng, severity } = body;

    if (typeof lat !== "number" || lat < -90 || lat > 90 || typeof lng !== "number" || lng < -180 || lng > 180) {
      throw new HttpError(400, "A valid lat/lng is required");
    }
    if (!SEVERITIES.includes(severity as Severity)) {
      throw new HttpError(400, "Severity must be low, medium or high");
    }

    await addReport({
      lat,
      lng,
      severity: severity as Severity,
      imageDataUrl: requireString(body, "image", MAX_IMAGE_CHARS),
    });
  });
}

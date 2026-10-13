import { markCleaned } from "@/db/queries";
import { readJson, requireString, respondWithState } from "@/db/http";

const MAX_IMAGE_CHARS = 15 * 1024 * 1024;

export async function POST(request: Request, ctx: RouteContext<"/api/reports/[id]/clean">) {
  return respondWithState(async () => {
    const { id } = await ctx.params;
    const body = await readJson(request);
    const result = await markCleaned(id, requireString(body, "image", MAX_IMAGE_CHARS));
    return { result };
  });
}

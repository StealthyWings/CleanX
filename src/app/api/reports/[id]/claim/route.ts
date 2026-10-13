import { claimReport } from "@/db/queries";
import { readJson, requireString, respondWithState } from "@/db/http";

export async function POST(request: Request, ctx: RouteContext<"/api/reports/[id]/claim">) {
  return respondWithState(async () => {
    const { id } = await ctx.params;
    const body = await readJson(request);
    await claimReport(id, requireString(body, "volunteerName", 60));
  });
}

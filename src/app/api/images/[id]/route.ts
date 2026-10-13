import { getImage } from "@/db/queries";
import { errorResponse } from "@/db/http";

export async function GET(_request: Request, ctx: RouteContext<"/api/images/[id]">) {
  try {
    const { id } = await ctx.params;
    const image = await getImage(id);
    if (!image) return new Response("Not found", { status: 404 });

    return new Response(Buffer.from(image.data, "base64"), {
      headers: {
        "Content-Type": image.mime,
        // Images are immutable once uploaded
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

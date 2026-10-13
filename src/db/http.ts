import "server-only";
import { NextResponse } from "next/server";
import { getState, HttpError } from "./queries";

/** Runs a mutation, then responds with the fresh app state (plus any extra fields). */
export async function respondWithState(run: () => Promise<Record<string, unknown> | void>) {
  try {
    const extra = (await run()) ?? {};
    return NextResponse.json({ ...extra, state: await getState() });
  } catch (err) {
    return errorResponse(err);
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (body && typeof body === "object") return body as Record<string, unknown>;
  } catch {
    // fall through
  }
  throw new HttpError(400, "Expected a JSON body");
}

export function requireString(body: Record<string, unknown>, key: string, maxLength: number) {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) throw new HttpError(400, `"${key}" is required`);
  if (value.length > maxLength) throw new HttpError(413, `"${key}" is too large`);
  return value.trim();
}

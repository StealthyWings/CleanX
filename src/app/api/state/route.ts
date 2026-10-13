import { NextResponse } from "next/server";
import { getState } from "@/db/queries";
import { errorResponse } from "@/db/http";

export async function GET() {
  try {
    return NextResponse.json(await getState());
  } catch (err) {
    return errorResponse(err);
  }
}

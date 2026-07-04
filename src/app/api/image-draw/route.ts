import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-errors";
import { requireUser } from "@/services/auth-service";
import { getImageDraw, saveImageDraw } from "@/services/image-draw-service";
import type { DrawImage } from "@/utils/image-draw";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const key = getKey(request);
    return NextResponse.json({ data: await getImageDraw(user, key) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const key = getKey(request);
    const body = (await request.json()) as { images?: DrawImage[] };
    return NextResponse.json({ data: await saveImageDraw(user, key, body.images || []) });
  } catch (error) {
    return handleApiError(error);
  }
}

function getKey(request: Request) {
  const key = new URL(request.url).searchParams.get("key")?.trim();
  if (!key) throw new Response("Missing key", { status: 400 });
  return key;
}

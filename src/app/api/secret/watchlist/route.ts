import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-errors";
import { requireUser } from "@/services/auth-service";
import { listWatchlistItems, saveWatchlistItem } from "@/services/watchlist-service";
import type { WatchlistItem } from "@/types/watchlist";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ data: await listWatchlistItems(user) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as WatchlistItem;
    return NextResponse.json({ data: await saveWatchlistItem(user, body) });
  } catch (error) {
    return handleApiError(error);
  }
}

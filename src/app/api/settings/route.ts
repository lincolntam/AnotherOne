import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-errors";
import { requireUser } from "@/services/auth-service";
import { getSettings, saveSettings } from "@/services/settings-service";
import type { UserSettings } from "@/types/app";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ data: await getSettings(user) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as UserSettings;
    await saveSettings(user, body);
    return NextResponse.json({ data: true });
  } catch (error) {
    return handleApiError(error);
  }
}

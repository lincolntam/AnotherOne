import { NextResponse } from "next/server";
import { requireUser } from "@/services/auth-service";
import { getSettings, saveSettings } from "@/services/settings-service";
import type { UserSettings } from "@/types/app";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json({ data: await getSettings(user) });
}

export async function PUT(request: Request) {
  const user = await requireUser();
  const body = (await request.json()) as UserSettings;
  await saveSettings(user, body);
  return NextResponse.json({ data: true });
}

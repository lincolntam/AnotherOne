import { NextResponse } from "next/server";
import { requireAdmin } from "@/services/auth-service";
import { importWebsites, type WebsiteInput } from "@/services/website-service";

export async function POST(request: Request) {
  const user = await requireAdmin();
  const body = (await request.json()) as { items?: unknown[]; overwrite?: boolean };
  const result = await importWebsites(user, Array.isArray(body.items) ? (body.items as WebsiteInput[]) : [], Boolean(body.overwrite));
  return NextResponse.json({ data: result });
}

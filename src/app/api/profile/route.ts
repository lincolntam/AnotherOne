import { NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { requireUser } from "@/services/auth-service";

export async function PATCH(request: Request) {
  const user = await requireUser();
  const body = (await request.json()) as { name?: string; avatarUrl?: string };
  const name = String(body.name || user.name).trim();
  const avatarUrl = String(body.avatarUrl || user.avatarUrl || "").trim();
  await getDb().prepare("update users set name = ?, avatar_url = ? where id = ?").bind(name, avatarUrl, user.id).run();
  return NextResponse.json({ data: true });
}

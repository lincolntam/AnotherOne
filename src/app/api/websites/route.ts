import { NextResponse } from "next/server";
import { adminListWebsites, createWebsite, listWebsites } from "@/services/website-service";
import { requireAdmin, requireUser } from "@/services/auth-service";

export async function GET(request: Request) {
  const user = await requireUser();
  const url = new URL(request.url);
  const includeInactive = url.searchParams.get("admin") === "1" && user.role === "admin";
  const websites = includeInactive ? await adminListWebsites(user) : await listWebsites(user);
  return NextResponse.json({ data: websites });
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  const body = (await request.json()) as Record<string, unknown>;
  const id = await createWebsite(user, normalizeWebsiteInput(body));
  return NextResponse.json({ data: { id } }, { status: 201 });
}

function normalizeWebsiteInput(body: Record<string, unknown>) {
  return {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    url: String(body.url || "").trim(),
    imageUrl: String(body.imageUrl || "").trim(),
    category: String(body.category || "General").trim(),
    displayOrder: Number(body.displayOrder ?? 100),
    active: body.active === undefined ? true : Boolean(body.active),
    favorite: Boolean(body.favorite),
    pinned: Boolean(body.pinned)
  };
}

import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-errors";
import { createPasswordHash } from "@/lib/crypto";
import { changePassword, requireUser } from "@/services/auth-service";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as { password?: string };
    const password = String(body.password || "");
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    await changePassword(user.id, await createPasswordHash(password));
    return NextResponse.json({ data: true });
  } catch (error) {
    return handleApiError(error);
  }
}

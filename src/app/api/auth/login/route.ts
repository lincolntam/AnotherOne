import { NextResponse } from "next/server";
import { loginWithPassword } from "@/services/auth-service";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string; remember?: boolean } | null;
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const result = await loginWithPassword(String(body.email), String(body.password), Boolean(body.remember));
  if (result.error) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json({ data: result.data });
}

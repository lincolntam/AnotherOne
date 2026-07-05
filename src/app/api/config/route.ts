import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/auth-service";
import { getEnv } from "@/lib/d1";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const env = getEnv() as unknown as Record<string, string | undefined>;
  return NextResponse.json({
    Maps_API_KEY: env.Maps_API_KEY ?? env.GOOGLE_MAPS_API_KEY ?? ""
  });
}

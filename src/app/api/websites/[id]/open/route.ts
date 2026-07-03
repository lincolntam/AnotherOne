import { NextResponse } from "next/server";
import { requireUser } from "@/services/auth-service";
import { trackWebsiteOpen } from "@/services/website-service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  const user = await requireUser();
  const { id } = await params;
  await trackWebsiteOpen(user, id);
  return NextResponse.json({ data: true });
}

import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-errors";
import { requireUser } from "@/services/auth-service";
import { trackWebsiteOpen } from "@/services/website-service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await trackWebsiteOpen(user, id);
    return NextResponse.json({ data: true });
  } catch (error) {
    return handleApiError(error);
  }
}

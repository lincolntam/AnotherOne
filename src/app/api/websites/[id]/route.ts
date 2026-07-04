import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-errors";
import { requireAdmin } from "@/services/auth-service";
import { deleteWebsite, updateWebsite, type WebsiteInput } from "@/services/website-service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const body = (await request.json()) as Partial<WebsiteInput>;
    await updateWebsite(user, id, body);
    return NextResponse.json({ data: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    await deleteWebsite(user, id);
    return NextResponse.json({ data: true });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextResponse } from "next/server";

export async function handleApiError(error: unknown) {
  if (error instanceof Response) {
    const message = (await error.text().catch(() => "")) || error.statusText || "Request failed.";
    return NextResponse.json({ error: message }, { status: error.status || 500 });
  }

  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 500 });
}

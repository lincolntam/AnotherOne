import { NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { requireUser } from "@/services/auth-service";
import type { UsageSummary } from "@/types/app";

export async function GET() {
  const user = await requireUser();
  const rows = await getDb()
    .prepare(
      `select id as websiteId, title, url, click_count as clickCount, last_used_at as lastUsedAt
       from website_shortcuts
       where user_id = ?
       order by click_count desc, last_used_at desc
       limit 10`
    )
    .bind(user.id)
    .all<UsageSummary>();

  return NextResponse.json({ data: rows.results || [] });
}

import { createId, getDb, nowIso } from "@/lib/d1";
import type { AppUser, WebsiteShortcut } from "@/types/app";

type WebsiteRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  category: string | null;
  display_order: number;
  active: number;
  favorite: number;
  pinned: number;
  click_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WebsiteInput = {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  category: string;
  displayOrder?: number;
  active?: boolean;
  favorite?: boolean;
  pinned?: boolean;
};

export async function listWebsites(user: AppUser) {
  const db = getDb();
  const rows = await db
    .prepare(
      `select * from website_shortcuts
       where user_id = ? and active = 1
       order by pinned desc, display_order asc, title asc`
    )
    .bind(user.id)
    .all<WebsiteRow>();
  return (rows.results || []).map(toWebsite);
}

export async function adminListWebsites(user: AppUser) {
  const db = getDb();
  const rows = await db
    .prepare("select * from website_shortcuts where user_id = ? order by display_order asc, title asc")
    .bind(user.id)
    .all<WebsiteRow>();
  return (rows.results || []).map(toWebsite);
}

export async function createWebsite(user: AppUser, input: WebsiteInput) {
  const db = getDb();
  const id = createId("web");
  const timestamp = nowIso();
  await db
    .prepare(
      `insert into website_shortcuts
       (id, user_id, title, description, url, image_url, category, display_order, active, favorite, pinned, click_count, created_at, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
    )
    .bind(
      id,
      user.id,
      input.title,
      input.description,
      input.url,
      input.imageUrl,
      input.category,
      input.displayOrder ?? 100,
      input.active === false ? 0 : 1,
      input.favorite ? 1 : 0,
      input.pinned ? 1 : 0,
      timestamp,
      timestamp
    )
    .run();
  return id;
}

export async function updateWebsite(user: AppUser, id: string, input: Partial<WebsiteInput>) {
  const db = getDb();
  const current = await db.prepare("select * from website_shortcuts where id = ? and user_id = ?").bind(id, user.id).first<WebsiteRow>();
  if (!current) throw new Response("Not found", { status: 404 });

  await db
    .prepare(
      `update website_shortcuts
       set title = ?, description = ?, url = ?, image_url = ?, category = ?, display_order = ?,
           active = ?, favorite = ?, pinned = ?, updated_at = ?
       where id = ? and user_id = ?`
    )
    .bind(
      input.title ?? current.title,
      input.description ?? current.description ?? "",
      input.url ?? current.url,
      input.imageUrl ?? current.image_url ?? "",
      input.category ?? current.category ?? "General",
      input.displayOrder ?? current.display_order,
      input.active === undefined ? current.active : input.active ? 1 : 0,
      input.favorite === undefined ? current.favorite : input.favorite ? 1 : 0,
      input.pinned === undefined ? current.pinned : input.pinned ? 1 : 0,
      nowIso(),
      id,
      user.id
    )
    .run();
}

export async function deleteWebsite(user: AppUser, id: string) {
  await getDb().prepare("delete from website_shortcuts where id = ? and user_id = ?").bind(id, user.id).run();
}

export async function trackWebsiteOpen(user: AppUser, id: string) {
  const db = getDb();
  const timestamp = nowIso();
  const website = await db.prepare("select id from website_shortcuts where id = ? and user_id = ?").bind(id, user.id).first<{ id: string }>();
  if (!website) throw new Response("Not found", { status: 404 });

  await db.batch([
    db.prepare("update website_shortcuts set click_count = click_count + 1, last_used_at = ?, updated_at = ? where id = ? and user_id = ?").bind(timestamp, timestamp, id, user.id),
    db.prepare("insert into website_usage_events (id, user_id, website_id, opened_at) values (?, ?, ?, ?)").bind(createId("use"), user.id, id, timestamp),
    db.prepare(
      `insert into recent_websites (id, user_id, website_id, opened_at)
       values (?, ?, ?, ?)
       on conflict(user_id, website_id) do update set opened_at = excluded.opened_at`
    ).bind(createId("rec"), user.id, id, timestamp)
  ]);
}

export async function importWebsites(user: AppUser, items: WebsiteInput[], overwrite: boolean) {
  const db = getDb();
  let inserted = 0;
  let skipped = 0;

  for (const item of items) {
    const exists = await db
      .prepare("select id from website_shortcuts where user_id = ? and lower(url) = lower(?) limit 1")
      .bind(user.id, item.url)
      .first<{ id: string }>();

    if (exists && overwrite) {
      await updateWebsite(user, exists.id, item);
    } else if (!exists) {
      await createWebsite(user, item);
      inserted += 1;
    } else {
      skipped += 1;
    }
  }

  return { inserted, skipped, total: items.length };
}

function toWebsite(row: WebsiteRow): WebsiteShortcut {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || "",
    url: row.url,
    imageUrl: row.image_url || "",
    category: row.category || "General",
    displayOrder: row.display_order,
    active: Boolean(row.active),
    favorite: Boolean(row.favorite),
    pinned: Boolean(row.pinned),
    clickCount: row.click_count,
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

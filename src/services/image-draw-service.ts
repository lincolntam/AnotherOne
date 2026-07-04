import { getDb, nowIso } from "@/lib/d1";
import type { AppUser } from "@/types/app";
import type { DrawImage } from "@/utils/image-draw";

type ImageDrawRow = {
  images_json: string;
};

let schemaReady = false;

export async function getImageDraw(user: AppUser, key: string) {
  await ensureImageDrawSchema();
  const row = await getDb()
    .prepare("select images_json from image_draws where user_id = ? and draw_key = ? limit 1")
    .bind(user.id, key)
    .first<ImageDrawRow>();

  return parseImages(row?.images_json || "[]");
}

export async function saveImageDraw(user: AppUser, key: string, images: DrawImage[]) {
  await ensureImageDrawSchema();
  const timestamp = nowIso();
  const cleanImages = images.filter((item) => item.url).map((item) => ({
    id: item.id,
    url: item.url,
    active: Boolean(item.active)
  }));

  await getDb()
    .prepare(
      `insert into image_draws (user_id, draw_key, images_json, updated_at)
       values (?, ?, ?, ?)
       on conflict(user_id, draw_key) do update set
        images_json = excluded.images_json,
        updated_at = excluded.updated_at`
    )
    .bind(user.id, key, JSON.stringify(cleanImages), timestamp)
    .run();

  return cleanImages;
}

async function ensureImageDrawSchema() {
  if (schemaReady) return;
  await getDb()
    .prepare(
      `create table if not exists image_draws (
        user_id text not null,
        draw_key text not null,
        images_json text not null default '[]',
        updated_at text not null,
        primary key (user_id, draw_key)
      )`
    )
    .run();
  schemaReady = true;
}

function parseImages(value: string): DrawImage[] {
  try {
    const parsed = JSON.parse(value) as DrawImage[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.url) : [];
  } catch {
    return [];
  }
}

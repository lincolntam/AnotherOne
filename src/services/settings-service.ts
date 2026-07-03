import { getDb } from "@/lib/d1";
import type { AppUser, UserSettings } from "@/types/app";

const defaultSettings: UserSettings = {
  theme: "system",
  language: "zh-Hant",
  notifications: false,
  pinEnabled: false,
  biometricReady: true
};

export async function getSettings(user: AppUser): Promise<UserSettings> {
  const row = await getDb()
    .prepare("select theme, language, notifications, pin_enabled, biometric_ready from user_settings where user_id = ?")
    .bind(user.id)
    .first<{ theme: string; language: string; notifications: number; pin_enabled: number; biometric_ready: number }>();

  if (!row) return defaultSettings;
  return {
    theme: row.theme === "light" || row.theme === "dark" ? row.theme : "system",
    language: row.language === "en" ? "en" : "zh-Hant",
    notifications: Boolean(row.notifications),
    pinEnabled: Boolean(row.pin_enabled),
    biometricReady: Boolean(row.biometric_ready)
  };
}

export async function saveSettings(user: AppUser, settings: UserSettings) {
  await getDb()
    .prepare(
      `insert into user_settings (user_id, theme, language, notifications, pin_enabled, biometric_ready, updated_at)
       values (?, ?, ?, ?, ?, ?, datetime('now'))
       on conflict(user_id) do update set
         theme = excluded.theme,
         language = excluded.language,
         notifications = excluded.notifications,
         pin_enabled = excluded.pin_enabled,
         biometric_ready = excluded.biometric_ready,
         updated_at = excluded.updated_at`
    )
    .bind(user.id, settings.theme, settings.language, settings.notifications ? 1 : 0, settings.pinEnabled ? 1 : 0, settings.biometricReady ? 1 : 0)
    .run();
}

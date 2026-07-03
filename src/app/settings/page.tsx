"use client";

import { Bell, Fingerprint, Languages, LogOut, Moon, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useWebsiteStore } from "@/stores/website-store";
import type { UserSettings } from "@/types/app";

const defaults: UserSettings = {
  theme: "system",
  language: "zh-Hant",
  notifications: false,
  pinEnabled: false,
  biometricReady: true
};

export default function SettingsPage() {
  const logout = useAuthStore((state) => state.logout);
  const websites = useWebsiteStore((state) => state.websites);
  const load = useWebsiteStore((state) => state.load);
  const [settings, setSettings] = useState(defaults);
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
    api<UserSettings>("/api/settings").then(setSettings).catch(() => setSettings(defaults));
  }, [load]);

  async function save(next: UserSettings) {
    setSettings(next);
    await api<boolean>("/api/settings", { method: "PUT", body: JSON.stringify(next) });
    setMessage("Settings saved.");
  }

  return (
    <AppShell websites={websites}>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-graphite/50">System</p>
        <h1 className="mt-2 text-3xl font-semibold">Settings</h1>
      </div>

      <div className="space-y-4">
        <section className="ao-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Moon size={18} />Theme</h2>
          <div className="grid grid-cols-3 gap-2">
            {(["system", "light", "dark"] as const).map((theme) => (
              <button key={theme} className={`rounded-full px-4 py-3 text-sm ${settings.theme === theme ? "bg-ink text-white" : "bg-white/70 dark:bg-white/10"}`} onClick={() => save({ ...settings, theme })}>
                {theme}
              </button>
            ))}
          </div>
        </section>

        <section className="ao-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Languages size={18} />Language</h2>
          <div className="grid grid-cols-2 gap-2">
            {(["zh-Hant", "en"] as const).map((language) => (
              <button key={language} className={`rounded-full px-4 py-3 text-sm ${settings.language === language ? "bg-ink text-white" : "bg-white/70 dark:bg-white/10"}`} onClick={() => save({ ...settings, language })}>
                {language}
              </button>
            ))}
          </div>
        </section>

        {[
          { key: "notifications", label: "Notification", icon: Bell },
          { key: "pinEnabled", label: "PIN Code", icon: ShieldCheck },
          { key: "biometricReady", label: "Biometric Ready", icon: Fingerprint }
        ].map((item) => {
          const Icon = item.icon;
          const key = item.key as keyof UserSettings;
          return (
            <label key={item.key} className="ao-card flex items-center justify-between p-5">
              <span className="flex items-center gap-3 font-semibold"><Icon size={18} />{item.label}</span>
              <input type="checkbox" checked={Boolean(settings[key])} onChange={(event) => save({ ...settings, [key]: event.target.checked })} />
            </label>
          );
        })}

        {message ? <p className="rounded-2xl bg-sage px-4 py-3 text-sm">{message}</p> : null}

        <button className="ao-button w-full" onClick={logout}>
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </AppShell>
  );
}

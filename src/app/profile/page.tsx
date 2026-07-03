"use client";

import { Camera, LogOut, Save } from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useWebsiteStore } from "@/stores/website-store";

export default function ProfilePage() {
  const { user, hydrate, logout } = useAuthStore();
  const websites = useWebsiteStore((state) => state.websites);
  const load = useWebsiteStore((state) => state.load);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    hydrate();
    load();
  }, [hydrate, load]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  async function updateProfile(event: FormEvent) {
    event.preventDefault();
    await api<boolean>("/api/profile", { method: "PATCH", body: JSON.stringify({ name, avatarUrl }) });
    await hydrate();
    setMessage("Profile updated.");
  }

  async function updatePassword(event: FormEvent) {
    event.preventDefault();
    await api<boolean>("/api/profile/password", { method: "POST", body: JSON.stringify({ password }) });
    setPassword("");
    setMessage("Password changed.");
  }

  return (
    <AppShell websites={websites}>
      <div className="ao-card mb-6 p-6 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-sage text-3xl font-semibold">
          {avatarUrl ? <Image src={avatarUrl} alt="" width={96} height={96} className="h-full w-full object-cover" unoptimized /> : user?.name?.slice(0, 1)}
        </div>
        <h1 className="text-2xl font-semibold">{user?.name || "Profile"}</h1>
        <p className="mt-1 text-sm opacity-60">{user?.email}</p>
        <p className="mt-3 text-xs opacity-50">Created {user?.createdAt?.slice(0, 10)}</p>
      </div>

      <form className="ao-card mb-6 grid gap-3 p-5" onSubmit={updateProfile}>
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Camera size={18} />Update Profile</h2>
        <input className="ao-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
        <input className="ao-input" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="Avatar URL" />
        <button className="ao-button"><Save size={17} />Save</button>
      </form>

      <form className="ao-card mb-6 grid gap-3 p-5" onSubmit={updatePassword}>
        <h2 className="text-lg font-semibold">Change Password</h2>
        <input className="ao-input" value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={8} placeholder="New password" />
        <button className="ao-button">Change Password</button>
      </form>

      {message ? <p className="mb-6 rounded-2xl bg-sage px-4 py-3 text-sm">{message}</p> : null}

      <button className="ao-button w-full" onClick={logout}>
        <LogOut size={17} />
        Logout
      </button>
    </AppShell>
  );
}

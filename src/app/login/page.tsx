"use client";

import { motion } from "framer-motion";
import { LockKeyhole, Mail } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const { login, loading, error } = useAuthStore();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await login(email, password, remember);
    const next = new URLSearchParams(window.location.search).get("next");
    router.push((next?.startsWith("/") ? next : "/home") as Route);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <motion.form
        className="ao-card w-full max-w-md p-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
      >
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-graphite/50">Personal Portal</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">AnotherOne</h1>
          <p className="mt-3 text-sm text-graphite/60">A calm home for the links you use every day.</p>
        </div>

        <label className="mb-4 block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium"><Mail size={16} />Email</span>
          <input className="ao-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>

        <label className="mb-4 block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium"><LockKeyhole size={16} />Password</span>
          <input className="ao-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>

        <label className="mb-6 flex items-center gap-3 text-sm">
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          Remember Me
        </label>

        {error ? <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <button className="ao-button w-full" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </motion.form>
    </main>
  );
}

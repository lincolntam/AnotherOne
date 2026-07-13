"use client";

import { ArrowLeft, EyeOff, LogIn } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

const instagramWebLoginUrl = "https://www.instagram.com/accounts/login/";

export default function AnotherInPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("anotherone-secret-unlocked") === "true") {
      setAllowed(true);
      window.location.href = instagramWebLoginUrl;
      return;
    }
    router.replace("/passcode");
  }, [router]);

  if (!allowed) return null;

  return (
    <AppShell showHeader={false} showBottomNav={false}>
      <main className="flex min-h-[100dvh] items-center justify-center bg-white px-6 text-center">
        <Link href={"/secret/categories" as Route} className="absolute left-6 top-14 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-paper lg:top-8" aria-label="Back">
          <ArrowLeft size={18} />
        </Link>
        <section className="max-w-sm">
          <div className="mb-6 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-graphite/45">
            <EyeOff size={14} />
            AnotherIn Private
          </div>
          <h1 className="text-xl font-bold text-ink">Opening Instagram Web Login</h1>
          <p className="mt-3 text-sm leading-6 text-graphite/60">If iOS blocks the redirect, use the button below.</p>
          <button className="ao-button mt-6 w-full" onClick={() => { window.location.href = instagramWebLoginUrl; }}>
            <LogIn size={16} />
            Open Web Login
          </button>
        </section>
      </main>
    </AppShell>
  );
}

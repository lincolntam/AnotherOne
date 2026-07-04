"use client";

import { ArrowLeft, ExternalLink, EyeOff, Instagram, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";

const defaultInstagramUrl = "https://www.instagram.com/";

export default function AnotherInPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(defaultInstagramUrl);
  const [inputUrl, setInputUrl] = useState(defaultInstagramUrl);
  const embedUrl = useMemo(() => toInstagramEmbedUrl(sourceUrl), [sourceUrl]);

  useEffect(() => {
    if (window.sessionStorage.getItem("anotherone-secret-unlocked") === "true") {
      setAllowed(true);
      return;
    }
    router.replace("/passcode");
  }, [router]);

  if (!allowed) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSourceUrl(normalizeInstagramUrl(inputUrl));
  }

  return (
    <AppShell showHeader={false}>
      <div className="mb-7 mt-3 flex items-center justify-center">
        <Link href={"/secret/categories" as Route} className="absolute left-5 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink" aria-label="Back">
          <ArrowLeft size={18} />
        </Link>
        <div className="text-center">
          <h1 className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink">AnotherOne</h1>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-graphite/45">
            <EyeOff size={14} />
            AnotherIn Private
          </div>
        </div>
      </div>

      <form className="mb-5 flex items-center gap-2 rounded-full bg-paper p-2" onSubmit={submit}>
        <span className="ml-3 text-graphite/45">
          <Instagram size={17} />
        </span>
        <input className="min-w-0 flex-1 bg-transparent px-1 text-sm font-semibold text-ink outline-none placeholder:text-graphite/35" value={inputUrl} onChange={(event) => setInputUrl(event.target.value)} placeholder="Paste Instagram URL" />
        <button type="button" aria-label="Clear URL" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-graphite/55" onClick={() => setInputUrl("")}>
          <X size={16} />
        </button>
        <button type="submit" aria-label="Open Instagram embed" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
          <ExternalLink size={15} />
        </button>
      </form>

      <section className="overflow-hidden rounded-[5px] border border-black/[0.04] bg-white shadow-[0_18px_45px_rgba(34,34,34,0.08)]">
        <iframe title="AnotherIn Instagram embed" src={embedUrl} className="h-[560px] w-full bg-white" loading="lazy" referrerPolicy="no-referrer" />
      </section>

      <button className="ao-button mt-5 w-full" onClick={() => window.open(sourceUrl, "_blank", "noopener,noreferrer")}>
        Open Instagram
      </button>
    </AppShell>
  );
}

function normalizeInstagramUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (!url.hostname.includes("instagram.com")) return defaultInstagramUrl;
    return url.href;
  } catch {
    return defaultInstagramUrl;
  }
}

function toInstagramEmbedUrl(value: string) {
  const normalized = normalizeInstagramUrl(value);
  try {
    const url = new URL(normalized);
    const parts = url.pathname.split("/").filter(Boolean);
    const kind = parts[0];
    const code = parts[1];
    if ((kind === "p" || kind === "reel" || kind === "tv") && code) {
      return `https://www.instagram.com/${kind}/${code}/embed`;
    }
    return normalized;
  } catch {
    return defaultInstagramUrl;
  }
}

"use client";

import { ArrowLeft, Copy, ExternalLink, EyeOff, Instagram, LogIn, X } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
  const embed = useMemo(() => toInstagramEmbed(sourceUrl), [sourceUrl]);
  const webLoginUrl = useMemo(() => toInstagramWebLoginUrl(sourceUrl), [sourceUrl]);

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
    setCopied(false);
  }

  async function copySourceUrl() {
    await navigator.clipboard.writeText(sourceUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <AppShell showHeader={false} showBottomNav={false}>
      <article className="min-h-[100dvh] bg-white text-ink lg:grid lg:grid-cols-[minmax(360px,0.38fr)_minmax(0,0.62fr)]">
        <aside className="border-black/[0.06] px-6 pb-28 pt-8 lg:min-h-[100dvh] lg:border-r lg:px-10">
          <div className="mb-10 flex items-center justify-center">
            <Link href={"/secret/categories" as Route} className="absolute left-6 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-paper" aria-label="Back">
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

          <form className="mb-6 flex items-center gap-2 rounded-full bg-paper p-2" onSubmit={submit}>
            <span className="ml-3 text-graphite/45">
              <Instagram size={17} />
            </span>
            <input className="min-w-0 flex-1 bg-transparent px-1 text-sm font-semibold text-ink outline-none placeholder:text-graphite/35" value={inputUrl} onChange={(event) => setInputUrl(event.target.value)} placeholder="Paste Instagram post or reel URL" />
            <button type="button" aria-label="Clear URL" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-graphite/55" onClick={() => setInputUrl("")}>
              <X size={16} />
            </button>
            <button type="submit" aria-label="Open Instagram embed" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
              <ExternalLink size={15} />
            </button>
          </form>

          <div className="rounded-[5px] bg-paper p-5 text-sm leading-6 text-graphite/70">
            <p className="font-semibold text-ink">Instagram embed note</p>
            <p className="mt-2">Instagram home/profile pages cannot be embedded in a PWA. Use Copy URL and paste into Safari, or try Web Login to reduce app redirect.</p>
          </div>
        </aside>

        <section className="flex min-h-[100dvh] items-center justify-center bg-white px-6 py-8 lg:px-12">
          <div className="w-full max-w-[680px]">
            {embed.canEmbed ? (
              <div className="overflow-hidden rounded-[5px] border border-black/[0.04] bg-white shadow-[0_18px_45px_rgba(34,34,34,0.08)]">
                <iframe title="AnotherIn Instagram embed" src={embed.url} className="h-[720px] w-full bg-white" loading="lazy" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[5px] border border-black/[0.04] bg-paper px-8 text-center">
                <Instagram size={34} className="text-graphite/35" />
                <h2 className="mt-6 text-lg font-bold text-ink">Instagram cannot open inside PWA.</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-graphite/60">This URL is blocked from iframe embedding. Copy the URL and paste it into Safari, or try Instagram Web Login.</p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button className="ao-button w-full" onClick={copySourceUrl}>
                <Copy size={16} />
                {copied ? "Copied" : "Copy URL"}
              </button>
              <button className="ao-button w-full" onClick={() => window.open(webLoginUrl, "_blank", "noopener,noreferrer")}>
                <LogIn size={16} />
                Open Web Login
              </button>
            </div>
          </div>
        </section>
      </article>
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

function toInstagramEmbed(value: string) {
  const normalized = normalizeInstagramUrl(value);
  try {
    const url = new URL(normalized);
    const parts = url.pathname.split("/").filter(Boolean);
    const kind = parts[0];
    const code = parts[1];
    if ((kind === "p" || kind === "reel" || kind === "tv") && code) {
      return { canEmbed: true, url: `https://www.instagram.com/${kind}/${code}/embed` };
    }
    return { canEmbed: false, url: normalized };
  } catch {
    return { canEmbed: false, url: defaultInstagramUrl };
  }
}

function toInstagramWebLoginUrl(value: string) {
  const normalized = normalizeInstagramUrl(value);
  try {
    const url = new URL(normalized);
    const next = `${url.pathname}${url.search}${url.hash}` || "/";
    return `https://www.instagram.com/accounts/login/?next=${encodeURIComponent(next)}`;
  } catch {
    return "https://www.instagram.com/accounts/login/";
  }
}

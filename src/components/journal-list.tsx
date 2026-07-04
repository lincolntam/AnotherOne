"use client";

import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import type { WebsiteShortcut } from "@/types/app";

export function JournalHeader({ backHref }: { backHref: Route }) {
  return (
    <div className="mb-7 mt-3 flex items-center justify-center">
      <Link href={backHref} className="absolute left-5 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink" aria-label="Back">
        <ArrowLeft size={18} />
      </Link>
      <h1 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink">AnotherOne</h1>
    </div>
  );
}

export function JournalList({ websites, onOpen }: { websites: WebsiteShortcut[]; onOpen: (website: WebsiteShortcut) => void }) {
  return (
    <div className="space-y-5 pb-6">
      {websites.map((website, index) => (
        <JournalShortcut key={website.id} website={website} index={index} onOpen={onOpen} />
      ))}
    </div>
  );
}

function JournalShortcut({ website, index, onOpen }: { website: WebsiteShortcut; index: number; onOpen: (website: WebsiteShortcut) => void }) {
  const accent = index % 4 === 3;
  const hasCoverImage = isCoverImage(website.imageUrl);

  return (
    <button className="grid w-full grid-cols-[58px_1fr] gap-3 text-left" onClick={() => onOpen(website)}>
      <div className="flex min-h-[116px] items-center justify-center bg-white">
        <span
          className={`max-h-[96px] text-center text-[11px] font-bold uppercase leading-4 tracking-[0.16em] [writing-mode:vertical-rl] ${
            accent ? "text-rose-400" : "text-ink"
          }`}
        >
          {website.title}
        </span>
      </div>

      <div className="ao-card min-h-[116px] overflow-hidden">
        <div className="relative h-[116px] w-full">
          {hasCoverImage ? (
            <Image src={website.imageUrl} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.75),transparent_6rem),linear-gradient(135deg,#dfe7dd,#c8d7dd,#d9bca7)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/18 via-transparent to-black/20" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-80">{website.category}</p>
            <p className="mt-1 line-clamp-1 text-sm font-semibold drop-shadow-sm">{website.description}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function isCoverImage(imageUrl: string) {
  if (!imageUrl) return false;
  const value = imageUrl.toLowerCase();
  return !value.includes("favicon") && !value.endsWith(".ico") && !value.endsWith(".svg");
}

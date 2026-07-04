"use client";

import { motion } from "framer-motion";
import { ExternalLink, Heart, Pin } from "lucide-react";
import { ExternalCoverImage } from "@/components/external-cover-image";
import type { WebsiteShortcut } from "@/types/app";

type WebsiteCardProps = {
  website: WebsiteShortcut;
  onOpen: (website: WebsiteShortcut) => void;
  compact?: boolean;
  featured?: boolean;
};

export function WebsiteCard({ website, onOpen, compact = false, featured = false }: WebsiteCardProps) {
  const hasCoverImage = isCoverImage(website.imageUrl);
  const isPrivateCard = website.userId === "secret";

  if (featured) {
    return (
      <motion.button
        className="relative block h-[390px] w-full overflow-hidden rounded-[7px] bg-mist text-left shadow-[0_18px_36px_rgba(34,34,34,0.16)] md:h-[420px]"
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.985 }}
        onClick={() => onOpen(website)}
      >
        {hasCoverImage ? (
          <ExternalCoverImage src={website.imageUrl} />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.78),transparent_7rem),linear-gradient(145deg,#dfe7dd_0%,#c8d7dd_46%,#d9bca7_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-transparent to-black/35" />
        {isPrivateCard ? (
          <div className="absolute left-6 top-7 max-h-[160px] text-white">
            <span className="block text-[11px] font-bold uppercase leading-4 tracking-[0.18em] [writing-mode:vertical-rl]">{website.title}</span>
          </div>
        ) : (
          <div className="absolute left-7 top-7 text-white">
            <span className="block text-5xl font-light leading-none">{String(new Date().getDate()).padStart(2, "0")}</span>
            <span className="mt-1 block text-lg font-semibold uppercase tracking-wide">{new Date().toLocaleDateString("en-US", { month: "short" })}</span>
          </div>
        )}
        <div className="absolute bottom-7 left-7 right-7 text-white">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">{website.category}</p>
          <h3 className="text-2xl font-semibold leading-tight">{website.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm opacity-85">{website.description}</p>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      className="ao-card block w-full overflow-hidden text-left"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(website)}
    >
      <div className={`relative w-full overflow-hidden bg-mist ${compact ? "h-28" : "h-48"}`}>
        {hasCoverImage ? (
          <ExternalCoverImage src={website.imageUrl} />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-semibold text-white" style={{ background: "radial-gradient(circle at 30% 20%,rgba(255,255,255,.65),transparent 6rem),linear-gradient(135deg,#dfe7dd,#c8d7dd,#d9bca7)" }}>
            {website.title.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-ink dark:text-white">{website.title}</h3>
            <p className="line-clamp-2 text-xs leading-relaxed text-graphite/60 dark:text-white/70">{website.description}</p>
          </div>
          <ExternalLink className="mt-1 shrink-0 opacity-35" size={15} />
        </div>
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-graphite/45 dark:text-white/60">
          <span>{website.updatedAt?.slice(0, 10)}</span>
          <span className="flex items-center gap-2">
            {website.favorite ? <Heart size={13} fill="currentColor" /> : null}
            {website.pinned ? <Pin size={13} fill="currentColor" /> : null}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function isCoverImage(imageUrl: string) {
  if (!imageUrl) return false;
  const value = imageUrl.toLowerCase();
  return !value.includes("favicon") && !value.endsWith(".ico") && !value.endsWith(".svg");
}

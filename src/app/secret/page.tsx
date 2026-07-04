"use client";

import { EyeOff } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { HomeCarousel } from "@/components/home-carousel";
import type { WebsiteShortcut } from "@/types/app";

const instagramWebLoginUrl = "https://www.instagram.com/accounts/login/";

const secretRecords: WebsiteShortcut[] = [
  {
    id: "secret-anotherwm",
    userId: "secret",
    title: "AnotherWM",
    description: "Private watchlist memory room.",
    url: "/secret/anotherwm",
    imageUrl: "",
    category: "Room",
    displayOrder: 0,
    active: true,
    favorite: true,
    pinned: true,
    clickCount: 0,
    lastUsedAt: null,
    createdAt: "2026-07-04T00:00:00.000Z",
    updatedAt: "2026-07-04T00:00:00.000Z"
  },
  {
    id: "secret-anotherin",
    userId: "secret",
    title: "AnotherIn",
    description: "Instagram web login.",
    url: instagramWebLoginUrl,
    imageUrl: "",
    category: "Room",
    displayOrder: 1,
    active: true,
    favorite: true,
    pinned: true,
    clickCount: 0,
    lastUsedAt: null,
    createdAt: "2026-07-05T00:00:00.000Z",
    updatedAt: "2026-07-05T00:00:00.000Z"
  }
];

export default function SecretPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("anotherone-secret-unlocked") === "true") {
      setAllowed(true);
      return;
    }
    router.replace("/passcode");
  }, [router]);

  function openPrivately(url: string) {
    if (url.startsWith("/")) router.push(url as Route);
    else window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!allowed) return null;

  return (
    <AppShell websites={secretRecords}>
      <div className="-mt-2 mb-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-graphite/45">
        <EyeOff size={14} />
        Private Browsing
      </div>
      <HomeCarousel websites={secretRecords} onOpen={(website) => openPrivately(website.url)} />

      <section className="mx-auto mt-2 w-[78%] space-y-3">
        {secretRecords.map((item) => (
          <button
            key={item.id}
            className="flex w-full items-center justify-between border-b border-black/[0.05] py-3 text-left"
            onClick={() => openPrivately(item.url)}
          >
            <span>
              <span className="block text-sm font-semibold text-ink">{item.title}</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-graphite/40">{item.category}</span>
            </span>
            <span className="text-xs text-graphite/35">Private</span>
          </button>
        ))}
      </section>
    </AppShell>
  );
}

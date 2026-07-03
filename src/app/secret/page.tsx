"use client";

import { EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { HomeCarousel } from "@/components/home-carousel";
import { privateShortcuts } from "@/utils/private-shortcuts";

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
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!allowed) return null;

  return (
    <AppShell websites={privateShortcuts}>
      <div className="-mt-2 mb-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-graphite/45">
        <EyeOff size={14} />
        Private Browsing
      </div>
      <HomeCarousel websites={privateShortcuts} onOpen={(website) => openPrivately(website.url)} />

      <section className="mx-auto mt-2 w-[78%] space-y-3">
        {privateShortcuts.map((item) => (
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

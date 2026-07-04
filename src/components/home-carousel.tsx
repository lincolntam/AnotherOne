"use client";

import { motion } from "framer-motion";
import { WebsiteCard } from "@/components/website-card";
import type { WebsiteShortcut } from "@/types/app";
import { demoShortcuts } from "@/utils/demo-shortcuts";

type HomeCarouselProps = {
  websites: WebsiteShortcut[];
  onOpen: (website: WebsiteShortcut) => void;
};

export function HomeCarousel({ websites, onOpen }: HomeCarouselProps) {
  const source = websites.length ? websites : demoShortcuts;
  const items = source.filter((item) => item.pinned || item.favorite).slice(0, 8);
  const display = items.length ? items : source.slice(0, 8);

  return (
    <section className="mb-8">
      <motion.div className="-mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-5 pt-1 [scrollbar-width:none] md:-mx-7 md:px-7 lg:gap-7 [&::-webkit-scrollbar]:hidden" layout>
        {display.map((website) => (
          <div key={website.id} className="w-[72%] shrink-0 snap-center md:w-[280px] lg:w-[300px]">
            <WebsiteCard website={website} onOpen={onOpen} featured />
          </div>
        ))}
      </motion.div>
    </section>
  );
}

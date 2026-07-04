"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalCoverImage } from "@/components/external-cover-image";
import { WebsiteCard } from "@/components/website-card";
import type { WebsiteShortcut } from "@/types/app";
import { DrawImage, getImageDrawKey, imageDrawChangedEvent, loadDrawImages, pickDrawImages } from "@/utils/image-draw";

type HomeCarouselProps = {
  websites: WebsiteShortcut[];
  onOpen: (website: WebsiteShortcut) => void;
};

export function HomeCarousel({ websites, onOpen }: HomeCarouselProps) {
  const pathname = usePathname();
  const drawKey = getImageDrawKey(pathname);
  const [drawImages, setDrawImages] = useState<DrawImage[]>([]);
  const source = websites;
  const items = source.filter((item) => item.pinned || item.favorite).slice(0, 8);
  const display = items.length ? items : source.slice(0, 8);
  const imageDisplay = pickDrawImages(drawImages);

  useEffect(() => {
    function loadImages() {
      setDrawImages(loadDrawImages(drawKey));
    }

    loadImages();
    window.addEventListener(imageDrawChangedEvent, loadImages);
    return () => window.removeEventListener(imageDrawChangedEvent, loadImages);
  }, [drawKey]);

  return (
    <section className="mb-8">
      <motion.div className="-mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-5 pt-1 [scrollbar-width:none] md:-mx-7 md:px-7 lg:gap-7 [&::-webkit-scrollbar]:hidden" layout>
        {imageDisplay.length
          ? imageDisplay.map((image) => (
              <div key={image.id} className="w-[72%] shrink-0 snap-center md:w-[280px] lg:w-[300px]">
                <ImageDrawCard image={image} />
              </div>
            ))
          : display.map((website) => (
              <div key={website.id} className="w-[72%] shrink-0 snap-center md:w-[280px] lg:w-[300px]">
                <WebsiteCard website={website} onOpen={onOpen} featured />
              </div>
            ))}
      </motion.div>
    </section>
  );
}

function ImageDrawCard({ image }: { image: DrawImage }) {
  return (
    <motion.div
      className="relative h-[390px] w-full overflow-hidden rounded-[7px] bg-mist shadow-[0_18px_36px_rgba(34,34,34,0.16)] md:h-[420px]"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
    >
      <ExternalCoverImage src={image.url} />
    </motion.div>
  );
}

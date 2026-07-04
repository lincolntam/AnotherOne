"use client";

import { useMemo, useState } from "react";

type ExternalCoverImageProps = {
  src: string;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
};

export function ExternalCoverImage({ src, alt = "", className = "h-full w-full object-cover", fallbackClassName }: ExternalCoverImageProps) {
  const [mode, setMode] = useState<"direct" | "proxy" | "failed">("direct");
  const imageSrc = useMemo(() => {
    if (!src || mode === "failed") return "";
    if (mode === "proxy") return `/api/secret/watchlist/image?url=${encodeURIComponent(src)}`;
    return src;
  }, [mode, src]);

  if (!imageSrc) {
    return <div className={fallbackClassName || "h-full w-full bg-[linear-gradient(135deg,#f5f1e9,#dfe8e9)]"} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setMode((current) => (current === "direct" && isRemoteImage(src) ? "proxy" : "failed"))}
    />
  );
}

function isRemoteImage(value: string) {
  return /^https?:\/\//iu.test(value);
}

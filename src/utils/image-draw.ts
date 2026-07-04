export type DrawImage = {
  id: string;
  url: string;
  active: boolean;
};

export const imageDrawChangedEvent = "anotherone:image-draw-changed";

export function getImageDrawKey(pathname: string) {
  if (pathname.startsWith("/secret/anotherwm")) return "secret-anotherwm";
  if (pathname.startsWith("/secret")) return "secret";
  if (pathname.startsWith("/home")) return "home";
  return pathname.replaceAll("/", "-").replace(/^-|-$/gu, "") || "home";
}

export function getImageDrawLabel(key: string) {
  if (key === "secret-anotherwm") return "AnotherWM";
  if (key === "secret") return "Secret";
  if (key === "home") return "Home";
  return key;
}

export function loadDrawImages(key: string): DrawImage[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(key)) || "[]") as DrawImage[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.url) : [];
  } catch {
    return [];
  }
}

export function saveDrawImages(key: string, images: DrawImage[]) {
  window.localStorage.setItem(storageKey(key), JSON.stringify(images.filter((item) => item.url)));
  window.dispatchEvent(new CustomEvent(imageDrawChangedEvent, { detail: { key } }));
}

export function pickDrawImages(images: DrawImage[]) {
  const activeImages = images.filter((item) => item.active && item.url);
  if (activeImages.length <= 10) return activeImages;
  return [...activeImages].sort(() => Math.random() - 0.5).slice(0, 10);
}

function storageKey(key: string) {
  return `anotherone:image-draw:${key}`;
}

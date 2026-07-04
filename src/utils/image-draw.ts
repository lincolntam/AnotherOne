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

export async function loadDrawImagesFromDb(key: string): Promise<DrawImage[]> {
  const response = await fetch(`/api/image-draw?key=${encodeURIComponent(key)}`);
  if (!response.ok) throw new Error("Load image draw failed.");
  const payload = (await response.json()) as { data?: DrawImage[] };
  return payload.data || [];
}

export function saveDrawImages(key: string, images: DrawImage[]) {
  window.localStorage.setItem(storageKey(key), JSON.stringify(images.filter((item) => item.url)));
  window.dispatchEvent(new CustomEvent(imageDrawChangedEvent, { detail: { key } }));
}

export async function saveDrawImagesToDb(key: string, images: DrawImage[]) {
  const cleanImages = images.filter((item) => item.url);
  const response = await fetch(`/api/image-draw?key=${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images: cleanImages })
  });
  if (!response.ok) throw new Error("Save image draw failed.");
  saveDrawImages(key, cleanImages);
  return cleanImages;
}

export function pickDrawImages(images: DrawImage[]) {
  const activeImages = images.filter((item) => item.active && item.url);
  if (activeImages.length <= 10) return activeImages;
  return [...activeImages].sort(() => Math.random() - 0.5).slice(0, 10);
}

function storageKey(key: string) {
  return `anotherone:image-draw:${key}`;
}

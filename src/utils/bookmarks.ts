import type { WebsiteInput } from "@/services/website-service";

export function parseBookmarksHtml(html: string): WebsiteInput[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const links = Array.from(doc.querySelectorAll("a[href]"));

  return links.map((link, index) => {
    const category = findNearestFolder(link) || "Imported";
    const url = link.getAttribute("href") || "";
    return {
      title: (link.textContent || url).trim(),
      description: `Imported from ${category}`,
      url,
      imageUrl: faviconFor(url),
      category,
      displayOrder: index + 1,
      active: true,
      favorite: false,
      pinned: false
    };
  }).filter((item) => item.url.startsWith("http"));
}

function findNearestFolder(node: Element) {
  let current: Element | null = node;
  while (current) {
    const heading = current.previousElementSibling;
    if (heading?.tagName === "H3" && heading.textContent?.trim()) return heading.textContent.trim();
    current = current.parentElement;
  }
  return null;
}

function faviconFor(url: string) {
  try {
    const host = new URL(url).origin;
    return `${host}/favicon.ico`;
  } catch {
    return "";
  }
}

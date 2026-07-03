import type { WebsiteShortcut } from "@/types/app";

export const demoShortcuts: WebsiteShortcut[] = [
  {
    id: "demo-github",
    userId: "demo",
    title: "GitHub",
    description: "Source code repository.",
    url: "https://github.com",
    imageUrl: "",
    category: "Work",
    displayOrder: 1,
    active: true,
    favorite: true,
    pinned: true,
    clickCount: 12,
    lastUsedAt: "2026-07-03T09:00:00.000Z",
    createdAt: "2026-07-03T09:00:00.000Z",
    updatedAt: "2026-07-03T09:00:00.000Z"
  },
  {
    id: "demo-chatgpt",
    userId: "demo",
    title: "ChatGPT",
    description: "AI assistant workspace.",
    url: "https://chatgpt.com",
    imageUrl: "",
    category: "AI",
    displayOrder: 2,
    active: true,
    favorite: true,
    pinned: true,
    clickCount: 9,
    lastUsedAt: "2026-07-02T14:20:00.000Z",
    createdAt: "2026-07-03T09:00:00.000Z",
    updatedAt: "2026-07-03T09:00:00.000Z"
  },
  {
    id: "demo-outlook",
    userId: "demo",
    title: "Outlook",
    description: "Email and calendar.",
    url: "https://outlook.office.com",
    imageUrl: "",
    category: "Work",
    displayOrder: 3,
    active: true,
    favorite: false,
    pinned: false,
    clickCount: 6,
    lastUsedAt: "2026-07-01T08:10:00.000Z",
    createdAt: "2026-07-03T09:00:00.000Z",
    updatedAt: "2026-07-03T09:00:00.000Z"
  }
];

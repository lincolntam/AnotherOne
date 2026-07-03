export type UserRole = "admin" | "user";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  active: boolean;
};

export type WebsiteShortcut = {
  id: string;
  userId: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  category: string;
  displayOrder: number;
  active: boolean;
  favorite: boolean;
  pinned: boolean;
  clickCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  description: string;
  displayOrder: number;
  createdAt: string;
};

export type UserSettings = {
  theme: "system" | "light" | "dark";
  language: "en" | "zh-Hant";
  notifications: boolean;
  pinEnabled: boolean;
  biometricReady: boolean;
};

export type UsageSummary = {
  websiteId: string;
  title: string;
  url: string;
  clickCount: number;
  lastUsedAt: string | null;
};

export type ApiResult<T> = {
  data?: T;
  error?: string;
};

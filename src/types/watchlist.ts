export type WatchlistPerson = {
  name: string;
  url?: string;
};

export type WatchlistGenre = {
  name: string;
  url?: string;
};

export type WatchlistItem = {
  id: string;
  sourceUrl: string;
  site: "missav" | "jable" | "unknown";
  title: string;
  code: string;
  coverUrl: string;
  actresses: WatchlistPerson[];
  genres: WatchlistGenre[];
  releaseDate: string;
  savedAt: string;
};

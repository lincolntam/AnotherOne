create table if not exists anotherwm_watchlist_items (
  id text primary key,
  user_id text not null,
  source_url text not null,
  site text not null default 'unknown',
  title text not null,
  code text not null default '',
  cover_url text not null default '',
  preview_url text not null default '',
  actresses_json text not null default '[]',
  genres_json text not null default '[]',
  release_date text not null default '',
  status text not null default 'Pending',
  saved_at text not null,
  updated_at text not null default (datetime('now')),
  unique(user_id, source_url)
);

create index if not exists idx_anotherwm_watchlist_user_saved on anotherwm_watchlist_items(user_id, saved_at desc);

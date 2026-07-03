-- AnotherOne Cloudflare D1 schema.
-- If you already have a users table, keep it and adjust ao_users_view to map your existing columns.

create table if not exists users (
  id text primary key,
  email text not null unique,
  name text,
  avatar_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  password_hash text,
  active integer not null default 1,
  created_at text not null default (datetime('now'))
);

drop view if exists ao_users_view;
create view ao_users_view as
select
  id,
  lower(email) as email,
  coalesce(name, email) as name,
  avatar_url,
  case when role = 'admin' then 'admin' else 'user' end as role,
  password_hash,
  created_at,
  active
from users;

create table if not exists user_sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at text not null,
  created_at text not null
);

create table if not exists categories (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  name text not null,
  description text not null default '',
  display_order integer not null default 100,
  created_at text not null default (datetime('now')),
  unique(user_id, name)
);

create table if not exists website_shortcuts (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  title text not null,
  description text not null default '',
  url text not null,
  image_url text not null default '',
  category text not null default 'General',
  display_order integer not null default 100,
  active integer not null default 1,
  favorite integer not null default 0,
  pinned integer not null default 0,
  click_count integer not null default 0,
  last_used_at text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now')),
  unique(user_id, url)
);

create table if not exists website_usage_events (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  website_id text not null references website_shortcuts(id) on delete cascade,
  opened_at text not null
);

create table if not exists recent_websites (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  website_id text not null references website_shortcuts(id) on delete cascade,
  opened_at text not null,
  unique(user_id, website_id)
);

create table if not exists user_settings (
  user_id text primary key references users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  language text not null default 'zh-Hant' check (language in ('zh-Hant', 'en')),
  notifications integer not null default 0,
  pin_enabled integer not null default 0,
  biometric_ready integer not null default 1,
  updated_at text not null default (datetime('now'))
);

create table if not exists quick_unlock_credentials (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  pin_hash text,
  biometric_public_key text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create index if not exists idx_sessions_token on user_sessions(token_hash);
create index if not exists idx_websites_user_order on website_shortcuts(user_id, active, pinned, display_order);
create index if not exists idx_usage_user_opened on website_usage_events(user_id, opened_at desc);
create index if not exists idx_recent_user_opened on recent_websites(user_id, opened_at desc);

# AnotherOne

AnotherOne is a Cloudflare-first Progressive Web App for a personal portal and bookmark manager. It uses Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Zustand, OpenNext for Cloudflare, and Cloudflare D1.

## Features

- D1-backed email/password login with `admin` and `user` roles.
- Protected routes: `/home`, `/profile`, `/categories`, `/websites`, `/settings`.
- OakDiary-inspired mobile-first UI with cards, carousel, modal search, and motion transitions.
- Website shortcuts with favorites, pinning, recent activity, click analytics, and admin CRUD.
- Browser `bookmarks.html` import.
- PWA manifest, service worker, offline entry, asset cache, image cache, and install prompt.

## Local Setup

```bash
npm install
npm run dev
```

PowerShell may block `npm.ps1`; on Windows you can use `npm.cmd install` and `npm.cmd run dev`.

## Cloudflare D1

1. Create a D1 database:

```bash
npx wrangler d1 create anotherone
```

2. Copy the returned database id into `wrangler.toml`.
3. Apply migrations:

```bash
npm run d1:migrate:local
npm run d1:migrate:remote
```

Seeded demo admin:

- Email: `admin@anotherone.local`
- Password: `AnotherOne123!`

If you already have a `users` table, keep it and adjust `ao_users_view` in `migrations/0001_anotherone.sql` so it returns:

```sql
id, email, name, avatar_url, role, password_hash, created_at, active
```

Supported password hash formats:

- `pbkdf2$sha256$iterations$saltBase64Url$hashBase64Url`
- `sha256$hashBase64Url` for migration/demo only

## Deployment

Build and deploy with OpenNext for Cloudflare:

```bash
npm run pages:build
npm run pages:deploy
```

Configure the D1 binding as `DB` in Cloudflare and keep `SESSION_COOKIE_NAME` set to `ao_session` unless you also update the app environment.

## API Design

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/websites`
- `GET /api/websites?admin=1`
- `POST /api/websites`
- `PATCH /api/websites/:id`
- `DELETE /api/websites/:id`
- `POST /api/websites/:id/open`
- `POST /api/websites/import`
- `PATCH /api/profile`
- `POST /api/profile/password`
- `GET /api/settings`
- `PUT /api/settings`
- `GET /api/analytics`

## Notes

The app intentionally does not read browser bookmarks directly because browsers do not expose that data to normal web pages. v1 imports exported `bookmarks.html`; a future browser extension can call the same import API.

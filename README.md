# Style Me With Wardrobe

A full-stack fashion styling platform. Build your digital wardrobe, generate complete
outfits ("Style My Outfit"), match jewelry, explore Trend Setter looks, and save your
favorites.

Built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, **shadcn/ui**, **Prisma 7**
(PostgreSQL), **Auth.js v5**, and **Cloudinary**.

## Features

- **Wardrobe** — add/upload clothing items with category, color, pattern, material,
  occasion, season and style tags; search, filter and sort.
- **Style My Outfit** — pick an occasion, season and style; the styling engine builds a
  complete look (outfit, jewelry, footwear, bag, accessories, hairstyle, makeup, color
  palette and styling tips) from your real wardrobe items.
- **Complete Look** — save a generated look (with a shareable `/looks/:id` page) or
  regenerate for new options.
- **Jewelry Matcher** — describe the occasion, style and neckline to get jewelry, metal
  tone and gem recommendations.
- **Trend Setter** — curated seasonal trends with item lists; heart any trend or look.
- **Favorites & Saved Looks** — everything you hearted lives under one roof.
- **Dashboard / Profile / Settings** — stats, recent items and your style profile.
- **Admin console** — manage trends and the jewelry/accessory catalog (`/admin`).

## Tech notes

- Next.js 16 conventions apply: `src/proxy.ts` (not `middleware.ts`), async
  `params`/`searchParams`, Turbopack default. See the docs shipped in
  `node_modules/next/dist/docs/`.
- Prisma 7 uses a driver adapter (`@prisma/adapter-pg`) and generates the client into
  `src/generated/prisma/` (gitignored — regenerate with `npx prisma generate`).

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required for the app to run against a database:

| Variable              | Description                                             |
| --------------------- | ------------------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string (e.g. a Neon or Supabase)  |
| `AUTH_SECRET`         | Run `npx auth secret` to generate                       |
| `GOOGLE_CLIENT_ID`    | Optional — Google sign-in (leave blank to disable)      |
| `GOOGLE_CLIENT_SECRET`| Optional — Google sign-in (leave blank to disable)      |
| `CLOUDINARY_CLOUD_NAME` | Optional — image uploads (falls back to local `/public/uploads`) |
| `CLOUDINARY_API_KEY`  | Optional                                                |
| `CLOUDINARY_API_SECRET`| Optional                                               |

### 3. Configure a local database

The repo ships with an embedded, portable PostgreSQL runner (no install, no admin
rights needed). Start it in its own terminal:

```bash
npm install
npm run db:start   # initialises .data/pg, starts Postgres on :5433, creates the "styleme" DB
```

`.env` already points `DATABASE_URL` at `127.0.0.1:5433/styleme`. Stop it anytime
with `npm run db:stop`.

### 4. Create the schema and seed demo data

```bash
npx prisma migrate deploy
npx prisma db seed
```

Demo accounts: `admin@example.com` / `admin123` and `user@example.com` / `user123`.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> If you'd rather use Supabase/Neon/etc., set `DATABASE_URL` in `.env` to your
> connection string. Legacy Supabase URLs with `?sslmode=require` are handled
> automatically (SSL is only enabled for non-local hosts).

## Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start the dev server (Turbopack)         |
| `npm run build`         | Production build                         |
| `npm run start`         | Serve the production build               |
| `npm run lint`          | Lint                                     |
| `npm run db:start`      | Start the embedded Postgres server       |
| `npm run db:stop`       | Stop the embedded Postgres server        |
| `npx tsc --noEmit`      | Typecheck                                |
| `npx prisma generate`   | Regenerate the Prisma client             |
| `npx prisma migrate deploy`| Apply schema migrations               |
| `npx prisma db seed`    | Seed demo data (`tsx prisma/seed.ts`)    |

## Project structure

```
src/
  app/            # App Router pages & API routes
  components/     # UI, feature components (wardrobe, style, look, jewelry, trends, admin…)
  generated/      # Prisma client (gitignored)
  lib/            # actions, auth-actions, recommendations, validations, constants, prisma, upload
  auth.ts         # NextAuth config
  auth.config.ts  # pages, session strategy, callbacks (guards /admin etc.)
  proxy.ts        # Next.js 16 middleware replacement
prisma/
  schema.prisma   # 14 models
  seed.ts         # demo data
```

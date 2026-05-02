# Book-Cast

Book-Cast is a slow, ambient reader for public-domain literature. A fixed playlist of classics advances on a shared clock—every visitor sees the same passage at the same moment—so reading feels quietly communal, like tuning into a radio broadcast.

The interface stays minimal: vertically scrolling text, optional wake lock so phones stay awake during longer listens, and a small live count of concurrent readers (stored briefly server-side for presence only).

## What runs here

- **Next.js (App Router)** — UI and API routes.
- **Timed playlist** — Books rotate on a schedule derived from word counts; see `lib/playlist.ts` and `lib/timing.ts`.
- **Texts** — Plain `.txt` sources under `public/books/` (Project Gutenberg–style public domain material).
- **Presence** — `POST /api/presence` records an anonymous session heartbeat and returns an approximate reader count; rows expire after a short TTL. Backed by **Neon** (Postgres) via `@neondatabase/serverless`.

Deployed on **Vercel** with build-time and runtime env configured in the hosting dashboard—not checked into git.

## Configuration (operators)

The app expects a **`DATABASE_URL`** at runtime (Neon connection string). It is read only from the environment; nothing equivalent belongs in the repository.

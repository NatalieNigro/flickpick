# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm start        # Start production server
```

No test or lint commands are configured.

## Required Environment Variables

```
OPENAI_API_KEY
OMDB_API_KEY
WATCHMODE_API_KEY
```

## Architecture

**Next.js 14 App Router** — all pages under `app/`, API routes under `app/api/`.

**No backend database.** All persistent state lives in `localStorage` via three keys:
- `flickpickMemory` — rated movies with status and tags
- `flickpickLastResults` — cached last recommendation (intro, movies, vibe)
- `flickpickPickList` — ordered watch-list

### Core Request Flow

1. User submits a "vibe" on the home page
2. POST `/api/pick` receives the vibe + current memory
3. API calls OpenAI (GPT-4o-mini) → get 3 movie titles
4. API calls OMDb for each movie → enrich with poster, genre, actors, plot, rating
5. Response: `{ intro, movies[] }` rendered via `MovieCard` / `MovieGrid`
6. User rates movies; status written to `flickpickMemory` via `app/utils/memory.js`

Streaming source data comes from Watchmode (`/api/watch`), fetched lazily per-card.

### Pages

| Route | Purpose |
|---|---|
| `/` | Main recommendation flow |
| `/vault` | Browse/manage rated movie history |
| `/pick-list` | Draggable ordered watch-list |
| `/settings` | App settings |

### Key Conventions

**Movie identity** — movies are keyed by `title + year` throughout (deduplication, memory lookups).

**Status values** — `loved`, `wantToWatch`, `notInterested`, `meh`, `hardPass`.

**SSR safety** — utilities in `app/utils/` guard `localStorage` access with `typeof window === "undefined"` checks.

**Styling** — all styles are inline (no CSS files, no Tailwind). Theme is purple/lavender (`#5b21b6`, `#ede9fe`). Pill buttons use `borderRadius: 999`, cards use `borderRadius: 20–24px`. Animations are CSS keyframes defined inline in component style tags.

**Drag & drop** — pick-list uses native browser drag events (`onDragStart`, `onDrop`) with index tracking; order is persisted to `localStorage` after each drop.

**Emojis in UI** — the app uses emojis extensively for status buttons and visual feedback; this is intentional to the design.

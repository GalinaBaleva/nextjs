## Repo snapshot

This is a small Next.js (App Router) TypeScript project that lists events and exposes a single API route to create events. It uses Mongoose for MongoDB, Tailwind for styling, and Next/Image for assets.

Keep guidance focused on what a coding agent needs to be productive quickly: where data comes from, how components and API routes connect, and project-specific conventions.

## Big picture & architecture

- Frontend: `app/layout.tsx`, `app/page.tsx` (App Router). Layout injects global fonts and `Navbar` + `LightRays` background.
- UI components live in `components/` (e.g. `EventCard.tsx`, `Navbar.tsx`, `ExploreBtn.tsx`). Note: `ExploreBtn` is a client component (`'use client'`). Most other components are server components by default.
- Static demo data: `lib/constants.ts` (used for featured events on the home page).
- Backend: App Router API route at `app/api/events/route.ts` handles POST to create events. It expects a form-data POST and delegates to the Mongoose model.
- Database: `database/` contains Mongoose models (`event.model.ts`, `booking.model.ts`) and `database/index.ts` which re-exports models and types.
- DB connection: `lib/mongodb.ts` implements a cached Mongoose connector and throws a clear error if `MONGODB_URI` is missing.

## Important files to inspect when changing behavior

- `app/api/events/route.ts` — input handling uses `req.formData()` and `Object.fromEntries(...)`; returns JSON responses with status codes.
- `lib/mongodb.ts` — connection caching pattern (global on dev). If you see duplicated connections in dev, check this file.
- `database/event.model.ts` — contains schema, validation, index on `slug`, pre-save hooks (slug generation, date normalization, time format validation). Any changes to event shape must align with this logic.
- `lib/constants.ts` — used as demo data; remove or replace when wiring real DB reads into pages.
- `components/EventCard.tsx` — example of Next/Image usage with local `public/images` assets and routing to `/events/[slug]`.

## Conventions & patterns to follow

- TypeScript + Mongoose: models export both the default model and a type (`IEvent`). Use those types where helpful.
- Server vs Client components: Only files with `'use client'` at the top are client components. Keep heavy data fetching in server components or API routes.
- Styling: Tailwind utility classes are used widely. The helper `lib/utils.ts` exports `cn(...)` (clsx + tailwind-merge) — prefer it when composing class names.
- Images/icons: Stored under `public/images` and `public/icons`; `next/image` is used with fixed width/height values in components.
- Environment: `MONGODB_URI` is required for DB operations. In local development add it to `.env.local`.

## Developer workflows / commands

- Start dev server: `npm run dev` (runs `next dev`).
- Build: `npm run build` and `npm start` to serve production build.
- Lint: `npm run lint` (ESLint configured).

Notes for debugging DB/API issues:
- If POST `/api/events` fails, confirm `MONGODB_URI` and check `lib/mongodb.ts` connection logs. The route returns 400 for malformed form-data and 500 for DB errors.
- The API expects form-data (not JSON) as implemented; mimic that when writing integration tests or scripts.

## Examples an agent should use

- Create an event (example): POST form-data to `/api/events` with keys matching `event.model.ts` fields (title, description, overview, image, venue, location, date, time, mode, audience, agenda (multiple), organizer, tags (multiple)). The model normalizes `date` to YYYY-MM-DD and enforces `time` as HH:MM.
- Read demo events locally: `lib/constants.ts` for static data used by `app/page.tsx`.

## Safe refactor tips

- When changing the `Event` schema: update `database/event.model.ts` pre-save hooks and tests, and update any code that constructs events (API route or seed scripts).
- When introducing new API routes, follow the App Router convention: `app/api/<name>/route.ts` and import `connectDB()` before model operations.

## Missing or not-present items to ask about

- There are no automated tests or seeding scripts in the repo — ask maintainers if they want test examples or data seeds.
- Deployment details (Vercel settings, env variables) are not present; confirm preferred target and how `MONGODB_URI` is provisioned.

If any section is unclear or you want examples (curl/form-data body, seed script, or a small unit test for `event.model.ts`), tell me which one and I'll add it.

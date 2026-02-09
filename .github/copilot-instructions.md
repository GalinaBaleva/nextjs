## Repo snapshot

This is a Next.js (App Router) TypeScript project that manages developer events with full CRUD operations via REST API routes. Features include event discovery (home page), event details pages, event creation with Cloudinary image uploads, and event bookings. Uses Mongoose for MongoDB, Tailwind for styling, Next/Image for assets, and Cloudinary for image hosting.

Branch context: Currently on `api-routes` branch with expanded API coverage and booking functionality.

Keep guidance focused on what a coding agent needs to be productive quickly: where data comes from, how components and API routes connect, and project-specific conventions.

## Big picture & architecture

- **Frontend Structure**: `app/layout.tsx` (injects Schibsted Grotesk and Martian Mono fonts), `app/page.tsx` (event list), `app/events/[slug]/page.tsx` (event details). Layout wraps with `<Navbar>` and `<LightRays>` animated background.
- **UI Components** (`components/`): `EventCard.tsx` (server), `BookEvent.tsx` (client, `'use client'`), `ExploreBtn.tsx` (client), `Navbar.tsx` (server), `LightRays.tsx` (WebGL animation). Most are server components; only mark client components explicitly.
- **Demo Data**: `lib/constants.ts` provides fallback event list (used when API unavailable during development).
- **API Routes**: 
  - `app/api/events/route.ts` — POST (form-data with image upload via Cloudinary) and GET (all events).
  - `app/api/events/[slug]/route.ts` — GET single event by slug.
  - Form-data parsing: `Object.fromEntries(formData.entries())`, JSON arrays parsed from form fields (`tags`, `agenda`).
## Important files to inspect when changing behavior

- **`app/api/events/route.ts`** — POST: parses form-data (not JSON), uploads image via `cloudinary.uploader.upload_stream()`, extracts/parses JSON arrays for `tags` and `agenda`, returns 201 on success or 400/500 on error. GET: returns all events paginated or filtered. Always call `connectDB()` first.
- **`app/api/events/[slug]/route.ts`** — GET only; validates slug param, queries Event by lowercase slug, returns 404 if not found or 200 with event object. Uses async params pattern (`const { slug } = await params`).
- **`lib/mongodb.ts`** — global cache pattern; Dev uses `global.mongoose`, production scopes to module. Throw error on MONGODB_URI missing.
- **`database/event.model.ts`** — schema with validation, unique index on `slug`, pre-save hooks (auto-generate slug from title, validate date/time formats, normalize to YYYY-MM-DD and HH:MM). Arrays: `agenda: [String]`, `tags: [String]`. Enum field: `mode: ['online', 'offline', 'hybrid']`.
- **`database/booking.model.ts`** — schema with `eventId` reference to Event (enforced in pre-save), email validation regex, timestamps auto-managed. Index on `eventId` for fast lookups.
- **`app/events/[slug]/page.tsx`** — server component; fetches from `/api/events/[slug]` with ISR (`revalidate: 60`), uses `notFound()` on 404, renders event details and calls `BookEvent` (client component).
- **`lib/actions/event.actions.ts`** — example server action (`'use server'`). Always connect DB and handle errors gracefully.
- **`lib/constants.ts`** — used only if API unavailable; remove/update when fully DB-driven.
## Conventions & patterns to follow

- **TypeScript + Mongoose**: Models export default model + interface (e.g., `export interface IEvent ...` and `export default model<IEvent>(...)`). Use types throughout app. Import via `import Event, { IEvent } from '@/database'` or `import { Event, IEvent } from '@/database'`.
- **Server vs Client Components**: `'use client'` at file top only—no mixing. Server components fetch data, call server actions, access secrets. Client components use hooks, event handlers, browser APIs (`useState`, `useEffect`). `BookEvent.tsx` and `ExploreBtn.tsx` are client; most others are server.
- **API Route Pattern**: Always `await connectDB()` before model operations. Parse form-data with `req.formData()`, handle JSON arrays with `JSON.parse()`. Return `NextResponse.json({ ... }, { status: XXX })` with appropriate 400/404/500 codes. Use async params: `const { slug } = await params`.
- **Styling**: Tailwind utility classes throughout. Use `cn()` from `lib/utils.ts` (combines clsx + tailwind-merge) when conditionally composing classes.
- **Images**: Stored in `public/images` and `public/icons`. Always use `next/image` component with fixed `width` and `height` props (no fill unless layout="fill" explicitly needed).
- **Environment**: `MONGODB_URI` required for DB ops. Local dev: add to `.env.local`. `NEXT_PUBLIC_BASE_URL` used in client-side fetches (fallback to `http://localhost:3000`). Cloudinary credentials needed for image uploads (set via `cloudinary.config()` in route).
- **Dates**: Stored as YYYY-MM-DD strings in DB (normalized in pre-save hook). Time as HH:MM strings. Both validated before save.
## Developer workflows / commands

- `npm run dev` — start Next.js dev server at http://localhost:3000 (enables hot reloads, preserves Mongoose connection via global cache).
- `npm run build` — production build; errors if DB connection fails at build time (ensure MONGODB_URI set).
- `npm start` — run built production server.
- `npm run lint` — ESLint; configured to check App Router patterns and React/Next.js best practices.

### Debugging DB/API issues

- **DB connection fails**: Confirm `MONGODB_URI` in `.env.local` and valid format (include credentials, database name). Check `lib/mongodb.ts` logs; connection is cached globally in dev to avoid re-auth spam.
- **POST `/api/events` returns 400**: Form-data malformed (missing required fields or files). Ensure `image` file present and `tags`/`agenda` are valid JSON strings in form fields.
- **POST `/api/events` returns 500**: Check server logs for Mongoose validation errors (slug uniqueness, enum constraints) or Cloudinary upload failure (credentials or quota issue).
- **GET `/api/events/[slug]` returns 404**: Slug not found or case mismatch. Queries lowercase; ensure slug generation (auto-derived from title in pre-save) or manual slug matches.
- **Image upload fails**: Verify Cloudinary credentials are set (config in route); check upload folder permissions (`DevEvent` folder in your Cloudinary account).

## Examples an agent should use

- **Create event via API**: POST form-data to `/api/events`. Form fields: `title`, `description`, `overview`, `image` (File), `venue`, `location`, `date` (YYYY-MM-DD), `time` (HH:MM), `mode` (online|offline|hybrid), `audience`, `organizer`, `tags` (JSON string array), `agenda` (JSON string array). Returns 201 with event object or error.
- **Fetch all events**: GET `/api/events` returns `{ events: [IEvent], ... }`.
- **Fetch event by slug**: GET `/api/events/my-event-slug` returns `{ message, event: IEvent }` or 404.
- **Create booking**: POST to `/api/bookings` (if route exists) with `{ eventId, email }`. Validates email format and event existence.
- **Demo/offline work**: `lib/constants.ts` provides fallback events; used if `/api/events` unreachable.
## Safe refactor tips

- **Schema changes**: Update `database/event.model.ts` or `database/booking.model.ts`, including pre-save hooks, validation, and indexes. Re-export in `database/index.ts`. Update API routes, components, and types.
- **New API routes**: Create `app/api/<resource>/route.ts`; always `await connectDB()` at start. Handle async params pattern for dynamic routes.
- **New pages**: Use server components by default; fetch from API routes or directly via Mongoose. Use `ISR` (revalidate option) for static generation with periodic revalidation.
- **Slot pattern**: If adding nested routes, follow `app/api/<parent>/[param]/route.ts` structure. Validate param type/format early.

## Known limitations & TODOs

- **No tests**: No Jest, Vitest, or E2E tests in repo. Add if expanding.
- **No seeding**: Manually create events via API or DB shell. Consider seed script later.
- **Booking API incomplete**: `booking.model.ts` exists but no GET/POST/DELETE booking routes yet (add to `app/api/bookings/route.ts`).
- **Image upload**: Cloudinary credentials must be manually set. No fallback or default image handling.
- **Error handling**: Some routes return generic 500 errors; expand with specific error messages for better debugging.

If sections are unclear or you want code examples (curl form-data snippet, booking route scaffold, or seed script), ask and I'll provide.

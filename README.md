# Campus Truth

Your campus, decoded. A verified news feed for UNILAG students that replaces
the "ask the course rep and hope" workflow: official school updates and
verified class-rep posts in one trustworthy feed, plus an AI assistant
(TrustBot) that only answers from what's actually been verified.

## Two modes, same codebase

- **Demo mode** (default, no setup required): everything runs on
  `localStorage`. Clone it, `npm install`, `npm run dev` — fully clickable,
  nothing to configure.
- **Live mode**: fill in `.env.local` (copy from `.env.local.example`) with
  your Firebase project's config, and the app automatically switches to
  real auth + Firestore. No code changes needed — `lib/firebase.ts` detects
  whether the env vars are present and every page branches accordingly.

## What's built

- **Onboarding** (`/`) — identity → department & level → class-rep intent.
  In live mode this creates a real Firebase Auth account (email + password)
  and a `users/{uid}` Firestore doc.
- **Login** (`/login`) — returning-user sign-in (Firebase Auth in live mode).
- **Home feed** (`/feed`) — greeting, search, "Ask TrustBot" shortcut,
  Trending Now, Quick Links, department-scoped feed with an "All UNILAG"
  toggle. Reads from Firestore `posts` in live mode.
- **Article detail** (`/feed/[id]`) — source badge + confidence score,
  expandable source history timeline, related updates, share/save.
- **TrustBot chat** (`/chat`) — keyword-retrieval Q&A over whatever's in
  `posts` right now, citing sources and flagging confidence by source type.
- **Departments** (`/departments`) — browse any department's feed.
- **Post an update / Submit a tip** (`/rep`) — verified reps post straight
  to `posts` with `sourceType: "class-rep"`; everyone else submits a
  `"community"` tip. Writes to Firestore in live mode, `localStorage`
  otherwise.
- **Profile** (`/profile`) — saved updates, notifications, data sources,
  account settings, and a **real verification request flow**: tapping
  "Request class rep verification" writes to `repRequests` and sets
  `repStatus: "pending"` — it does not self-grant the badge.
- **Admin** (`/admin`) — approve or deny pending `repRequests`. Gated by
  `NEXT_PUBLIC_ADMIN_EMAILS` in `.env.local`; shows a link in Profile only
  for emails on that list. In demo mode this page explains there's nothing
  to approve yet, since there's no shared queue without a backend.

### The trust system (the actual product)

Three tiers, enforced structurally, not just labeled:

1. **Official** — scraped/verified school source, shows a confidence %.
2. **Class rep** — only settable via the `/admin` approval flow, never by
   the user themselves.
3. **Community** — unverified tip, flagged as such everywhere it appears.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind + Firebase (Auth +
Firestore), matching your Starkstores stack choices.

## Running it

```bash
npm install
npm run dev
```

For live mode, first: `cp .env.local.example .env.local` and fill in your
Firebase project's config (Project settings → General → Your apps). Also
set `NEXT_PUBLIC_ADMIN_EMAILS` to whichever email(s) should see `/admin`.

Then in the Firebase console:
- Enable **Email/Password** under Authentication → Sign-in method.
- Create a **Firestore database** (production mode is fine).
- Paste `firestore.rules` into Firestore → Rules (update the hardcoded
  admin email in there to match `NEXT_PUBLIC_ADMIN_EMAILS`).

Open http://localhost:3000. Best viewed at mobile width (it's built
mobile-first, max-w-md).

## Still worth doing before a real launch

- **Official source ingestion**: a scheduled Cloud Function that polls the
  UNILAG portal/social accounts and writes `sourceType: "official"` posts
  with a computed confidence score. Nothing does this yet — official posts
  are still just seed data in `lib/data.ts`.
- **TrustBot**: currently keyword-matching over local posts
  (`answerFrom()` in `app/chat/page.tsx`). Swap for a real Anthropic API
  call, passing only verified `posts` as context so it can't answer beyond
  what's confirmed — that constraint is the whole point of the product.
- **Firestore rules**: `firestore.rules` is a reasonable starting point but
  hardcodes the admin email inline — move that to a custom claim if you add
  more than one admin.
- **Email domain restriction**: nothing currently stops a non-UNILAG email
  from signing up. Add a check in `signUp()` if you want to restrict to
  `@unilag.edu.ng` (or wherever your students' emails actually are).

## Design notes

Dark, editorial palette (near-black indigo base, amber for "verified",
teal for the AI layer, muted rust for "unverified") — built to feel like a
trustworthy wire service, not a generic SaaS card kit. Fraunces for display
type (the "Campus Truth" wordmark and headlines), Manrope for UI text.

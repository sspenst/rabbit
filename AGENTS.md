# Rabbit Project Overview

## What This Project Does
Rabbit is a Spotify discovery web app built with Next.js. It helps users find music similar to a selected track by using Spotify audio features (tempo, loudness, danceability, energy, instrumentalness, valence) as recommendation controls.

The app focuses on fast exploration:
- Pick a seed track (from search results or your liked songs).
- Preview tracks directly in-app (when Spotify preview audio exists).
- Adjust audio-feature direction (up/down/neutral).
- Generate related recommendations.
- Save or remove tracks from Spotify Liked Songs.

## Current Capabilities
- Spotify OAuth login on `/app` (scopes: `user-library-read`, `user-library-modify`).
- Search Spotify tracks with pagination (`More` button).
- Default browse mode that loads the user’s saved tracks when search is empty.
- Track enrichment pipeline that fetches:
  - Audio features for each track.
  - Whether each track is already in the user’s Liked Songs.
- In-app track preview playback with:
  - Play/pause on row click.
  - Keyboard spacebar toggle for current preview.
  - Media Session metadata + play/pause action handlers.
- Recommendation flow driven by seed track + audio-feature constraints:
  - Uses seed track plus up to 4 seed artists.
  - Maps controls to Spotify recommendation params (`min_*`, `max_*`, `target_*`).
  - Supports deep links via URL query params (e.g. `/app?id=...&tempo=up`).
- Liked Songs management:
  - Add/remove track from Spotify library.
  - UI state updates immediately after API response.
  - Toast notifications for save/remove actions.
- Track item UX:
  - Explicit-content badge.
  - Duration display.
  - Album art modal.
  - Warning state for tracks without preview audio.
  - “Open in Spotify” external link.
- Global app UX:
  - Light/dark/system theme support.
  - Header with help modal, Spotify shortcut, and user profile menu.
  - Footer with legal pages (End User Agreement, Privacy Policy).
  - Skeleton loaders while fetching.
  - Landing page with themed demo media and CTA.
- Observability + production readiness:
  - Sentry configured for client, server, and edge runtimes.
  - Sentry capture in custom `_error` page.
  - PWA manifest and icons.

## Tech Stack
- Next.js (Pages Router) + React + TypeScript
- Tailwind CSS v4
- `@sspenst/spotify-web-api` for Spotify Web API + auth
- Headless UI + Heroicons/Lucide
- Sentry (`@sentry/nextjs`)

## Current Constraints / Gaps
- No automated test suite is present in the repository.
- No backend database; state is client-side + Spotify API responses.
- Playback is limited to Spotify preview URLs (tracks without previews cannot be played in-app).
- App behavior depends on successful Spotify authorization and API availability.

## Local Development
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Run production build locally: `npm run start`

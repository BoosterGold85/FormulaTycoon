# Formula Tycoon

A mobile racing-team management game built with Expo / React Native and TypeScript.
The current build is the **Living Headquarters** vertical slice: a miniature isometric
team HQ where staff arrive for the day, walk to their assigned workstations and get to work.

## What is here

- Isometric HQ diorama drawn with plain React Native views (no 3D engine, no SVG dependency):
  main workshop with two car bays, aero & design, strategy, driver simulator,
  parts & manufacturing, and logistics with a transporter outside
- 8 staff with persistent station assignments and readable states (IDLE → WALKING → WORKING)
- Deterministic waypoint movement over a small navigation graph (no teleporting, no cutting through furniture)
- Tap a worker for an info card; tap a department floor or sign for a department card; tap outside to dismiss
- Top HUD (placeholder team/day/next event) and bottom navigation (HQ, DRIVERS and a limited TEAM comparison are live; RACE/HISTORY remain placeholders)
- "New day" button replays the morning arrival

## Architecture

```
src/game/                    data: models, HQ layout (departments, stations, nav graph, props), starting staff
src/simulation/headquarters/  headless, deterministic HQ rules: worker creation, assignment, routing, clock tick
src/game/development/        car development data: 8 FIA upgrade areas, regulations, calendar, rival teams
src/simulation/development/  headless, seeded car development engine (see docs/DEVELOPMENT_ENGINE.md)
src/simulation/__tests__/     Jest tests for the simulation (no rendering)
src/ui/                      rendering only: isometric projection, diorama shapes, worker sprites, HUD, cards
```

The simulation owns worker state, assignments and positions. `advanceHeadquarters(state, layout, dtMs)`
is a pure function, so it can run headlessly (see `runHeadquarters`). The UI drives the clock in fixed
50 ms steps, re-renders only when a worker's state/route/assignment changes, and replays the
simulation's planned route with native-driver animations for smooth movement.

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm test            # jest (jest-expo preset)
npm run build:web   # static web build (Cloudflare Pages)
```

## Play-test on your phone (no computer needed)

### Cloudflare Workers preview (the current feature-branch setup)

Use `feature/milestone-b-driver-world` for the B/B.1 test build. In the existing Worker's
**Settings → Build → Branch control**, enable preview builds. Keep `main` as the production
branch. Keep the preview command as `npx wrangler preview`.

The existing Worker is `formulatycoon` (as identified by the supplied branch preview URL).
The repository's `wrangler.json` supplies the required `previews` block, serves only Expo's
`dist/` static export, and runs `npm run build:web` through Wrangler's custom build hook.
The dashboard build command can stay empty for this setup; the export runs inside the preview
command. If the dashboard already runs `npm run build:web`, it is harmless but builds twice.
No custom Worker script, storage bindings or production routes are required.

After a successful preview deployment, open the **Preview URL** printed in Cloudflare's build
log. On iPhone, open it in Safari, then Share → **Add to Home Screen**. A GitHub branch link
opens source code; Cloudflare's Preview URL opens the game. Wrangler 4.135.0 or newer is required
for Worker Previews (the reported build used 4.155.0).

### Existing Cloudflare Pages projects

Pages uses build command `npm run build:web` and output directory `dist`; it does not run
`wrangler preview`. For testing the feature branch, enable/select its Pages preview deployment.
Keep the production branch as `main`. Open the preview's `*.pages.dev` URL on your phone.

### Local web preview

With the existing dependencies available, run `npm run web` for a development server or
`npm run build:web` for a static export in `dist/`.

## Run on Windows + iPhone

1. Install Node.js LTS if it is not installed.
2. Install **Expo Go** from the iPhone App Store.
3. Clone this repository.
4. Open PowerShell in this folder.
5. Run:

   ```powershell
   npm install
   npx expo start
   ```

6. Scan the QR code with the iPhone camera / Expo Go.

If the phone cannot see the development server over your local network, try:

```powershell
npx expo start --tunnel
```

## Why SDK 57?

As of October 2026, Expo is transitioning to SDK 58. Expo's current guidance says developers using Expo Go on a physical device should use SDK 57 during the transition. This starter therefore targets SDK 57 / React Native 0.86.

## Important

This is intentionally **not** the full game. Race simulation and a complete championship career are future milestones (see `docs/ROADMAP.md`).

## Architecture and development handoff

Start with [DEV_STATUS](docs/DEV_STATUS.md), [GAME_ARCHITECTURE](docs/GAME_ARCHITECTURE.md),
[GAME_LOOP](docs/GAME_LOOP.md), [SYSTEM_MAP](docs/SYSTEM_MAP.md) and
[MILESTONES](docs/MILESTONES.md). The App owns one composed universe; the HQ and development
engines remain independently headless. Versioned trusted checkpoints and a validated serialized save envelope/memory repository exist.
Real-device persistent storage, save/import UI and campaign UI are not implemented.
See [fictional brand policy](docs/BRAND_IDENTITY.md) for future canonical identity rules.

## Milestone B — driver world

New games use eleven canonical fictional teams, 22 fixed 2026 starters, ten prospects and eleven
reserve/free agents. DRIVERS shows grade-only profiles and team-owned scouting; TEAM compares
Wellington's two contracts; options appear only where the driver has one. No race simulation or overall driver score.
Validated save schema v3 migrates v1 ten-team data and v2 driver careers explicitly.
New 2026 games use the canonical performance/contract dataset; see [Player Manual](docs/PLAYER_MANUAL.md). Storage remains memory-only.
Read `docs/development-notes/MILESTONE-B.md` and `docs/DEV_STATUS.md` before extending it.

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
- Top HUD (placeholder team/day/next event) and bottom navigation (only HQ is live; other tabs say "Coming soon")
- "New day" button replays the morning arrival

## Architecture

```
src/game/                    data: models, HQ layout (departments, stations, nav graph, props), starting staff
src/simulation/headquarters/  headless, deterministic HQ rules: worker creation, assignment, routing, clock tick
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
npm run build:web   # static web build for GitHub Pages
```

## Play-test on your phone (no computer needed)

Every push to `main` publishes the web version to GitHub Pages:

**https://boostergold85.github.io/FormulaTycoon/**

Open it in Safari on the iPhone, then Share → **Add to Home Screen** to launch it full screen like an app.
The web build uses the same simulation and UI code as the native app (via react-native-web).

To build the web version locally: `npm run build:web` (output in `dist/`), or `npm run web` for a dev server.

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

This is intentionally **not** the full game. Race simulation, drivers, contracts and seasons are future milestones (see `docs/ROADMAP.md`).

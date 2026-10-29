# Headquarters graphics v2

Visual polish milestone on `feature/hq-graphics-v2`, based on
`feature/living-headquarters-v1` at `f5a37e4ce8bd698a4f3c79f8a71a193a86b1d91b`.

## Presentation changes

- Both cars now have stepped sidepods, narrow extended noses, exposed wheels and suspension,
  two-element wings, endplates, dark cockpits and raised halos. The original red livery stays.
- Workshop dressing adds spare wheels, a wing rack, pit trolley, parts tray, bay monitor,
  contact shadows and painted work-zone markings, with the central walkways kept clear.
- Aero gets a blueprint table and wing diagram; strategy gets a pulsing timing display;
  the simulator has a seat, wheel and track screen; manufacturing has a vise, parts bins,
  machine window and controls; logistics gets reinforced team cases and a freight dolly.
- Glass dividers, columns, garage shutter lines, a strip light and shaded surfaces add depth.
  The transporter has a navy team trailer, FT Racing branding and loading-ramp suggestion.
- Cosmetic worker variation is stable by identity: hair, skin, headsets, caps, overalls and
  high-visibility trim. Mechanics lean and use tools; fabrication has a bench/tool motion;
  logistics carries a box; typing and simulator arm motions retain distinct rhythms.
- HUD spacing, card borders and active navigation treatment are slightly refined.

## Architecture and performance

All changes are under `src/ui` plus this document. No simulation, assignment, navigation,
worker-state, roster, save, dependency manifest or lockfile changes. The same eight workers
arrive at the same assigned stations and remain working. No new management systems.

Props and workers share deterministic `x + y` depth bands. Moving sprites update their
anchor only when crossing a quarter-tile band; the costume is memoized separately and the
building stays static. This is coarse painter ordering, not per-pixel occlusion. Complex
intersections with large furniture may still need art-specific depth anchors later.

Dressing lives in a presentation-only module: it does not add navigation obstacles.
Animation uses existing React Native Animated APIs, opacity and transforms. One shared
opacity clock drives the timing lines, and worker loops reuse their existing clocks. Reduced
motion suppresses decorative loops without changing authoritative worker movement.
No new libraries, SVG framework, WebGL, 3D engine or texture pack.

More static View primitives and moving depth-band updates cost more than the original scene.
No native iPhone frame-rate, memory, battery or GPU profiling was possible. Smooth performance
on actual iPhone hardware is not claimed; that is the next verification target.

## Validation

Executed in the cloud:

- `npm ci --cache /workspace/.npm-cache --no-audit --no-fund`: PASS, 736 packages installed
  locally with user approval; no global tools or user-PC changes.
- `npm run typecheck`: PASS.
- `npm test -- --runInBand`: PASS, all 18 existing simulation tests.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: PASS. Telemetry is disabled because this cloud
  machine's default home directory is not writable. A harmless NO_COLOR/FORCE_COLOR warning
  was emitted by the build tools.
- Chromium, 390 x 844 viewport, 2x pixel density: captured and visually inspected initial
  arrival, mid-walk, all workers working, worker card, and department card. The final smoke
  run reported zero page errors, eight worker buttons and no horizontal overflow.
- Actual browser clicks opened the James Walker card and Main Workshop card, dismissed both,
  exercised TEAM's Coming soon placeholder, and reset the day to 0/8 with NEW DAY.
- Reduced-motion browser check: PASS, eight workers settled, NEW DAY reset to 0/8,
  then all eight settled again with zero page errors.
- `git diff --check`: PASS. `src/simulation`, `src/game`, `package.json` and the lockfile
  match the base commit.

Render artifacts and logs for this environment are in `/workspace/artifacts/hq-graphics-v2/`:
`01-arrival.png`, `02-mid-walk.png`, `03-working.png`, `04-worker-card.png`,
`05-department-card.png`, `browser-check.log`, `typecheck.log`, `tests.log`, `build-web.log`.
These are browser renders, not native iPhone screenshots. Safari, Expo Go, device safe areas,
native animation appearance and physical-device performance remain unverified.

## Changed files

- `src/ui/scene/propArt.ts`: upgraded existing furniture, cars and transporter recipes.
- `src/ui/scene/dressing.ts`: visual-only props, architectural parts and floor markings.
- `src/ui/scene/AmbientDetails.tsx`: timing, blueprint and simulator screen artwork.
- `src/ui/scene/depth.ts`: shared depth-band calculation.
- `src/ui/scene/HeadquartersBuilding.tsx`: static floor, shadows, architecture and sorted props.
- `src/ui/scene/HeadquartersScene.tsx`: shared object/worker depth space and motion preference.
- `src/ui/components/WorkerSprite.tsx`: animated anchor depth and work-pose interpolation.
- `src/ui/components/WorkerFigure.tsx`: memoized worker costume and pose rendering.
- `src/ui/components/workerAppearance.ts`: stable, cosmetic-only variation.
- `src/ui/hooks/useReducedMotion.ts`: platform accessibility motion preference.
- `src/ui/components/GameHud.tsx`: spacing, typography and border refinement.
- `src/ui/components/BottomNav.tsx`: active tab treatment.
- `docs/HQ-GRAPHICS-V2.md`: milestone scope, validation and limitations.

Recommended next visual improvement: after profiling on an actual iPhone, refine rounded tyre
and wheel-hub silhouettes and tune foreground furniture depth anchors. Keep the miniature
2D direction and the existing gameplay intact.

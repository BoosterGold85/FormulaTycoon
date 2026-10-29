# Development status

## Milestone

A — Foundation integration / Game Universe. Branch `feature/game-universe-foundation`,
based on main `333eec4`. Read this file at the start of every milestone. Preserve the six
status headings below in future updates; do not rely on chat history.

## COMPLETED

- Audit of content/domain types, HQ routing/assignment/ticking, development planning/outcomes/
  reliability/budgets/season transitions, RNG, App/HUD/navigation, tests and export setup.
- One plain-data `GameUniverse` composes existing HQ and development states. Existing APIs,
  part models, roster, routes, assignment and worker states remain intact.
- Pure commands for HQ ticking/restart, weekly development and guarded season transition.
  Separate clocks: a rendered frame or NEW DAY does not advance a campaign week.
- App-lifetime universe hook above HQ presentation. Latest ref is authoritative; visible state
  is throttled as before. Week commands and checkpoint capture read latest state.
- Shared keyed RNG factory with unchanged development imports/keys/hash and standalone engines.
- Version 1 trusted checkpoint contract: deep-copy capture/restore, explicit schema/content
  mismatch rejection, seed consistency and platform storage interface.
- Architecture, player loop, communication map, A–K milestone gates and agent handoff rules.
- No drivers, racing, new screens, revised HQ art, dependencies or economy rules added.

## IN PROGRESS

None within Milestone A at handoff. No Milestone B implementation started.
The product remains an HQ vertical slice with a headless development engine, not a campaign.

## TESTED

- `npm run typecheck`: PASS.
- `npm test -- --runInBand`: PASS, 44 tests in 3 suites (36 existing + 8 foundation tests).
- Foundation tests cover exact engine composition/equivalence, 600 HQ steps, 52 development
  weeks, clock isolation, NEW DAY preserving development, resumed mid-route/project checkpoints,
  snapshot aliasing, version/content/seed guards, season/standings guards and RNG isolation.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: PASS, static export only.
- Chromium at 390 × 844: PASS, eight workers reached WORKING; worker/department cards,
  dismissal, placeholder TEAM navigation and NEW DAY reset passed. Zero page errors, eight
  worker buttons and no horizontal overflow. Render/log artifacts: `/workspace/artifacts/milestone-a/`.
- No additional installations; existing approved local dependencies reused.

## NOT VERIFIED

- Native iPhone/Safari/Expo Go, physical-device frame rate, memory, battery and safe areas.
- Cloudflare deployment; exporting a bundle is not a deployment.
- Arbitrary save files/import validation, disk/browser storage, autosave, atomic writes,
  backups or real prior-version migrations (no earlier released save schema exists).
- Drivers/contracts/scouting/track profiles/qualifying/races/standings/history: design only.
- 10/100-season campaign simulation and balance: cannot validate absent gameplay systems.

## KNOWN ISSUES

- `GameSave` is a TRUSTED in-memory contract, not a safe user-file decoder. Future storage
  adapters must validate unknown input and semantic invariants before restore. Never cast an
  arbitrary JSON file to GameSave. Current JSON cloning assumes plain finite valid domain data.
- Content version is a manually maintained identifier, not an automatic hash. Future content
  must retain old definitions or explicitly migrate saves. Incompatible versions are refused.
- No player team is selected (null); ten AI teams are preserved. HUD Monday/Your Team/Preseason
  are placeholders. NEW DAY is still a scene replay and no calendar UI is exposed.
- Factory workers do not currently supply development staff quality; facilities/staff ratings
  are independent abstract values. Do not invent an adapter bonus before designing that slice.
- `computeCarProfile.pace` is a development planning proxy; future racing must use track-fit
  characteristics, driver input and explainable events, not simply rank that scalar.
- Calendar and season/week remain in development until the weekend/calendar slice migrates
  ownership. Submissions grow across seasons; historical pruning/archiving policy is future work.
- Legacy standalone engines assume valid caller data; comprehensive definition validation is
  not added in A. New universe commands add guards without rewriting those engines.
- Keyed RNG preserves delimiter hashing for compatibility; use stable key tokens without `|`.
  New stochastic systems need namespaces/draw IDs; hidden-information selectors need design.
- Save shape/schema validation, richer entity reference validation and content migration tooling
  remain required before real saved campaigns. No general event bus or new global framework added.

## NEXT MILESTONE

B — fictional driver generation, canonical team organization, contracts and scouting foundation.
Begin with its design/acceptance gates in MILESTONES.md. Specify player-team selection, stable
person/team IDs, imperfect scouting vs hidden truth, controlled RNG and checkpoint evolution.
Implement one testable slice at a time; do not roll out empty screens. Durable validated saves
must be implemented before users depend on campaigns (no later than G).

## Foundation decision

Yes: subsequent slices can extend a shared, headless state owner and keep the working engines.
This reduces the likely need for a foundational rewrite; it cannot guarantee no future migrations
or refactoring. Persistent storage, race calendar ownership and long-run balance are explicit
future work, not features certified by A.

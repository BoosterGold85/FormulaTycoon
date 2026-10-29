# Development status

## Milestone

MILESTONE A — FOUNDATION INTEGRATION: COMPLETE (`a41f38a`).
MILESTONE A.1 — FOUNDATION HARDENING: COMPLETE (see branch history for the A.1 commit).
MILESTONE B — NOT STARTED.

Branch: `feature/game-universe-foundation`, originally based on main `333eec4`.
Read this file plus GAME_ARCHITECTURE.md and MILESTONES.md at every milestone. Preserve the
COMPLETED / IN PROGRESS / TESTED / NOT VERIFIED / KNOWN ISSUES / NEXT MILESTONE headings.

## COMPLETED

A preserved the independent HQ/development engines, composed one GameUniverse at App lifetime,
separated factory animation time from development weeks, retained keyed RNG outcomes and
introduced trusted checkpoints. Architecture, loop, system map and milestone gates were created.

A.1 adds:

- Durable serialized v1 envelope with saveVersion/gameVersion/saveId/createdAt/updatedAt/universe.
  Caller injects metadata; no unseeded randomness or wall clock in simulation.
- Unknown JSON -> migration dispatch -> complete nested structural validation plus references/
  consistency -> detached state. No partial state or fallback new game is exposed on failure.
- Controlled INVALID_JSON / INVALID_DATA / UNSUPPORTED_VERSION / STORAGE_ERROR results.
- SaveRepository and raw string SaveStorage write/read/list/delete interface. MemorySaveStorage
  works on web/native-compatible JS but is VOLATILE, not device persistence.
- Deterministic save/load continuation; seeds, HQ clocks/routes/assignments, development clocks,
  parts/projects/budgets and upgrade history are preserved.
- Permanent facility/organization contracts and seven game pillars. Every major facility upgrade
  must affect simulation AND visible HQ; lifecycle PLANNED -> UNDER_CONSTRUCTION -> COMMISSIONING
  -> ACTIVE. Costs/time/upkeep/capacity/disruption remain future gameplay.
- BRAND_IDENTITY.md: original fictional brands, proposed canonical registry, eleven working team
  identities/archetypes, fictional sponsor candidates/model, other-brand policy and stable IDs.
  Existing ten-team runtime data is NOT renamed/rebalanced/expanded without explicit migration.
- No new gameplay, UI, simulation rules, native storage dependency, cloud saving or authentication.

## IN PROGRESS

None within A.1 at handoff. No Milestone B implementation begun. The app is still an HQ slice
with headless development, not a playable campaign or a shipped save/load UI.

## TESTED

- `npm run typecheck`: PASS.
- `npm test -- --runInBand`: PASS, 76 tests in 4 suites (44 existing + 32 A.1 cases).
  Includes all HQ/development/foundation and envelope/repository/migration/invalid-data tests.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: PASS, static export only. Build emits a harmless
  NO_COLOR/FORCE_COLOR warning. No new dependency installations.
- A.1 tests cover meaningful mid-route/project/history round trip, version recording/rejection,
  v1 identity dispatch, repeated save/load deterministic continuation, all 53 weekly snapshots
  from preseason through year end, malformed metadata/fields/numbers/IDs/assignments/routes,
  budget and chronology checks, slot mismatch, invalid writes preserving valid slots, list/
  overwrite/delete/missing slots, adapter failures, aliasing and invalid slot IDs.
- A browser interaction check at 390 × 844 previously passed during A: eight working workers,
  cards/dismissal, placeholder TEAM navigation, NEW DAY, zero page errors/overflow. No UI or
  simulation code changed in A.1; this is prior evidence, not a new native-device test.
- Logs: `/workspace/artifacts/milestone-a1/`. No deployment performed.

## NOT VERIFIED

- Native iPhone/Safari/Expo Go behavior, performance, memory/battery or safe areas.
- Real-device durable writes, app-restart recovery, browser/native storage quotas and backup
  restoration. The memory adapter loses everything when its instance/process ends.
- Cloudflare deployment. Build/export success is not deployment.
- Prior released-envelope migration transforms: v1 is the first format. Only v1 identity and
  unsupported/malformed versions are testable now; future version transforms require fixtures.
- Drivers, contracts, scouting, facilities gameplay, races, real finances, sponsors and careers.
- 10/100-season campaign balance; no such campaign engine exists.

## KNOWN ISSUES

- Real-device storage adapter, atomic writes/backups, import/export UI, autosave and explicit
  application load/replacement are the next persistence infrastructure work. Do not advertise
  persistent saving based on this volatile adapter or export the trusted checkpoint as a file.
- `gameSave.ts` remains trusted-only for A compatibility. Its storage interface is deprecated;
  all new external inputs use SaveRepository/deserializeSave. V1 envelope is a separate format,
  not an invented migration from an unreleased checkpoint. No silent fallback on load errors.
- Definition version is manual, not a hash. New content/rules require retained definitions or
  explicit migrations. Strict extra-field rejection prevents silently losing unknown data.
- Validation is structural/state consistency, not tamper-proof authenticity of every historical
  outcome. New universe domains must extend validators, reference checks and migrations.
- Legacy team IDs, development facilities/staff ratings and 24-event calendar remain fixtures.
  Adopting eleven proposed brands requires registry/mapping/new-team initialization/allowance
  balance/content version and save fixtures. Fictional candidate names still need product review.
- Facility state will later own capability and visible variant IDs; existing HQ decoration and
  abstract facility ratings are not canonical construction state. Avoid duplicate bonuses/costs.
- Player selection is null; ten teams are AI; HUD values remain placeholders. NEW DAY replays
  arrivals rather than progressing the campaign. No player takeover is silently introduced.
- Calendar season/week remain in development until a later migration. Submissions grow across
  years; archival/pruning policy is future work. Planning pace is not a universal race rating.
- RNG uses stable namespace/event/entity keys, no saved live generator objects. Keep legacy key
  hashing/tokens (no `|` in new tokens) until a versioned encoding replaces it.

## NEXT MILESTONE

B remains NOT STARTED. After reviewing/merging A+A.1, B can design fictional drivers, canonical
organizations, contracts and imperfect scouting, with original IDs and checkpoint evolution.
Real-device persistence/recovery is the next infrastructure step before campaigns depend on saves.
Facilities remains the major I-F milestone, with simulation and visual acceptance gates, not
optional decoration. Do not implement any of those systems as part of A.1.

## Merge recommendation

Ready to merge A+A.1 as a foundation, conditional on the checks above. This establishes the
format/validation/system boundaries; it does not certify durable native saving, future schema
migrations or decades of campaign balance. No push or merge is authorized by this hardening task.

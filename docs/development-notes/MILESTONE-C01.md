# Milestone C0.1 — Single campaign clock

C0 (`e6a479c`) pushed and merged into main at `a057daf`; merged main passed 220 tests,
TypeScript and web export before this branch. Art branch remains separate at `1cfb07d`.

## Ownership / scope before implementation

1. CampaignTime owns plain Gregorian date arithmetic/derived temporal views; GameUniverse owns
   the one persisted currentDate. Development and drivers hold clock-free persistent state.
2. External schema4 adds root currentDate, removes subsystem current-time mirrors and replaces
   option deadlines with decisionDate. Historical observations/results/terms retain their dates.
3. Existing balanced development kernel consumes ephemeral date-derived views. UI requests
   formatted date/context; HQ animation time remains independent. V1/V2→V3→V4 source validation.
4. Risks: timezone shifts, leap years, conflating ISO/completed weeks, losing week52/next-week0,
   skipping work/deadlines across jumps, double winter resets, altered RNG IDs and fixture drift.
5. Proof: pure date/zone tests, one-clock serialization, immutable historical inputs, migration
   preservation and old-kernel continuation, all four date deadlines, HQ separation, full suite,
   types/export and mobile navigation/display smoke.

## Explicit compatibility mapping (not an event calendar)

Old week is completed development steps, 0..52; season1 is 2026. There was no ISO-week or date
basis. Map (seasonIndex,week) to March2 of year(2025+seasonIndex) plus 7*week days.
New careers start 2026-03-02. V3 fixture season1/week16 maps 2026-06-22.
Week52 maps 2027-03-01; next season week0 maps 2027-03-02, so both old states remain distinct.
Annual March2 is a provisional lifecycle boundary, not the future race calendar/offseason engine;
January/February still derive the preceding championship year. Week stays capped at52 in the
last one/two days before the next annual anchor. Explicit existing standings/reset command is
required to cross a season boundary; normal jumps cannot invent results or silently reset teams.

Options map their existing deadline season/week to the same exact day: Ortez/Bearford 2026-12-07;
Harlton/Botten 2027-12-07. The former is Monday; the latter Tuesday under this explicit non-ISO
annual mapping. Both preserve the exact prototype week40 position; no ISO/Monday assumption
is added for future seasons. Before/on/after are date comparisons, with decisions allowed on
the date and lapsed the following day. Later event-calendar phase boundaries need an explicit
versioned policy change, not a quiet reinterpretation of these saved explicit deadlines.

## Date ownership and advancement

`CampaignDate` is a branded canonical YYYY-MM-DD string, validated on input. `campaignTime/date.ts`
contains integer Gregorian arithmetic: parsing, formatting, comparison, addition, elapsed days,
weekday and inclusive deadline evaluation. No timestamps, Date/Intl, locale parsing or device
clock enter gameplay. Supported pure date range is 0001–9999; campaign context starts in 2026.

Root `GameUniverse.currentDate` is readonly in its type. `DevelopmentState` and `DriverWorld`
contain no current season/week/date. `developmentView` projects date-derived temporal context
into the unchanged balanced kernel and immediately strips its current clocks from the output.
Historical submissions, project IDs/startedWeek, scouting report stamps and contract term seasons
remain intact. The old driver-calendar synchronization adapter is removed.

`advanceCampaignTo` / `advanceCampaignByDays` share one internal path. It rejects backward dates,
returns identity for the same date, visits every crossed date in order, runs weekly development
only on a crossed completed-week boundary and refreshes date deadlines/contract expiry each day.
No extra RNG, balance or scheduling rules were introduced. `advanceUniverseWeek` is a compatibility
command deriving the next work boundary; it stores no separate progress clock. The existing
`startUniverseSeason` accepts actual full standings and goes through the same path for the reset.
Ordinary date jumps cannot silently fabricate standings or cross a lifecycle boundary.

Future scheduled completions/deadlines join the ordered interval processing inside `advanceTo`,
before exposing the advanced universe. A future optimized jump must preserve event order and
exactly-once work; do not replace the date directly. No general event scheduler was built.
Race weekends, practice/qualifying/races, travel, scouting duration, development/manufacturing,
facility work, staff/sponsor contracts, finance, preseason/testing/offseason and world events must
all use this owner. Actual calendar content/phase queries and event-aware player UX belong to C
and later milestones, not this compatibility migration.

`calendarPolicyV4.ts` explicitly names the released March2/completed-week interpretation. Current
systems share it; V4 persistence imports it explicitly. Keep it unchanged when introducing later
live calendars. Any changed phase interpretation needs an explicit versioned compatibility
strategy, preserving historical V4 acceptance and saved decision dates. This is not a populated
2026 championship calendar and does not assert a verified round count.

## Exact canonical option dates

| Driver | Option season | Decision date | Weekday |
|---|---:|---|---|
| Lewis Harlton | 2028 | 2027-12-07 | Tuesday |
| Esteban Ortez | 2027 | 2026-12-07 | Monday |
| Valtteri Botten | 2028 | 2027-12-07 | Tuesday |
| Oliver Bearford | 2027 | 2026-12-07 | Monday |

The original source supplies neither decision date nor option salary. Existing prototype timing
and equal-to-guaranteed-year salary remain; source terms/dataset were not edited. Old W40 decisions
are still allowed and W41 observations lapsed. With daily resolution, an unexercised option now
lapses on the first date after decisionDate, rather than waiting for a weekly command to run.
Shared `deadlinePassed` is used by decisions, refresh and V4 validation; broader M5 overlap cleanup
is deliberately deferred. Ownership, idempotent exercise and seat/driver booking conflicts remain.

## Persistence and determinism

External saveVersion is 4; definition identity is `campaign-date-2026-v4`. V1/V2 source validates
against its frozen contract and transforms to frozen V3. Every old path validates that V3 boundary
before `migrateV3Universe` derives root date, strips subsystem clocks, translates option deadlines
and sets the new definition identity. Public import validates final V4 output. V4 roundtrips
strictly and future V5 is rejected. Metadata is preserved; the migration clones input.

V1/V2/V3 JSON contracts and fixtures are byte-identical. Historical validator edits only update
type imports to preserved old schema shapes. V4 snapshot and meaningful migrated fixture are new
files. The trusted internal in-memory checkpoint is version2 because its shape also changed;
it is not an external import path. Device storage remains volatile and has no player save UI.

Migration retains pending work, completed history, abilities/source snapshots, contracts,
exercised options, scouting knowledge, HQ worker routes/positions, identities and project counters.
A test-only pre-calendar oracle compares every remaining week after the meaningful V3 fixture,
the season reset and 12 additional weeks: development/RNG results match the unchanged balanced
kernel. Jumped versus daily advancement is also equal. No wall-clock randomness is introduced.

## UI and player manual

The DAY chip now shows the derived weekday with a small formatted date inside the existing
three-chip HUD. Driver header/disclosure queries use root date; option text shows ISO decision
date. No calendar screen, smart-advance controls or HUD redesign. The NEXT EVENT chip stays an
explicit placeholder. HQ animation milliseconds and NEW DAY replay remain independent; neither
changes currentDate, development, contracts or scouting. Player manual's Time & Calendar section
explains the start date, replay distinction and future event advancement without save internals.

## Actual validation commands and results

On merged C0 main (`a057daf`), before branch creation:

- `npm test -- --runInBand`: PASS220/eight suites.
- `npm run typecheck`: PASS.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: PASS.

On C0.1 after final code changes:

- `npm test -- --runInBand`: **PASS261/ten suites**, 0 failed, 0 skipped.
- `npm run typecheck`: **PASS**.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: **PASS**, 627KB web JS bundle.
- `node scripts/check-milestone-c01.cjs`: **PASS**, served local export, existing
  Playwright/Chromium, 390×844 touch viewport. Requires an existing browser installation; no
  packages were installed. Optional `FORMULA_PREVIEW_URL`/`FORMULA_ARTIFACT_DIR` override defaults.
- `sha256sum --check /workspace/artifacts/milestone-c01/historical-hashes.txt`: all seven original
  V1/V2/V3 contracts/initial payload/fixtures PASS.
- `git diff --check`: **PASS**.

Meaningful new clock tests include invalid dates, Gregorian/leap/boundary arithmetic, weekday,
formatting, elapsed days, four timezone subprocesses (Chicago/London/Tokyo/Sydney, Turkish locale),
root-only current clocks, serialized date retention, monotonic/no-op behavior, daily/jump parity,
week52 versus next week0, supplied-standings transition, contract expiry and HQ separation.
Migration tests cover all three sources, exact state/metadata preservation, conflicting old clocks,
deterministic continuation and meaningful V4 fixture reload. All four canonical options test
before/on/after, exercised retention, foreign ownership and future booking conflicts.

Browser checks cover HQ arrival/8-of-8, worker/department cards, New Day/date separation, Monday /
Mar2 display, grid22/prospects10/reserves11, TEAM2, detail opening position, six grades/source hiding,
all four option dates/foreign-action absence, canonical contract displays, retained scouting and
navigation. **Zero page errors; no horizontal overflow.** Ten PNGs plus logs are at
`/workspace/artifacts/milestone-c01/` (workspace artifacts, not a public deployment).

Nonblocking warnings: existing FORCE_COLOR/NO_COLOR interaction and npm update notices. No failing
tests or skipped suite cases in final validation. No installs, native launches or cloud deployment.

## Remaining limitations / recommendation

- Annual March2 and 52 completed weeks are a deliberately provisional, versioned compatibility
  policy. There is no full real 2026 registry, smart event advancement or actual offseason engine.
  Season crossings still need the existing full-standings command. Future C must review policy
  compatibility rather than silently reinterpret saved dates.
- Native iPhone/Safari/Expo Go, hardware performance/safe areas and remote Cloudflare runtime
  are unverified. Browser export success is not proof of those environments.
- Durable storage/restart recovery and player save/import controls remain unimplemented.
- Wellington's starting pair has no team option, so owner-controlled option UI cannot be exercised
  in the default live screen; domain action paths are tested, foreign displays verified in browser.
- Audit M1/M3/M6/M7/M8 and remaining low-priority findings remain scheduled. M5's broader overlap
  consolidation is deferred. C0's H1/M4 and C0.1's M2 are addressed. No unrelated cleanup/features.
- Balanced development math, RNG, canonical datasets/terms and HQ art/routes/assignments/timing
  remain unchanged. Separate art commit `1cfb07d` is preserved and unmerged.

**READY FOR MILESTONE C after C0.1 review/integration.** C0.1 is locally committed on its own
branch; not pushed/merged. Milestone C is NOT STARTED. Stop at this handoff.

## Files changed

53 files in this milestone (including this handoff):

- `AGENTS.md`
- `App.tsx`
- `README.md`
- `docs/DEVELOPMENT_GUARDRAILS.md`
- `docs/DEV_STATUS.md`
- `docs/GAME_ARCHITECTURE.md`
- `docs/GAME_LOOP.md`
- `docs/MILESTONES.md`
- `docs/PLAYER_MANUAL.md`
- `docs/SYSTEM_MAP.md`
- `docs/development-notes/MILESTONE-C01.md`
- `scripts/check-milestone-c01.cjs`
- `src/game/defaultGame.ts`
- `src/game/drivers/types.ts`
- `src/game/hudPlaceholders.ts`
- `src/persistence/__tests__/dateMigration.test.ts`
- `src/persistence/__tests__/fixtures/driver-world-v4.json`
- `src/persistence/__tests__/historicalContracts.test.ts`
- `src/persistence/alignmentMigration.ts`
- `src/persistence/contracts/README.md`
- `src/persistence/contracts/index.ts`
- `src/persistence/contracts/preCalendarDriverValidation.ts`
- `src/persistence/contracts/preCalendarRules.ts`
- `src/persistence/contracts/preCalendarTypes.ts`
- `src/persistence/contracts/preCalendarValidation.ts`
- `src/persistence/contracts/v4.json`
- `src/persistence/dateMigration.ts`
- `src/persistence/gameSave.ts`
- `src/persistence/historicalSaveValidation.ts`
- `src/persistence/saveEnvelope.ts`
- `src/persistence/teamMigration.ts`
- `src/persistence/universeValidation.ts`
- `src/simulation/__tests__/calendarReadiness.test.ts`
- `src/simulation/__tests__/campaignClock.test.ts`
- `src/simulation/__tests__/driverAlignment.test.ts`
- `src/simulation/__tests__/drivers.test.ts`
- `src/simulation/__tests__/universe.test.ts`
- `src/simulation/campaignTime/calendarPolicyV4.ts`
- `src/simulation/campaignTime/date.ts`
- `src/simulation/campaignTime/developmentView.ts`
- `src/simulation/campaignTime/index.ts`
- `src/simulation/development/types.ts`
- `src/simulation/drivers/carFit.ts`
- `src/simulation/drivers/contracts.ts`
- `src/simulation/drivers/selectors.ts`
- `src/simulation/drivers/world.ts`
- `src/simulation/universe/index.ts`
- `src/simulation/universe/types.ts`
- `src/testSupport/preCalendar.ts`
- `src/ui/DriversScreen.tsx`
- `src/ui/HeadquartersScreen.tsx`
- `src/ui/components/GameHud.tsx`
- `src/ui/hooks/useGameUniverse.ts`

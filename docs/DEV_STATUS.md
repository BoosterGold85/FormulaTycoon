# Development status

## Milestone

A + A.1 + permanent guardrails: COMPLETE, merged/pushed to main at `f2dab51` before B.
B — 2026 fictional driver world, contracts and scouting: COMPLETE on
`feature/milestone-b-driver-world` (see final commit in branch history).
C — track profiles: NOT STARTED.

Read AGENTS.md and the six required architecture/guardrail documents before further work.
Detailed assumptions, five ownership/state/interface/failure/test answers and the exact legacy
mapping are in `docs/development-notes/MILESTONE-B.md`.

## COMPLETED

- Eleven canonical fictional organizations in `game/brandRegistry.ts`, with differentiated
  organization traits, stable `team.*` IDs, names/colors/philosophies. Current starting world
  uses this registry; the old ten-team context is explicitly a frozen compatibility fixture.
- Fixed 2026 cast: 22 race drivers (two per team), ten core prospects, ten additional reserve/
  free-agent drivers. Names/profiles are fictional design data, not real stats or likenesses.
- Six internal bounded ability buckets -> centralized public letter grades/ranges/Unknown.
  No universal player-facing overall score. Age basis, stage, hidden growth/potential,
  personality/dynamics, traits, comfort/familiarity, markets and career-history structures.
- Contracts own seat/team assignments: guaranteed terms, salary and single performance-bonus
  obligations, fixed team-option deadlines/exercise/lapse, automatic expiry and overlap guards.
  Repeated option decisions/calendar updates do not duplicate changes. No payroll or bonuses paid.
- Observer-owned scouting precision/report dates, conservative uncertainty and free report-review
  action; established starters are high-confidence, prospects uncertain. Truth is not mutated.
- Technical/commercial contribution interfaces and coarse current-car compatibility read existing
  characteristics without changing driver ability or awarding development/sponsor/race effects.
- App-lifetime universe persists through HQ/DRIVERS/TEAM navigation. DRIVERS grid/detail/prospect/
  reserve views and limited TEAM pairing/option view consume disclosure selectors only.
- Durable format v2 validates DriverWorld and contract/knowledge references. V1 migration first
  validates old data, preserves earned HQ/development/history, maps team references, initializes
  Caldera and driver state. Pending opaque project IDs retain keyed RNG outcomes. No input reset.
- Frozen v1 fixture plus legacy regression suites retained; no dependencies installed/added.
- No racing, qualifying, track engine, points, sponsors, finances, staff/facility construction,
  full driver growth, retirement or offseason AI. Future careers are not scripted to reality.

## IN PROGRESS

None at milestone handoff. B branch awaits review; do not start C without explicit instruction.
Wellington is the initial player organization; a team chooser/hiring UI is outside this slice.

## TESTED

- `npm test -- --runInBand`: PASS, 100 tests in five suites (76 existing foundation + 24 B cases).
- `npm run typecheck`: PASS.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: PASS (static export, not deployment).
- Driver tests: 11/22/42 counts, two distinct seats per team, fixed cast across seeds, bounded
  profiles/traits/grades, no raw truth in disclosure, independent/narrowing scouting, guaranteed
  contract conflicts/invalid terms, option ownership/deadline/conflict/idempotence and option-year
  salary, expiry and save validation through three development years.
- Save tests: knowledge/contracts/stable IDs round trip, deterministic headless continuation,
  malformed new state rejected, explicit legacy mapping preserving pending projects/history,
  immutable source save, frozen foundation-v1 fixture migration and invalid legacy references.
- Chromium at 390 × 844: 22 grid, ten prospects, ten reserves, two player contracts; driver detail,
  report improvement and option exercise; back to HQ at 8/8, worker/department cards, NEW DAY.
  Zero page errors and no horizontal overflow. Screenshots/logs under `/workspace/artifacts/milestone-b/`.

## NOT VERIFIED

- Native iPhone/Safari/Expo Go, hardware frame rate, battery/memory, device safe areas.
- Cloudflare deployment; no B deployment or remote publication performed.
- Real-device durable save storage/restart recovery. Save FORMAT is serialized/validated;
  MemorySaveStorage is volatile. No load/import/export/autosave UI was added.
- Career balancing or future driver growth/retirement, actual race car-fit effects or salaries.
  Three development/calendar years in tests are NOT three racing championship seasons.

## KNOWN ISSUES

- Free scouting reviews are a V1 knowledge demonstration, not staff/time/budget gameplay.
  Knowledge precision derives conservative grade envelopes around fixed current truth; future
  changing abilities/evidence snapshots require an explicit model/schema evolution.
- Fixed starting contracts are deliberately fictional 2026–27 + 2028 team option (2027 W40).
  New domain signings currently support guaranteed terms only; starting options are exercisable.
  There is no negotiation, buyout, driver option, full hiring UI, agent or payroll simulation.
- Expiry leaves explicit seat vacancies; no invented offseason AI fills them. Driver grid screen
  shows the fixed 2026 starting cohort, not a future championship entry list. Full future roster/
  season-entry behavior belongs to later slices. A reserve with a future deal is available now.
- Ages display from ageAt2026; stage/abilities do not automatically develop/decline yet. Reputation
  summaries are fictional; history arrays are initially empty and no race results are fabricated.
- Current-car fit is a qualitative downforce/mechanical-grip proxy, not braking/oversteer simulation.
  Technical feedback and commercial interfaces have no hidden bonuses/payouts.
- Canonical profiles keep ten calibrated development profiles; Caldera/eleven-entry ATR have only
  basic initialization/regression evidence, not long-run competitive balance.
- Legacy v1 migration initializes the named driver world at the migrated calendar date, so old
  saves beyond starting contract terms can have vacancies. No retroactive driver history is invented.

## TECHNICAL DEBT / ARCHITECTURAL RISK

- Durable platform adapters, atomic slot writes/backups and explicit validated session replacement
  remain required before users depend on long careers. Keep trusted checkpoints out of file import.
- V2 validates exactly the fixed 42-person content cohort. Later procedural generation, new brands,
  real career statistics and facility/finance domains require schema/content migrations and fixtures.
- Legacy content remains for validation/tests only; do not resume ten-team new-game initialization.
  Opaque old project IDs are permitted on their mapped team, preserving pending upgrade RNG draws.
- Canonical names are owner-provided working identities, not legal clearance. Brand originality
  review and separate original visual identities remain before release; no real images/logos/assets.
- History growth, broad market/price balancing and 20/50/100-season performance remain future work.

## NEXT MILESTONE

C — data-driven track profiles and car-to-track performance translation. Not started. Do not begin
qualifying/racing/tyres/weather, full finance/sponsors or facilities gameplay without explicit scope.

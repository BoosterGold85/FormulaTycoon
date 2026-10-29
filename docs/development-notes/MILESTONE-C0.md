# Milestone C0 — Calendar readiness

Scope: audit H1, M2 preparation and M4 ownership only. C is not started. Graphics branch
`feature/hq-worker-art-polish` remains separately committed at `1cfb07d` and unmerged.
Audited B/B.1 (`6b7e894`) merged/pushed to main at `88ef974`; merged main passed 161 tests,
TypeScript and web export before this branch was created. No merge conflicts or test changes.

## Five implementation questions

1. Owners: persistence owns released validation contracts and migration stages; driver domain
   owns driver/car-fit composition; universe owns future campaign-clock coordination.
2. State: no new persistent fields, save version stays 3. Add historical content snapshots and
   meaningful v3 fixture, not a clock/track/calendar implementation.
3. Interfaces: released version -> immutable contract -> validation -> explicit v3 migration;
   UI -> domain car-fit selector -> qualitative label. No track argument or race modifier.
4. Risks: changing historical acceptance through shared content or formulas, migrations targeting
   live data, silently rewriting fixtures, altered car-fit/reserve behavior, unsynchronized clocks.
5. Proof: frozen v1/v2/v3 contracts and unchanged fixtures; live-content drift probes; deterministic
   migration/continuation; fit parity/ownership tests; clock adapter synchronization including
   rollover/no-op/HQ/scouting/contracts; full regressions/types/build and phone browser smoke.

## Campaign-clock design hold

Do not invent a final clock model. Keep the guarded current adapter during C0, inventory every
clock/deadline/consumer, and provide the exact v3->v4 ownership migration and owner decision.


## H1 — historical contract ownership

V1/v2/v3 definitions, calendar/parts/regulations/HQ/staff and driver identity/trait/bucket lists
are static JSON under `src/persistence/contracts/`. They are recursively frozen and independent
from all live arrays. Versioned pre-calendar validators retain existing bounds, progress and
contract semantics without importing live engine rules. Legacy aliases now point at snapshots.
Migration outputs are explicitly v3, including Caldera and the added reserve/source payload;
future live starting data cannot change old migrations. This is intentional historical data,
not an alternative mutable career owner. Existing v1/v2 fixture bytes were not edited.

`driver-world-v3.json` represents seed 17, development week 16, 45 actual upgrade submissions,
pending projects, HQ at 5500ms with workers walking, Cordeiro reports2/precision60 and Harlton's
exercised option. It preserves full source records, IDs, contracts and observer knowledge.
The v3 fixture is immutable test input, with byte hashes alongside v1/v2. It resumes identically.

No persistent structure changes; CURRENT_SAVE_VERSION stays 3. `assertHistoricalSave` is ready
as C's explicit source boundary for v3→v4. C must add real state, new validator/contract and
migration in the same slice; no fictitious v4 or empty calendar object was introduced here.

## M2 — complete clock inventory and decision boundary

| Location | Stored/read fact | Current consumer / adapter |
|---|---|---|
| `development.season`, `.week` (`development/types.ts`) | Current logical season index (1=2026), completed week0..52 | `development/world.ts` create/advance/rollover; AI planning and event matching |
| `drivers.season`, `.week` (`game/drivers/types.ts`) | Mirrored current absolute year/week | `drivers/contracts.ts` expiry/options/signing; `selectors.ts` age/term/current seat/report dates |
| `universe/index.ts` | No third stored clock | Weekly/season transitions map development to drivers via year=2025+season; end-week no-op stays identity |
| `teamMigration.ts`, `contracts/preCalendarRules.ts` | Legacy clock -> v3 driver calendar | Explicit year offset plus original week, lapsed/expired deals derived at import |
| `alignmentMigration.ts` | Existing v2 driver date | Initializes only added reserve at that date; incoming v2 clock equality is validated first |
| `contracts/preCalendarValidation.ts` / driver validator | Both current clocks in save | Requires exact year-offset/week equality; rejects skew before acceptance/migration |
| `development.projects[].startedWeek`, project ID `S<season>` | Project timestamps/RNG identity, not current clocks | `projects.ts` cost/work/sequence; `rivalAi.ts` budget pacing/lookahead; validation chronology |
| `development.submissions[].season/week/eventId` | Historical event timestamps | `outcomes.ts` stamped on introduction; `documents.ts` filters seasons/events; archive validation |
| `context.calendar[].week`, `regulations.seasonWeeks` | Existing event schedule/duration definitions | `world.ts` ready-upgrade introduction; `rivalAi.ts` lookahead/last-event; winter rollover guard |
| `contracts[].startSeason/endSeason`, option season/deadlineSeason/deadlineWeek | Deadlines/terms, not competing current clocks | Active employment, annual salary, overlap, option eligibility/lapse, expiration |
| `knowledge[team][driver].lastSeason/lastWeek` | Observation timestamps | `observeDriver` stamps current driver clock; UI shows last report; validation forbids future reports |
| `driver.history.seasons[].season` | Historical results year | Initially empty; past-only validation, DTO displays history count |
| `sourcePerformance.season`, `ageAt2026`, definition.driverEra | Historical reference/age basis | Fixed2026 source; age derives from current driver year, not another current clock |
| `DriversScreen.tsx` | Reads driver year | Header and selectors display age, years remaining, report/option dates; no independent clock state |
| `useGameUniverse.ts` | App owner dispatches explicit advanceWeek; current UI has no calendar advance | HQ frames/New Day/scout/option commands never advance development time |
| `hudPlaceholders.ts`, `useGameUniverse.dayId` | Monday/Preseason display placeholders and visual restart counter | No calendar authority; do not use them to derive campaign dates |
| `headquarters.timeMs`, workers.idleUntilMs/start delays; UI wall time | Independent factory animation clock | HQ walking/arrival scheduling only; it must not become the campaign clock |
| save envelope/checkpoints/repository | Persists both current clocks and dated facts today | v3 strict synchronization; createdAt/updatedAt are storage metadata, not campaign dates |

**Current state:** two stored representations remain temporarily, with development as the advance
source and drivers as an adapter mirror. C0 does not claim this is a final single-clock solution.
New tests cover every weekly step, W40/W41 lapse, season-end no-op, two rollovers, divergent-save
rejection, and no advancement by HQ/restart/scouting/options. No new clock field/API is invented.

**Owner decision required before C:** approve an actual calendar-date model (including campaign
start date and how preseason/week0, weeks, season boundaries and offseason map to dates), or
approve a logical season/week/day model with an explicit mapping to display dates. Do not
assume ISO weeks, a Jan1 start or fixed 52-week date years from today's development fixture.

**Recommended ownership, independent of that choice:** GameUniverse owns the sole persisted
CampaignTime; one domain transition advances it. Engines query derived development/contract
views from that owner. Preserve independent headless engines with explicit time inputs or
non-persisted compatibility views, not a second clock serialized under development/drivers.
All future facilities/scouting/travel/session/sponsor/staff deadlines query the same owner.
HQ milliseconds remain independent visual time. UI consumes a campaign display selector.

**Exact v3→v4 plan once approved:**
1. Validate raw v3 against its immutable contract, including existing clock agreement. Reject skew;
   do not pick one conflicting value or infer lost history.
2. Map validated (development season, completed week) to the approved canonical time model.
   Preserve year offset, preseason semantics and the approved week/date mapping explicitly.
3. Persist one root campaign time. Remove current season/week mirrors from saved development/
   drivers; pass derived views to their rules. Keep deadlines/history timestamps as facts.
4. Route weekly/rollover commands and observation/contract timestamping through that owner.
   Preserve all seed/RNG keys, project IDs, pending work, source metadata and clock-independent HQ.
5. Freeze v3 (already done), add v4 contract/validator/fixture and migration dispatch; revalidate
   transformed output. Keep deterministic continuation; define any intentional new calendar
   behavior in C's approved spec instead of silently changing old keyed outcomes.
6. Test that only one current clock is persisted; all UI/engines/deadlines derive from it, invalid
   dates/offsets fail, and old v1/v2→v3→v4 paths remain safe and input-immutable.

C remains **NOT READY** until this time-model decision is approved and the ownership migration
is included before track/calendar content. C0's allowed architecture-plan boundary is complete.

## M4 — driver/car-fit selector

`selectDriverCarFit(universe, definition, driverId)` owns employment lookup, construction of the
car profile and compatibility evaluation. Screen requests only the qualitative label/null.
The unused DTO `fit` placeholder is removed. A small shared current-employment selector reuses
existing race/reserve lookup without broad contract-rule refactoring. No track/event argument,
car/track fit, pace modifier or threshold change. All 43 initial drivers match the old screen's
calculation deterministically, including the existing reserve-affiliation behavior (L9 deferred).

## Deferred audit register

| Finding | C0 outcome / due gate |
|---|---|
| H1 | Addressed: independent immutable contracts, validation semantics, migration targets and v3 fixture |
| M1 | Deferred: seeded imperfect scouting estimator before scouting expansion |
| M2 | Guarded adapter retained; exact single-owner v4 plan awaits time-model approval before C content |
| M3 | Deferred: control derived from playerTeamId before team chooser/career setup |
| M4 | Addressed: domain selector and dead-fit removal |
| M5 | Deferred: central deadline/overlap rules before contracts/offseason; no broad refactor |
| M6 | Deferred: current-role grouping before multi-season careers/offseason |
| M7 | Deferred: measure/archive development history by Championship/History G |
| M8 | Deferred: originality/source rights review before public/commercial release; content untouched |
| L1–L10 | Remain scoped debt; dead fit and directly touched stale milestone/docs corrected only |

No manual expansion: no new player mechanic or changed fit behavior. No graphics merged.


## Final validation / handoff

- Merged main `88ef974`: tests161/6 suites, TypeScript and web export PASS before C0.
- C0: `npm test -- --runInBand` PASS220/8 suites; `npm run typecheck` PASS;
  `EXPO_NO_TELEMETRY=1 npm run build:web` PASS (621KB JS). No dependency installation.
- `node scripts/check-milestone-c0.cjs` PASS against a locally served export, Chromium390×844.
  Set FORMULA_PREVIEW_URL and FORMULA_ARTIFACT_DIR to override server/artifacts. Existing browser
  tools are required; the script never installs them. HQ/cards/New Day/repeated8/8, Drivers22,
  six grades/domain car fit, prospects10/scouting, reserves11, TEAM2, all four option displays,
  ownership restriction, navigation and placeholder RACE pass; no page errors/overflow.
- Original v1/v2 fixture SHA checks and `git diff --check` PASS. No failed/skipped final tests.
- Artifacts under `/workspace/artifacts/milestone-c0/`, including browser PNGs and main validation.
  Browser script is checked in for review/reproduction, rather than an ephemeral-only reference.
- Not verified: native iPhone/Safari/Expo Go, device performance, Cloudflare remote deployment,
  durable storage/recovery, future actual clock/date migration and campaign balance.
- Player manual unchanged because no mechanic or fit behavior changed. No tracks, real2026
  calendar, qualifying/racing, calendar fields, speculative savev4 or unrelated debt cleanup.
- Recommendation: **NOT READY FOR MILESTONE C** until the owner approves the explicit time-model
  decision above and C implements the single-owner migration before its content. Stop here.

## Delivery file manifest

- `AGENTS.md`
- `docs/DEVELOPMENT_GUARDRAILS.md`
- `docs/DEV_STATUS.md`
- `docs/GAME_ARCHITECTURE.md`
- `docs/MILESTONES.md`
- `docs/SYSTEM_MAP.md`
- `docs/development-notes/MILESTONE-C0.md`
- `scripts/check-milestone-c0.cjs`
- `src/game/legacyDriverGame.ts`
- `src/game/legacyGame.ts`
- `src/persistence/__tests__/fixtures/driver-world-v3.json`
- `src/persistence/__tests__/historicalContracts.test.ts`
- `src/persistence/alignmentMigration.ts`
- `src/persistence/contracts/README.md`
- `src/persistence/contracts/index.ts`
- `src/persistence/contracts/preCalendarDriverValidation.ts`
- `src/persistence/contracts/preCalendarRules.ts`
- `src/persistence/contracts/preCalendarValidation.ts`
- `src/persistence/contracts/v1.json`
- `src/persistence/contracts/v2.json`
- `src/persistence/contracts/v3-initial.json`
- `src/persistence/contracts/v3.json`
- `src/persistence/driverValidation.ts`
- `src/persistence/historicalSaveValidation.ts`
- `src/persistence/saveEnvelope.ts`
- `src/persistence/teamMigration.ts`
- `src/persistence/universeValidation.ts`
- `src/simulation/__tests__/calendarReadiness.test.ts`
- `src/simulation/drivers/carFit.ts`
- `src/simulation/drivers/selectors.ts`
- `src/ui/DriversScreen.tsx`

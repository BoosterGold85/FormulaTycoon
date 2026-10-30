# Milestone C — Calendar and track performance

## Before implementation: five ownership questions

1. **Owner:** `game/calendar` owns immutable versioned calendar/event/circuit content. Events
   reference stable track IDs; technical profiles belong to tracks. `simulation/calendar` owns
   date queries/disclosure. `simulation/trackPerformance` owns development-to-vector translation
   and deterministic generic car/track matching. Driver/car fit stays separate and unchanged.
2. **State:** static schedule, profiles and weights are not copied into careers. A career gains
   only `calendarId = calendar.2026.v1`. Root currentDate remains the sole clock. This structure
   change requires external save5, frozen V4 validation/fixture and explicit V4→V5 migration.
   No event status flags, car vectors, rankings or race results are persisted.
3. **Interfaces:** calendar queries consume root currentDate and calendarId. Translation reads
   fitted development truth through existing car-model semantics. UI consumes derived disclosure;
   qualifying/race/weather/strategy/championship later consume these pure APIs, never UI rules.
   Compatibility weekly development scheduling remains unchanged; dated championship events are
   a separate registry, not a silent rebalance or rewrite of old upgrade history/event IDs.
4. **Failure modes:** invalid/overlapping dates, duplicated IDs/rounds, missing tracks, stale
   schedule edits, save-content drift, invalid weights, correlated metrics, universal ordering,
   disconnected upgrades, false race predictions and named-track rule branches. Madrid profile
   uncertainty and research access must be explicit, not replaced by invented precise facts.
5. **Proof:** exact owner-approved23-round/six-Sprint schedule; clock edges/gaps/end; bounded
   profiles and malformed-content rejection; real fitted upgrades/reversions/packages/reliability;
   deterministic/nonmutating translation; contrasting technical/upgrade comparisons; eleven-car
   ordering evidence; frozenV1–V4 source/output/continuation tests; full tests/types/export and
   Chromium390×844 HQ/calendar/details/driver/team/navigation regression.

## Integration

C0.1 `b1b7dab` pushed and merged/pushed to main as `36e7df0`. Merged main passed261 tests,
TypeScript and web export before `feature/milestone-c-track-performance` was created.
Separate worker-art branch at `1cfb07d` remains excluded.

## Research gate

Owner-supplied revised schedule is the playable canonical content for this task. It is not a
claim of independent real-world schedule verification. Official technical-source access is
currently blocked by the cloud network policy. A limited domain draft was saved; publication
is required to activate it. Profiles may be prepared as explicit game-design assumptions from
the brief, but Milestone C must not claim completed circuit research until sources are read.

## Implemented calendar/content strategy

Static `calendar.2026.v1` pins23 events and `track-profiles.2026.v1`. Geographic event/track IDs
are stable; no sponsor names/graphics. Content is detached, authoring-validated and recursively
frozen. New content gets a new ID; current careers never silently follow a new live schedule.
Only calendarId is persisted, not schedules, statuses or fit scores. All exact owner dates and
Sprint markers are tested; this is not independent official calendar verification.

`calendarWindow` returns current/next/previous/future and daysUntil; current weekend is the next
playable event while inside it. Weekend dates are inclusive; COMPLETED means date passed, not a
race result. Gaps and post-final dates are handled without invented events or offseason changes.
Next-event HUD uses the same query. RACE calendar/detail is read-only; no advancement UI added.

## Save/content decision

External save5 is necessary because calendarId is new persistent structure. Default definition
becomes `calendar-track-2026-v5`; trusted internal checkpoint is3 (not an external decoder).
Frozen V4 JSON/meaningful fixture and released March2 policy stay byte-identical. Former V4
validation moved to contracts/datedValidationV4 with the same rules; no live calendar dependency.
V1/V2 reach frozen V3, then validated V4; V4→V5 clones and attaches only the released identity
and definition version. Output is strictly validated. Existing date, projects/history, HQ routes,
contracts/decisions/explicit deadlines, scouting, IDs and counters remain. Unknown/missing IDs
and future save6 fail explicitly; no content fallback or career reset.

C deliberately does not change the old24-event weekly development/introduction fixture. It remains
an internal compatibility kernel, not playable race content. Preserving it protects old project/
submission IDs, keyed RNG, continuation and development balance. Connecting upgrade introduction
to the actual race weekends needs an explicit later migration/policy decision; merely showing
23 new dates does not silently alter factory timings or historical declarations.

## Circuit profile schema and evidence boundary

Eleven0..1 demands: straight-line, aero efficiency, low/medium/high-speed cornering, traction,
braking stability, mechanical grip, tyre preservation, cooling and reliability/car stress.
Demands describe importance, not physical thresholds or real-world measured scores. Metadata
includes street/permanent/hybrid, overtaking/qualifying/safety-car tendencies, tyre/kerb severity,
track evolution, approximate altitude/null, night and broad rain tendency. No probability rolls,
weather/altitude/overtaking/incident physics are implemented. All values are bounded/validated.

All23 initial rationales are in the data and [research ledger](CIRCUIT-RESEARCH.md). Madrid is
explicitly PROVISIONAL with balanced conservative demands. Approximate Mexico2200m is unverified;
other altitudes null. **Reliable technical research is still blocked and is a merge gate.**
Owner-defined schedule/technical requirements and initial authored assumptions are distinguished
from factual source evidence. Candidate source URLs have not been read and are not citations.

## Car-performance translation

Existing computeCarProfile remains authoritative for six attributes, packages and reliability.
The new technicalCar query ignores its average pace, reads fitted truth and produces ephemeral
bounded characteristics. Suspension-derived mechanical grip informs low speed, traction/braking;
downforce informs medium/fast aero; dragEfficiency informs aero efficiency; straight-line combines
homologated power with drag efficiency. Tyre/cooling/reliability reuse existing meaning directly.
No duplicate parts/abilities, hidden team bonus or new drag tradeoff is inferred from scalar
ratings. Existing LOW_DRAG/HIGH_COOLING matching and coarse heat/reliability effects are reused;
there is no dynamic weather or altitude modifier. Driver/car comfort is untouched and separate.

An uninstalled/pending project cannot affect the car. Delivered fitted gains change the vector;
reverted projects leave it unchanged; reliability fixes affect reliability without inventing
extra pace. Existing engine balance/RNG/key namespaces and all eight upgrade areas are unchanged.

## Deterministic track matching

For each technical axis, weight = demand cubed; normalize by total weight and compare the car's
bounded technical values. Cubic emphasis makes defining demands matter more than secondary ones.
The result is internal, circuit-specific technical suitability, not universal overall/lap time/
finishing position. Public detail returns only qualitative label and derived explanations.
Relevant high-valued traits produce strengths; relevant lower-valued traits produce concerns.
No driver, form, strategy, dynamic weather, randomness or track/team-name branch enters math.

Actual fitted +10 rating comparisons (existing parts, unchanged engine):

| Upgrade area | Monaco gain | Monza gain | Suzuka gain | Silverstone gain |
|---|---:|---:|---:|---:|
| Rear wing / efficiency |0.184|1.009|1.162|1.177|
| Diffuser/rear edge / aero |0.344|0.449|1.141|1.179|
| Rear suspension / mechanical |3.401|1.143|1.279|1.224|

These are internal comparison units, not predicted seconds/positions. Generic matching creates
low-drag benefit Monza>Monaco; fast-aero benefit Suzuka/Silverstone>Monaco; mechanical benefit
Monaco>Monza. No named-track bonus or development retune was used.

## Eleven-car field evidence

Seed1, untouched canonical starting fitted states; rank is circuit-specific technical ordering
only. It is debug/handoff evidence, not shown as race prediction in the app.

| Team | Monaco | Monza | Suzuka | Las Vegas | Sepang |
|---|---:|---:|---:|---:|---:|
| Mclarin Racing | 4 | 4 | 4 | 4 | 4 |
| Ferano Corse | 2 | 2 | 2 | 2 | 2 |
| Mercurion GP | 3 | 3 | 3 | 3 | 3 |
| Vortex Racing | 1 | 1 | 1 | 1 | 1 |
| Arden Motorsport | 5 | 5 | 5 | 5 | 5 |
| Wellington Racing | 7 | 6 | 7 | 6 | 7 |
| Alpinor GP | 6 | 7 | 6 | 7 | 6 |
| Hartman Racing | 8 | 8 | 8 | 8 | 8 |
| Veloce Racing | 9 | 9 | 9 | 9 | 9 |
| Auden Motorsport | 10 | 10 | 10 | 10 | 10 |
| Caldera Racing | 11 | 11 | 11 | 11 | 11 |

Wellington rises7→6 at Monza/LasVegas relative to Monaco/Suzuka/Sepang; Alpinor moves6→7.
Monza Wellington75.258 versus Alpinor75.180 (about0.078); LasVegas73.769 versus73.768 (about0.001).
These margins are intentionally reported, not overstated as race competitiveness. Most initial
ordering remains hierarchical because original car levels dominate. Synthetic contrasting-design
and real fitted-upgrade tests demonstrate broader model differences without altering starter
balance, adding randomness or hard-coding winners. Long-run balance remains unverified.

## UI / manual

RACE is now available and displays round/venue/country/dates/Sprint/status/next event. Tapping
opens technical demands, circuit type, provisional warning where applicable, player-team
qualitative car fit and derived strengths/concerns. Numeric vectors/field scores and fake race
positions are omitted. Detail/back navigation resets the inner scroll position. HQ remains
mounted, with its existing8-worker routes/cards/New Day cycle intact and date unchanged.
HQ next event is derived: Mar2 -> Melbourne / Mar6–8 /4 days; no Melbourne string in HUD logic.

Player manual adds Calendar & Race Weekends, Circuit Characteristics, Car Characteristics and
Car/Track Fit. It distinguishes Sprint/calendar markers from future simulated sessions, dates
passed from results, technical suitability from driver comfort, and plans from available controls.
No hidden formulas/weights are exposed there.

## Actual validation results

Merged main36e7df0 before branching:

- `npm test -- --runInBand`: PASS261/ten suites.
- `npm run typecheck`: PASS.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: PASS.

Final C implementation:

- `npm test -- --runInBand`: **PASS311/13 suites**, zero failed/skipped.
- `npm run typecheck`: **PASS**.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: **PASS**,659KB JS.
- `node scripts/check-milestone-c.cjs`: **PASS**, existing Playwright/Chromium,390×844 touch
  viewport against local export. Optional FORMULA_PREVIEW_URL/FORMULA_ARTIFACT_DIR override
  defaults; the script never installs a browser or packages.
- `sha256sum --check /workspace/artifacts/milestone-c/historical-hashes.txt`: **PASS**, all nine
  original V1–V4 contract/initial-payload/fixture hashes. New calendar content also hash-pinned.
- `git diff --check`: **PASS**.

New tests cover exact owner dates/Sprints/order/references/bounds/overlap rejection, clock
windows/gaps/final race/inclusive dates, nested freeze/unknown content, profile identities,
actual fitted upgrades/reversions/packages/reliability, generic upgrade comparisons, deterministic
nonmutating/no-RNG/name-independent matching, eleven-car ordering and public numeric disclosure
exclusion. V1–V4→V5 state/metadata/identity preservation, meaningful fixture retention, cold-load
historical isolation,20-week continuation, calendar-ID rejection and future6 rejection pass.
All original development/driver/HQ/save regression suites pass.

Browser covers date/next event, HQ arrivals/worker/department cards/New Day/repeated8/8; Drivers22,
Prospects10/reserves11/TEAM2, six grades/contracts/four options/scouting retention,23 calendar
cards/six Sprint markers, Monaco/Monza/Suzuka/LasVegas/Sepang/Madrid details, explicit provisional
Madrid, scrolled car-fit visibility, navigation/back and History placeholder. **Zero page errors;
no horizontal overflow.** Screenshots/logs at `/workspace/artifacts/milestone-c/`; these are
workspace artifacts, not a public deployment. Final checked-in script reproduces the captures.

The first browser run failed in the harness because a text locator matched both hidden mounted
HQ and visible calendar NEXT EVENT. It was scoped to the calendar event button, then rerun
successfully. No app behavior/test assertion was disabled. A separate inspection confirmed the
390×844 document stays within viewport and fit cards are reachable in the internal scroll view.
Nonblocking npm update and FORCE_COLOR/NO_COLOR warnings remain. No installation/lockfile change,
PR or manual cloud deployment was performed in that initial implementation pass. The branch
was subsequently pushed for testing with explicit owner approval.

## Limitations / debt / merge recommendation

**HOLD MERGE / C NOT COMPLETE:** the reliable technical-source research required by the brief is
blocked by actual proxy403. A successful limited network draft save is not applied access or
completed research. Review/save its domain additions in environment settings and publish the
environment, then recheck access, read sources for all23 circuits and record actual evidence.
See CIRCUIT-RESEARCH for assumptions and candidate targets, explicitly not consulted citations.
No need to ask for dependency installation; existing tools support all current verification.

Native iPhone/Expo Go/Safari, hardware profiling and Cloudflare remote runtime are not verified.
Durable device storage/save UI/recovery, lap-time/physics calibration and decades of balance are
not implemented/claimed. No practice/qualifying/race/tyre/strategy/weather/incident/points/results/
finance/offseason systems were added. Future calendars are not fabricated after the final event.

Initial field variation is modest; the old balanced development truth remains deliberately intact.
Scalar attributes and correlated derived characteristics do not imply detailed aero/drag/altitude
physics. Weekly development fitting still uses its old compatibility fixture; connect actual
weekends only through deliberate migration/balance work. Existing audit M1/M3/M5-broader/M6/M7/M8
and low-priority findings remain scheduled. Source/originality review remains pre-release work.

C0.1 integration is complete on main. Implementation34e486a was subsequently pushed for testing
with explicit owner approval; Milestone C remains unmerged. Graphics1cfb07d is clean/preserved/unmerged; original simulation/content/art
checks pass. Finish research, then review/integrate C. D (qualifying) is the next gameplay milestone
only after that gate. **No qualifying work started; stop here.**

## Files changed

47 files including this handoff:

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
- `docs/development-notes/CIRCUIT-RESEARCH.md`
- `docs/development-notes/MILESTONE-C.md`
- `scripts/check-milestone-c.cjs`
- `src/game/calendar/calendar2026v1.json`
- `src/game/calendar/index.ts`
- `src/game/calendar/types.ts`
- `src/game/defaultGame.ts`
- `src/game/hudPlaceholders.ts`
- `src/persistence/__tests__/calendarMigration.test.ts`
- `src/persistence/__tests__/dateMigration.test.ts`
- `src/persistence/__tests__/historicalContracts.test.ts`
- `src/persistence/calendarMigration.ts`
- `src/persistence/contracts/README.md`
- `src/persistence/contracts/datedValidationV4.ts`
- `src/persistence/contracts/index.ts`
- `src/persistence/contracts/preCalendarTypes.ts`
- `src/persistence/contracts/v5.json`
- `src/persistence/dateMigration.ts`
- `src/persistence/gameSave.ts`
- `src/persistence/historicalSaveValidation.ts`
- `src/persistence/saveEnvelope.ts`
- `src/persistence/universeValidation.ts`
- `src/simulation/__tests__/calendar.test.ts`
- `src/simulation/__tests__/campaignClock.test.ts`
- `src/simulation/__tests__/driverAlignment.test.ts`
- `src/simulation/__tests__/drivers.test.ts`
- `src/simulation/__tests__/trackPerformance.test.ts`
- `src/simulation/calendar/eventDetail.ts`
- `src/simulation/calendar/index.ts`
- `src/simulation/calendar/validation.ts`
- `src/simulation/trackPerformance/carVector.ts`
- `src/simulation/trackPerformance/index.ts`
- `src/simulation/universe/index.ts`
- `src/simulation/universe/types.ts`
- `src/ui/CalendarScreen.tsx`
- `src/ui/HeadquartersScreen.tsx`
- `src/ui/components/GameHud.tsx`


## Research-only follow-up — access still blocked

Starting implementation commit: 34e486ab2b8262a744deb0070706fb0adbd9a5b6, already pushed for testing.
Scope was research, justified profile corrections and revalidation only. No profile, calendar,
car model, development, driver, save schema/fixture, UI or player-manual changes were made.
No merge, dependency installation, additional branch push or qualifying work was performed.

Active policy still enables no research domains. Fresh requests to Formula1, FIA, Pirelli,
Madrid and Sepang were all denied by proxy CONNECT403 before any source content could be read.
The ledger records all23 research reviews as PROVISIONAL/unverified, not as completed research
or game-data corrections. Candidate URLs remain explicitly unread. The existing network draft
must be reviewed/saved/published before the required technical review can proceed. A draft save
alone is not live access. **HOLD MERGE / NOT READY; the research gate is not complete.**

Actual revalidation commands on unchanged implementation:

- `npm test -- --runInBand`: PASS311/13 suites, zero failed/skipped. Includes calendar/profile,
  car-vector/track-fit, currentV5 and V1–V4→V5 save/migration/continuation tests.
- `npm run typecheck`: PASS.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: PASS.
- `FORMULA_PREVIEW_URL=http://127.0.0.1:8776 FORMULA_ARTIFACT_DIR=/workspace/artifacts/milestone-c-research/browser node scripts/check-milestone-c.cjs`:
  **PASS**, zero page errors/horizontal overflow; calendar/details/scrolled fit, HQ New Day/cards,
  Drivers/Team/options/scouting and navigation all passed.
- Field comparison rerun across Monaco/Monza/Suzuka/LasVegas/Sepang with all11 starting cars.
  Ordering is unchanged from the matrix above: Wellington7/6/7/6/7; Alpinor6/7/6/7/6. The field
  remains mostly hierarchical; no starter-car rebalancing was performed.
- All nine historical contract/fixture SHA checks PASS; calendar content remains hash-pinned.

Logs/field results/source-access evidence: `/workspace/artifacts/milestone-c-research/`.
All final checks completed successfully on the unchanged implementation. Existing npm/color
warnings remain nonblocking; no packages were installed.

GitHub's commit check for34e486a now reports **Workers Builds: formulatycoon — succeeded**,
Build ID cb87d289-ac4f-45d9-a3e3-21a2cc7a3028. This confirms the automatic build check only.
No preview URL is exposed in the retrieved check page; live deployed browser behavior is not
verified and there are no newly researched profiles to certify there. Do not equate a successful
build check with final researched-profile preview validation. Native iPhone remains optional.

This follow-up is documentation/evidence only. Player manual remains unchanged because no
mechanics changed. Main remains C0.1 at36e7df0; worker art remains separate. Finish source access
and actual23-circuit research before any READY TO AUDIT / MERGE recommendation. D is not started.

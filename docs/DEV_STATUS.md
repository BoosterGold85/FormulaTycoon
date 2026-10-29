# Development status

## Milestone

A/A.1/guardrails merged at `f2dab51`. Audited B/B.1 including `6b7e894` merged/pushed to main
at **`88ef974`**. Main validation: 161/161 tests, TypeScript and static web build PASS.
C0 — Calendar readiness: COMPLETE on `feature/milestone-c0-calendar-readiness` as a separate
local commit (see branch history). C is **NOT STARTED / NOT READY** pending owner time-model
approval and the planned single-clock migration before C content.

Graphics work is preserved separately at `feature/hq-worker-art-polish` / `1cfb07d`; it is
unmerged and excluded from main/C0. No packages installed, no PR opened, no graphics merged.

## POST-MILESTONE B AUDIT

Authoritative report: [POST-B-AUDIT](development-notes/POST-B-AUDIT.md), audit commit `6b7e894`.
READY TO MERGE with no blockers; merge is now complete. C0 addresses H1/M4 and M2 preparation.
The report itself remains unedited. Exact source data, 23 contracts/four options, grade thresholds,
11 teams/22 starting seats/43 people and all audited gameplay conventions remain intact.

## COMPLETED

- Existing single app-lifetime universe, canonical driver/scouting/contract domain, six grade
  disclosure and v1/v2/v3 migration behavior retained. No new player mechanic/manual expansion.
- H1: checked-in v1/v2/v3 content contracts detached from live calendars, parts, regulations, HQ,
  staff/driver/team IDs, traits and buckets. Recursive freezing. Legacy aliases use snapshots.
- Released pre-calendar validation semantics pin project-progress/contract/calendar rules too;
  current live engine edits cannot alter historical acceptance. Unknown released definition IDs
  require explicit registration rather than arbitrary live-data fallback.
- V1/v2 transformations target frozen v3 added entities/source payload/Caldera, retaining earned
  state/decisions/history/opaque project IDs. Live initialization no longer changes old migrations.
- Meaningful v3 fixture: week16, 45 upgrade submissions, pending projects, mid-route HQ, improved
  scouting and an exercised option. Original v1/v2 fixtures byte-identical; all three hashes pinned.
- Permanent rule in AGENTS/guardrails/architecture: bump version for persistent changes, freeze
  prior contract, retain fixture, add/test migration, never rewrite historical inputs to match live.
- Save version remains3; source validation boundary ready for future explicit v3→v4 when real
  calendar state is introduced. No speculative v4 or empty calendar state.
- M4: `selectDriverCarFit` owns current employment/car-profile/compatibility composition; screen
  requests only a qualitative result. Dead DTO `fit` removed. No track argument/modifier added.
- M2 preparation: complete clock/adapter/UI/deadline inventory and precise single-owner migration
  plan. The temporary two-clock adapter is guarded/tested; final representation is not guessed.

## IN PROGRESS

No further C0 implementation at handoff. Await review and owner time-model decision. Do not
start C, track/calendar content, qualifying/racing or merge the separate graphics branch.
C0 is committed locally; only the audited B/B.1 merge/main publication was authorized/performed.

## TESTED

- Merged main: `npm test -- --runInBand` PASS161/six suites; `npm run typecheck` PASS;
  `EXPO_NO_TELEMETRY=1 npm run build:web` PASS before C0 started.
- C0: `npm test -- --runInBand` **PASS220/eight suites** (161 existing +59 C0).
  `npm run typecheck` PASS; `EXPO_NO_TELEMETRY=1 npm run build:web` PASS (621KB web JS bundle).
- Frozen v1/v2/v3 validation, nested immutability and cold-load with live modules unavailable.
  Drift probes alter live event/part/budget/season bounds, HQ/staff, driver/team/trait/bucket/source
  registries and mapping: historical validation and v1/v2 migration output remain unchanged.
  Current-only event IDs remain rejected. Historical input bytes remain unmodified.
- V3 meaningful state and 20-week deterministic restored continuation; unsupported v4 still rejected.
  All existing canonical driver/contract/save/HQ/development suites pass without data changes.
- Car-fit parity for all43 drivers, deterministic/no mutation, no DTO fit duplicate, UI ownership
  boundary, unavailable/expired employment and inherited-ID handling. Reserve behavior preserved.
- Temporary clock equality each step through two seasons/rollovers, W40/W41 lapse, season-end
  identity no-op, skewed-save rejection, no campaign advance from HQ/restart/scout/options.
- Chromium390×844: HQ/New Day/cards/8-of-8 return; Drivers22, prospects10, reserves11, TEAM2;
  detail/six grades/domain fit, all four options/deadlines/foreign button absence, canonical deal
  displays, scouting retention, placeholder RACE/navigation. Zero page errors/horizontal overflow.
  Reproducible optional script: `node scripts/check-milestone-c0.cjs` against served dist, with
  existing Playwright/Chromium. No installation was performed. Script env overrides are documented
  in its header/variables. Screenshots/logs: `/workspace/artifacts/milestone-c0/`.
- `git diff --check` PASS; original v1/v2 fixture SHA256 checks PASS. Nonblocking color-variable
  warnings/npm update notices only. No failed or skipped cases in the final suites.

## NOT VERIFIED

- Native iPhone/Expo Go/Safari, hardware FPS/memory/battery and safe areas.
- Live Cloudflare deployment; local export/branch publication are not proof of remote runtime.
- Durable device saves/restart recovery: memory adapter remains volatile, no save/load/import UI.
- Actual single-clock/date ownership migration and v4: intentionally not implemented pending
  owner decision. No calendar/track/race/form/economy engine or multi-decade balance claim.
- Owner-controlled option button in live Wellington UI: default pair has no option. Existing
  domain option tests pass; browser verifies all foreign option terms/actions remain correct.

## KNOWN ISSUES

- Source omits option deadline/pay: retained W40 last guaranteed year/equal annual salary;
  existing starter bonus$0.35M is not source-supplied. No payroll or bonus payouts.
- Imported B careers keep existing abilities/generic deals/decisions; new canonical terms apply
  to new games. Source snapshots remain historical reference rather than lifetime frozen ability.
- Fixed cohort labels, free scouting, no offseason recruitment, vacancies after expiry and no
  growth/retirement/race effects remain as audited. Car fit remains a coarse qualitative proxy;
  reserves still show an affiliated car (L9), with no race-seat/effect assertion.
- Unknown content IDs now require a released contract: future authoring must version/validate
  content explicitly. Historical definitions/rules are intentionally separate immutable data.

## TECHNICAL DEBT / ARCHITECTURAL RISK

| Finding | Status and due gate |
|---|---|
| H1 | Addressed: independent frozen content/rules/migration payloads and v3 fixture |
| M1 | Deferred: seeded imperfect scouting estimator before scouting expansion |
| M2 | Temporary guarded duplicate clocks; root-owner v3→v4 plan pending owner model approval before C content |
| M3 | Deferred: derive team control from playerTeamId before chooser/career setup |
| M4 | Addressed: domain driver/car-fit selector and dead fit removal |
| M5 | Deferred: shared option/overlap rules before contracts/offseason expansion |
| M6 | Deferred: current contract-role grouping before multi-season/offseason |
| M7 | Deferred: measure/archive history (~41KB/season in audit) by Championship/History G |
| M8 | Deferred: originality/source rights review before public/commercial release; identities/data unchanged |

L1–L10 remain scheduled low-priority work; dead fit/directly touched stale documentation corrected
only. No cleanup sprint. Durable storage/backups/recovery, closed fixed driver schema, balancing
and real-device profiling remain carried debt. Frozen historical contracts must be maintained
as history, not casually regenerated from later content. Future incompatible runtime types must
retain historical schema types and validators instead of editing released expectations.

## NEXT MILESTONE

**NOT READY FOR MILESTONE C.** Owner must approve actual calendar dates with campaign start,
preseason/week/season/offseason mapping OR an explicit logical season/week/day model with date
mapping. Then C must introduce one authoritative GameUniverse CampaignTime and validated v3→v4,
removing persisted driver/development current-time mirrors before calendar/track content.
See [C0 notes](development-notes/MILESTONE-C0.md) for the exhaustive inventory and six-step plan.
Stop here; no track/calendar implementation or gameplay-branch continuation is implied.

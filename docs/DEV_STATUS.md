# Development status

## Milestone

A + A.1 + permanent guardrails: COMPLETE, merged/pushed to main at `f2dab51` before B.
B — 2026 fictional driver world, contracts and scouting: COMPLETE at `e065ebd`.
B.1 — **Canonical 2026 Driver Data Alignment**: COMPLETE as a separate commit on
`feature/milestone-b-driver-world`. B/B.1 were pushed to the feature branch with owner approval; neither is merged. C/racing: NOT STARTED.

Read AGENTS.md and the six required architecture/guardrail documents before further work.
Ownership, derivation and migration decisions are in `docs/development-notes/MILESTONE-B1.md`.
`docs/PLAYER_MANUAL.md` is the living player guide; update it whenever a major player-facing
system reaches Definition of Done. Do not disclose hidden formulas in that guide.

## COMPLETED

- Existing DriverWorld architecture retained. Eleven canonical organizations, 22 distinct starting
  race drivers/two seats each, ten prospects and eleven reserves/free agents (43 people total).
- Exact owner-supplied P2P 2026 source snapshots for all 23 supplied counterparts: Pace, Racecraft,
  Tyre Management, Qualifying, Consistency and Discipline. Reference overall remains internal
  metadata, not an FT overall. Alvarro/Sterling/Botten retain the unranked 13-of-18 context.
- Starting Talent uses Pace/Qualifying; Racecraft uses Racecraft/Tyre Management; Composure uses
  Consistency/Discipline. Equal means without rounding; centralized thresholds are F<40, D40,
  C-50, C55, C+60, B-65, B70, B+75, A-80, A85, A+90. Adaptability, Technical Feedback and
  Marketability retain authored B values; veteran organizational strengths remain independent.
- Individual source salaries, guaranteed end years, only the four supplied options and Confirmed/
  Reported provenance replace generic starting terms. Both statuses are mechanically binding.
  Dollars are stored in the existing $M units. Years remaining derive from the one timeline.
- Yuto Takase (`driver.takase`), the fictional Yuki counterpart, has a reported $5M Vortex reserve
  deal through 2026 and Vortex/Veloce affiliations. Null reserve seat never becomes a third starter.
- All initial form remains 50/NORMAL; qualitative labels exist separately from source performance.
  No dynamic form/growth/race engine is introduced. Source snapshots are separate from abilities.
- Existing contract conflict/ownership/deadline/expiry/idempotence guards and scouting narrowing
  remain. Reserve employment participates in driver overlap checks, not numbered-seat occupancy.
- Driver detail shows six grades, traits, salary/end, derived remaining term, real option year,
  source certainty, form, commercial context, familiarity and car-fit estimate. TEAM includes race
  seats only. Profile/filter/navigation resets scroll to the top. No raw sources/overall enter DTO.
- Serialized format v3/default definition `driver-world-2026-aligned-v3`. V1 still explicitly maps
  ten teams and initializes aligned driver content. V2 validates the frozen B definition before
  preserving all existing abilities, signed deals/options, knowledge, HQ/development/history and
  adding source snapshots/Takase. V3 reload validates without changing career data.
- Player Manual documents drivers, planned performance interaction, fit, feedback, commercial
  value, salary/guarantees/options/expiry, scouting, HQ and current saving limitations.
- No dependencies added/installed. Development math and RNG streams remain unchanged.

## IN PROGRESS

B/B.1 await review. The focused Cloudflare preview configuration fix is complete and is being
delivered to the test branch. Remote deployment confirmation remains pending. No merge or start
of C is authorized by completion.
Wellington remains the initial player team; choosing another team/hiring UI is outside this slice.

## TESTED

- `npm test -- --runInBand`: PASS, **161 tests / six suites** (100 prior cases + 61 alignment cases).
- `npm run typecheck`: PASS.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: PASS, static export only.
- Independent canonical fixture transcribed from supplied text: each of 23 full source records and
  23 salary/team/end/option/provenance records exactly matches runtime starting content. Underlying
  source subskills remain separate; all authored non-source buckets retained. Grade decimal
  boundaries, qualitative form, derived years/option extension and 11 teams/22 race seats checked.
- Existing 42-profile B initializer exactly matches its frozen v2 fixture; adding Takase leaves
  other market profiles unchanged. Scouting and public DTO checks retain hidden-value boundaries.
- V3 source/contract/option/stable-ID round trip, malformed source/role/provenance rejection,
  frozen v2 career preservation (including edited ability/pay/options/knowledge), progressed v2
  expiry/continuation and frozen v1 pending-project migration. No input mutation.
- Existing HQ/development/universe/persistence suites still pass; three calendar-year expiry
  regression remains. These are headless development years, not raced championships.
- Chromium 390 × 844: grid22/prospects10/reserves11/pair2, established/prospect/reserve details,
  exact Max/Harlton/Ortez/Leclair/Takase/Wellington contract displays, 2027 and 2028 option text,
  foreign option actions absent, no invented Wellington options, scouting survives navigation,
  HQ 8/8, worker/department cards and NEW DAY 0/8. Zero page errors or horizontal overflow.
- Build warnings: inherited NO_COLOR/FORCE_COLOR conflict only; npm printed an update notice.
  No updates installed. No tests failed or were skipped.
- Logs/browser reproduction script: `/workspace/artifacts/milestone-b1/`; tracked screenshot
  evidence and file manifest: `docs/screenshots/milestone-b1/`, `docs/development-notes/MILESTONE-B1.md`.

## Cloudflare preview configuration follow-up

- Reported failure: Workers Builds ran `npx wrangler preview`, but the repository had no Wrangler
  config or `previews` block. The log also showed no Expo export before the deploy command.
  npm's dependency deprecation warnings were not the fatal error.
- Added `wrangler.json` for existing Worker `formulatycoon`, inferred from the owner's branch URL:
  empty `previews`, top-level `assets.directory=./dist`, SPA fallback and compatibility date.
  `build.command=npm run build:web` generates the Expo export before upload. No Worker script,
  dependency installation, bindings or production routes added. README now separates Workers
  preview settings from the older Pages instructions.
- PASS: executed the actual configured build command with `EXPO_NO_TELEMETRY=1`; confirmed
  `dist/index.html` and every JS bundle it references exist. `npm run typecheck` and
  `git diff --check` pass. Game code did not change; prior 161-test results above remain the last
  full simulation run. Logs: `/workspace/artifacts/cloudflare-preview/`.
- Reference: Cloudflare's official [Preview configuration](https://developers.cloudflare.com/workers/previews/configuration/)
  and [Wrangler custom builds](https://developers.cloudflare.com/workers/wrangler/custom-builds/).
- NOT VERIFIED: executing Wrangler locally or a successful remote upload/runtime. Wrangler is
  absent locally and this cloud environment has no Cloudflare credentials; nothing was installed.
  A push should trigger the configured preview build; use Cloudflare's resulting Preview URL.

## NOT VERIFIED

- Native iPhone/Safari/Expo Go, device safe areas, hardware frame rate, battery/memory.
- Live Cloudflare deployment: the supplied Workers build failed before upload because no
  Wrangler `previews` configuration existed. The fix is prepared/validated locally; successful
  remote upload remains pending. A static web build alone is not deployment.
- Real-device save persistence/restart recovery. Memory storage remains volatile, with no player
  save/load/import/export/autosave screen. Do not depend on the prototype for a durable career.
- Racing, track/weather/strategy effects, evolving form, growth/retirement, actual feedback-driven
  upgrades, sponsors/payroll or competitive career balance; those systems are not implemented.
- Owner-controlled option button is domain-tested; browser validates foreign options are display
  only. Default Wellington has no option, so its live UI cannot exercise a starting option.

## KNOWN ISSUES

- Source omits option deadline/pay: retained deadline W40 of the final guaranteed year and assumed
  option-year salary equals supplied annual pay. No invented raise. Existing starter bonus remains
  $0.35M (not claimed as source data); reserve bonus is zero. No payouts are simulated.
- New careers receive aligned starting content. Existing B saves intentionally retain old ratings
  and generic deals/options; migration must not replace signed career facts. Source metadata on
  these imports is historical reference, not a claim their mutable abilities were recomputed.
- Scouting reviews remain free/immediate and conservatively enclose true grades. Future changing
  abilities/evidence snapshots need an explicit model/schema evolution.
- New domain deals support guaranteed terms only. Negotiation, buyouts, driver options, complete
  recruitment UI and automatic offseason seat filling are absent. Expired deals leave vacancies.
- Grid is the fixed 2026 starting cohort, not future championship entries. A driver's cohort label
  and current contract role differ if future contracts are signed. Reserve affiliation is not a seat.
- Ages derive from calendar; stage/abilities do not automatically develop. History starts empty.
- Car fit is a qualitative downforce/grip proxy. No engineering/commercial bonuses are awarded.
- Caldera/eleven-entry ATR retains initialization/regression evidence, not long-run balance proof.

## TECHNICAL DEBT / ARCHITECTURAL RISK

- Durable platform adapters, atomic writes/backups and validated session replacement remain
  required before long careers. Trusted checkpoints must stay out of file-import paths.
- V3 validates a fixed 43-person cohort (v2:42). Procedural drivers/new brands/career statistics/
  facilities/finances require explicit future schema migrations and fixtures.
- Legacy definitions remain for compatibility only; do not resume old new-game initialization.
  Opaque old project IDs remain stable to preserve keyed development outcomes.
- Canonical names are owner-provided working identities, not legal clearance. Source dataset
  attribution/redistribution rights and original fictional branding require release review.
- Broad market/pay balancing, history growth and multi-decade simulation remain future work.

## NEXT MILESTONE

Review B/B.1 and assumptions before authorizing push/merge. C — track profiles and characteristic
translation — remains the next planned feature, not begun. No racing/qualifying/form/finance/
sponsors/facilities expansion was bundled into this alignment.

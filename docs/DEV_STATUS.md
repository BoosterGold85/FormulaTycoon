# Development status

## Milestone

**UI V1.1 + PERMANENT GRAPHIC DESIGN BIBLE / PORTRAIT SYSTEM COMPLETE — OWNER REVIEW.**
The owner paused feature expansion after D0. Qualifying has NOT started.

Branch: `feature/ui-visual-experience-v1`, from validated/published main
**200f4d61ff860537a1f5be6de1843f4888333912**. Main already contains C, its audit and D0; it is
unchanged by this UI branch. Reviewed V1 commit 9a95b7c was pushed with owner approval and the
owner reports its Cloudflare preview working. V1.1 continues the same authorized preview branch;
publication/build status is reported in delivery. No merge is authorized or performed.
Full handoff: [UI-VISUAL-EXPERIENCE-V1](development-notes/UI-VISUAL-EXPERIENCE-V1.md).

## COMPLETED

Permanent visual infrastructure follow-up (base af80f34, same branch):

- Canonical `GRAPHIC_DESIGN_BIBLE.md`: miniature tycoon direction, reusable art, palette ownership,
  lighting/fictional identity/mobile rules and required instruction for future visual milestones.
  AGENTS reading, guardrail36, brand/architecture/milestone documentation now enforce that source.
- One anonymous shoulders-up `DriverPortrait` with six independently colored helmet/suit regions,
  fixed charcoal visor and neutral background. Existing React Native View shapes only, no dependency.
  Supersedes helmet/initials artwork; same template scales on roster/dossier/compact Team entries.
- Canonical brand registry gains secondary/accent tokens; existing primary/organization properties
  unchanged. Current employment DTO → canonical colors → stateless rendering; transfers recolor
  automatically. Neutral expiry/unassigned identity and deterministic presentation-only contrast.
- Three-palette80/100/120px review sheet and actual390×844/desktop screenshots under
  docs/screenshots/driver-portraits. No additional HQ/car/milestone work.


V1.1 focused refinements:

- Featured own-driver personnel rows and larger helmet identity (now shared shoulders-up template); market rows are
  quieter. Dossier hero leads with identity/form/status; six grades use open typography.
- Full-surface Next Race/car actions, flatter hero surfaces and open divider-based sections.
  Calendar dates/legend take precedence over nested boxes. Existing navigation/owners preserved.
- Event detail now leads with three defining demands and one key strength/concern; all remaining
  data stays under More details. Team exposes next-circuit strengths/weaknesses immediately.
- Reusable real-project stage summary/illustration, honest no-project state and open Team sections.
  No new project commands, progress model, ETA, points or weekly gameplay.
- HQ and worker implementation unchanged after phone review. Seven updated review PNGs include
  the required six screens and combined sheet under docs/screenshots/ui-visual-v1.1.

Original V1 foundation retained:

- Shared presentation tokens, icons, headers, cards, rows, chips, grades, actions, disclosures and
  empty/detail treatment. Dark HQ-inspired layers, warm text, team accents and original graphics.
- Permanent hierarchy: GLANCE → UNDERSTAND → TAP → INVESTIGATE → ACT. First-level decision
  information, second-level management detail, deeper analytical disclosure.
- Compact own-driver roster and Available/Prospects/Reserves/Grid browser. Full shared dossier
  with six grades, identity/status/specialties; contract/scouting/background/history disclosures.
- Real month grid, next-weekend hero, all actual weekend dates and month navigation. High-level
  event detail before More details. No normalized values, field ranks or fake predictions.
- TEAM executive overview, contextual next-circuit car, actual projects/fitted specs/HQ counts and
  shared driver drill-down. HISTORY polished empty state, without fake records or cash/morale.
- Selected five cosmetic worker files from 1cfb07d: proportions, articulated elbows, eight poses,
  accessories/role differentiation and grounding. Old branch preserved; no whole-branch merge.
- Read-only month and management projections compose existing domain owners. App retains one
  universe and the same mounted HQ. Existing commands/engine rules unchanged; save v5/checkpoint3.
- Six actual phone review PNGs and an offline gallery under docs/screenshots/ui-visual-v1.
  Architecture, guardrails, loop, system map, milestones and navigation manual updated.

## IN PROGRESS

None. The Bible/portrait follow-up and V1.1 are ready for owner review/merge decision; do not merge automatically. Publishing
continues the previously authorized preview branch only. Do not begin qualifying or the weekly
player-development loop. Main and the preserved worker-art worktree stay unchanged.

## TESTED

Portrait follow-up final validation:

- 350 tests/18 suites PASS (four added behavioral tests), TypeScript PASS, web build PASS.
- Actual mounted component recolors all regions across three palettes with identical geometry;
  real domain signing changes the same mounted portrait, disregarding stale familiarity; expiry
  becomes neutral. Missing accent/low contrast/all11 canonical palettes/card scaling covered.
- `node scripts/check-driver-portraits.cjs` PASS:80/100/120px three-palette RN Web component review,
  production own/rival roster/dossier,390×844 and1440×1000, no errors or horizontal overflow.
- Existing `node scripts/check-milestone-c.cjs` regression PASS on the final export: data/disclosures,
  navigation/HQ taps,8/8 and NEW DAY retaining campaign date.
- All simulation/persistence files unchanged from af80f34; only presentation palette metadata in
  brandRegistry changes among111 domain files.18 historical contract/fixture files unchanged.
- `git diff --check` PASS. No install, package/lockfile, save or gameplay changes.
  Evidence: /workspace/artifacts/driver-portraits/. Full handoff in the UI V1 notes.


- V1.1 fresh validation: 346 tests/17 suites PASS, TypeScript PASS, web export PASS (718KB).
- Phone 390×844 and desktop 1440×1000 browser PASS, no page errors or horizontal overflow.
  Added guards for the Team label wrap found during visual review and three initial circuit
  demands; all original data/disclosure/navigation/HQ regressions remain active.
- 111 tracked game/simulation/persistence files, including the V1 read models, match reviewed
  9a95b7c byte-for-byte. Historical hashes 11/11 PASS. No gameplay/save/calendar/RNG/D0 changes.
- Six exact 390×844 screenshots plus combined sheet captured and self-reviewed. The three-second
  review is author inspection, not a timed human usability study. Logs: /workspace/artifacts/ui-visual-v11/.

V1 regression foundation, rerun through V1.1:

- `npm test -- --runInBand`: **346/346 tests, 17/17 suites PASS**, zero failed/skipped. All C/D0
  clock, progression, performance, driver/contract/HQ and v1–v5 migration regression remains green.
- New behavioral read-view tests: correct March alignment/current date, all 23 events, real
  cross-month dates, no state mutation, version-pinned statuses, roster membership/uncertainty,
  actual empty development and no fabricated money/results/raw driver scores.
- `npm run typecheck`: **PASS**.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: **PASS**.
- Current browser entry point `node scripts/check-milestone-c.cjs` delegates to the UI-V1 smoke
  and **PASS 390×844 /1440×1000**. Full23 events/six Sprints/nine researched circuit details,
  roster/grid/prospects/reserves, salaries/options/deadlines, rival control restrictions,
  scouting persistence, all Team drill-downs, History, HQ cards, NEW DAY and repeated 8/8.
  Zero page errors/horizontal overflow. Uses existing Playwright/Chromium, no installs.
- Eleven historical file hashes independently match original Git objects. Both immutable calendar
  hashes pass. No save, canonical driver, calendar profile, RNG or gameplay engine change.
- Updated stale source-file boundary assertion for extracted DriverProfile, retained selector/no-
  UI-car-calculation checks, and adapted browser locators/disclosures. No tests were disabled.
- Visual inspection corrected an unsupported arrow glyph and clipped mini illustration; final
  screenshots are real app renders. Logs: `/workspace/artifacts/ui-visual-v1/`.
- `git diff --check` PASS. No dependency/package/lockfile change. Existing npm update/color
  notices are nonblocking. No native performance guarantee is inferred.

## NOT VERIFIED

- Native iPhone/Safari, native font rendering, accessibility services,
  FPS/battery and small worker-prop readability on hardware.
- Live V1.1 public-browser behavior. The owner verified the prior V1 preview; local Chromium smoke
  and a Cloudflare build check are not native/public-runtime proof.
- Qualifying/race controllers, pace/risk calibration, dynamic conditions, results, actual-weekend
  fitting, future season calendars and 20–50-season gameplay.
- Durable device storage/import/recovery; adapter remains volatile.
- Direct circuit-source retrieval or missing bibliography. Existing externally verified owner
  research remains honestly recorded (19 HIGH/four MEDIUM); no new source verification claim.

## KNOWN ISSUES

- Portraits use one anonymous shoulders-up template; other V1 graphics use symbolic identities and stylized circuit artwork, not likenesses or
  measured maps. Native visual fidelity/performance needs review.
- Detail screens reset to their header on entry/back; UI navigation state is not persisted.
- Development display is read-only; current-stage percentage is not whole-project progress or
  an estimated completion date. No new management actions/hiring or fake organization ratings.
- Historical 24-event weekly fitting remains distinct from the 23 playable dates. First fitting is
  May 11, 2026; retiming needs versioned compatibility review. Month browsing never advances time.
- Existing technical score includes readiness, not calibrated lap pace/failure probability. Future
  sessions must consume effects once and keep driver/car comfort separate.
- V5/v1 careers retain original profiles/provisional Madrid; no silent content upgrade. New games
  use v2. Scalar-derived technical axes remain coarse proxies; starter hierarchy is unchanged.

## TECHNICAL DEBT / ARCHITECTURAL RISK

| Finding | Status / due gate |
|---|---|
| UI review | V1.1 self-review complete; READY TO MERGE recommendation, owner decision still required |
| Native profiling | Worker/shape depth, fonts, accessibility and performance on hardware before release |
| C-M1 | Resolved in D0: canonical technical boundary/no-double-counting contract; calibrate pace/risk before laps |
| C-M2 | Resolved in D0: ordered due-work pipeline/retained cadence; later retiming requires versioned review |
| C-L1/C-L2/C-L3 | Resolved in D0: registration/tests/research wording |
| Session identity | Calendar/event completion lifecycle and exactly-once results before persisted sessions |
| H1 | Historical V1–V5 contracts/fixtures and released calendar content preserved |
| M1 | Imperfect seeded scouting before expansion |
| M3 | playerTeamId-derived control before team chooser |
| M4 | Separate domain driver/car fit retained |
| M5 | Broader contract-rule overlap cleanup before expansion |
| M6 | Role grouping before multi-season/offseason |
| M7 | Archive/history growth by G |
| M8 | Originality/source rights and bibliography before public/commercial release |
| Persistence | Durable storage/atomic recovery before users depend on campaigns, no later than G |

L1–L10, balance, long-career/device profiling, annual phase limitations, recruiting/expiry vacancies
and missing payroll remain carried debt. No unrelated cleanup, retuning or gameplay expansion.

## NEXT MILESTONE

**OWNER VISUAL REVIEW — prior READY TO MERGE remains recommendation only.** Review Bible, portrait
screenshots and preview; do not merge
automatically. Qualifying and the weekly player-development loop remain paused. Stop after the
focused polish pass and its authorized branch-preview publication.

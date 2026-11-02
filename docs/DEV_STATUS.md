# Development status

## Milestone

**CORE GAMEPLAY FEEL V2 — WATCH THE WEEK: READY FOR OWNER PLAY-TEST** (branch `claude/adoring-brahmagupta-g738lm`,
from main `8716cd6`). Notes: [CORE-GAMEPLAY-FEEL-V2](development-notes/CORE-GAMEPLAY-FEEL-V2.md). Qualifying NOT started. Not merged.

- **COMPLETED:**
  - HQ development card: active, decision, ready and idle states.
  - CONTINUE WEEK / CONTINUE TO FP1, which returns to HQ.
  - MON–FRI replay of the processed week at 1×, 2× or Skip.
  - Department bubbles flowing into the card, with live bar, ETA and counters.
  - Stall, setback and breakthrough callouts, and stage-transition callouts.
  - Week summary, part completion with quality and reason, ready-and-waiting parts, honest fitting reasons and the
    race-weekend handoff.
  - Development rules 3: passive seeded weekly variation through existing kernel work and `bonusPoints`.
  - Save v7 with frozen v6 and identity migration.
  - Player Manual, architecture and contract docs.
- **IN PROGRESS:** none.
- **TESTED:**
  - 397/397 tests, 21 suites (16 new in `watchTheWeek.test.ts`).
  - TypeScript and the web export pass.
  - The existing UI suite passes in light and dark, and the theme suite passes, at 390×844 and 1440×1000.
  - New browser play-test passes: Floor career over 20 turns at phone size, plus 6 turns in each theme and size.
    No errors, no overflow; the 1× week measured 8.1–8.6 s.
- **NOT VERIFIED:** native iPhone feel and FPS, the live Cloudflare preview, multi-season balance of variation odds,
  and the owner's answer to "do I want to press Continue again?".
- **KNOWN ISSUES:**
  - The first turn of a career, and any Monday → FP1 turn, has no replay (work is credited at the Monday boundary).
  - Bubble values are small (2–3 points per day).
  - Variation odds and sizes are a first pass.
- **TECHNICAL DEBT / ARCHITECTURAL RISK:**
  - The week story recomputes the seeded swing instead of reading a stored log. This is pure and tested, but a future
    kernel change must keep `weekStories` in step with `rules3Week`.
  - V6 historical validation reads the static calendar registry, which is append-only.
- **Owner play-test fix 1** (owner saw no bubbles or progress during the week):
  - Pops now come from the department's desks, one per point, up to six per piece. Before, they needed seated
    workers, but every Continue restarts the HQ workday so most workers are still arriving.
  - Desks show a pulsing "working" marker (amber "!" on a struggling department).
  - Signs show a running "+5 RESEARCH this week" tally.
  - iPhone Reduce Motion no longer skips the replay or hides the pops; it only removes the movement.
  - Pop animation is now one simple JS-driven value.
- **Owner play-test fixes 2 and 3:**
  - On wide screens, the development card and the summary (now headed **REPORT CARD**) dock top-right.
  - A decision raised during the week pauses the replay. It stops on the day the project's stage began, or on
    Wednesday, after that day's work arrives, and the card prompts with the options.
  - Answering is the normal `decideProjectEvent` command and acts on the project from then on, never on the
    already-decided week. "Decide later" resumes, and the Monday default still applies. Skip stops at the decision.
  - The Report Card only lists decisions still unanswered. 398/398 tests.
- **Development decision interrupt pass:**
  - The player's Continue and +1 DAY are now the gated domain commands `continuePlayerTurn` and `advancePlayerDay`.
    They refuse with DECISION_REQUIRED while the player's own project has a pending event, so the normal flow never
    reaches the released Monday default.
  - HUD shows DECISION REQUIRED; the HQ card answers it inline. HQ priority: decision, ready part, work in progress,
    idle.
  - The replay holds on decisions (`stepPlayback`: Skip and 2× cannot pass them). The prompt states the week's
    results are already in and the choice applies from now on.
  - No save or rules change: events, the kernel default and v6/v7 semantics are untouched. 407/407 tests.
- **NEXT MILESTONE:** owner play-test of the week feel (pace, bubble size, swing frequency), then the qualifying design
  only on explicit instruction.

## Previous milestone

**WEEKLY DEVELOPMENT LOOP V1: OWNER PLAY-TESTED AND MERGED TO MAIN** (merge `4432478`, together with UI V1.1).
Save v6 and development rules 2 are now RELEASED: any change to the v6 event vocabulary or rules needs a new save version or rules version. Branch `feature/weekly-development-loop-v1`
(from the visual branch head `19961ff` and the approved design). Notes: [WEEKLY-DEVELOPMENT-LOOP-V1](development-notes/WEEKLY-DEVELOPMENT-LOOP-V1.md).
Qualifying and races were NOT started. Merged into main after owner approval; the merged tree equals the tested branch (380/380 tests, types, web export). The UI V1.1 status follows below.

### Weekly Development Loop V1

- **COMPLETED:**
  - Player projects via the shared `startProject` rules.
  - Weekly turn up to FP1.
  - Development rules 2: real race-weekend fitting, events, refine, hold and bonus quality.
  - Rivals on the same rules.
  - Save v6, with frozen v5 contract and fixture and v5 → v6 migration to rules 1.
  - Read models and Team hub, part selector, turn report, HQ department activity and bubbles.
  - Player Manual.
- **TESTED:**
  - 375/375 tests, 20 suites (21 new).
  - TypeScript and web export pass.
  - Existing UI and theme browser suites pass at 390 × 844 and 1440 × 1000 (both themes).
  - New browser loop passes: start projects, 20 turns, weekend fitting, decisions, HQ activity. No errors or overflow.
- **NOT VERIFIED:** native iPhone, live Cloudflare preview, multi-season balance.
- **KNOWN ISSUES:**
  - Single development season (stops at March 1, 2027).
  - Unfinished work is dropped at the reset.
  - Event odds and deltas are first-pass.
  - The turn report is not saved.
- **Play-test pass 1 (after the owner said the loop felt flat):** week replay, what-changed report, paddock news
  and more frequent decisions (9 events). 380/380 tests; UI and theme browser suites pass.
- **Post-merge UI review fix:** the prospect scouting report now shows "Last report week of Mar 23, 2026" (or "No scouting
  reports filed yet") instead of "2026 W0". Display only; saved observation fields unchanged. 381/381 tests.
- **NEXT:** second owner play-test on loop feel and balance before qualifying design.

## Milestone

**UI V1.1 + DEFAULT LIGHT / ALTERNATE DARK THEME COMPLETE — OWNER REVIEW.**
The owner paused feature expansion after D0. Qualifying has NOT started.

Branch: `feature/ui-visual-experience-v1`, from validated/published main
**200f4d61ff860537a1f5be6de1843f4888333912**. Main already contains C, its audit and D0; it is
unchanged by this UI branch. Reviewed V1 commit 9a95b7c was pushed with owner approval and the
owner reports its Cloudflare preview working. V1.1 continues the same authorized preview branch;
publication/build status is reported in delivery. No merge is authorized or performed.
Full handoff: [UI-VISUAL-EXPERIENCE-V1](development-notes/UI-VISUAL-EXPERIENCE-V1.md).

## COMPLETED

Default light theme continuation (base96ae582, same branch):

- Permanent Bible direction: dark racing shell + warm light content + strong accent colors.
  One shared semantic token contract and ThemeProvider; same screens/art/layout in both modes.
- Light default, real dark alternate via top-right control; web remembers appearance locally.
  Valid dark preference respected; invalid/denied storage safe. Theme is not campaign save state.
- Dark shared branded header, wide-screen side rail and phone bottom navigation. Existing five
  routes only; all Team/car/development/organization details use the same management treatment.
- HQ physical world unchanged; overlays/controls follow the theme. Team palettes unchanged,
  readable team-text correction only; portrait backing/car grounding fit either canvas.
- Native durable preference storage not implemented. No dependencies, gameplay/save changes,
  qualifying, weekly development loop or automatic merge.


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

Default light / alternate dark final validation:

- 354 tests/19 suites PASS; TypeScript PASS; web export PASS. Four new theme behavior/contrast
  tests; existing portrait transfers, game rules and released save regressions remain active.
- Actual app theme checks PASS390×844/1440×1000: default and stored preference, reload, denied
  storage, scouting/HQ/date surviving live toggles, canonical art colors unchanged, no errors/overflow.
- Full existing browser suite PASS in BOTH themes: data/disclosures, contracts/scouting/calendar,
  Team details, HQ taps, routes,8/8 and NEW DAY date preservation. No tests disabled.
- All game/simulation/persistence files unchanged from96ae582. `git diff --check` PASS.
  Screenshots: docs/screenshots/default-light-theme. Evidence: /workspace/artifacts/default-light-theme/.


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

- Native durable theme preference storage (not implemented); native appearance/accessibility/FPS.
  Web local appearance preference persistence is tested separately from volatile campaign storage.
- Public live-browser behavior of the new themed preview, independent of build-check status.


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

**OWNER VISUAL REVIEW — prior READY TO MERGE remains recommendation only.** Review Bible, light/dark
screenshots and preview; do not merge
automatically. Qualifying and the weekly player-development loop remain paused. Stop after the
focused polish pass and its authorized branch-preview publication.

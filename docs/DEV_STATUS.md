# Development status

## In progress: section 8 art approval step (awaiting owner OK)

- Style candidates only; **no in-game art has been replaced**. Review sheet: `docs/art-review/section-8/review.html`,
  with phone and desktop screenshots `review-phone*.png` and `review-desktop*.png`. Regenerate it with
  `node scripts/art-review/build-review.cjs` against a served `dist/`.
- `src/ui/art/vector/`: platform-agnostic templates returning shape lists plus an SVG serializer.
  - `helmetArt`: three-quarter helmet, 8 patterns, full and small detail, blue or team-tinted backdrop.
  - `carArt`: isometric open-wheel car, one geometry recoloured per team, full and small detail.
  - Covered by 7 tests.
- The two reference images were not received, so the sheet has empty reference slots; the candidates follow the
  written spec.
- **Owner decisions before the in-game swap:**
  - Style approval.
  - The rendering path. The Design Bible forbids DOM-only SVG and new graphics dependencies, but section 8 asks
    for SVG templates. Recommended: add Expo's `react-native-svg` and update the Bible in the same change.
    Alternative: re-express the shapes with View primitives, which loses the curves.

## Milestone

**FICTIONAL ROSTER + IMPORTABLE ROSTER PACKS** (built on `claude/blissful-mendel-y9g5tm` from `a204428`, then merged with Qualifying V1 from
`claude/happy-dirac-pw7zmq`).
Format guide: [ROSTER_PACKS](ROSTER_PACKS.md). Not merged.

- **COMPLETED:**
  - Roster swap (next-changes §7): every team and driver display name, colour, nationality label, archetype and
    bio now comes from the fictional roster. Old sound-alike names are gone from live code, tests, scripts and docs.
  - One data file, `src/game/roster/defaultRoster.json`: 11 teams, 22 race drivers, 21 free agents with names,
    colours, numbers, nationalities, archetypes, bios, helmet patterns and stats. It is shipped as the default
    full pack. Six roster free agents plus 15 new original names fill the existing 21 market slots.
  - Pack format v1 with a hand-written validator (`src/game/roster/validate.ts`), JSON Schema
    (`docs/roster-pack.schema.json`) and guide. Packs map by grid slot onto unchanged internal IDs, and anything
    left out falls back to the default pack.
  - Cosmetic packs: display-only layer (`game/roster/display.ts`), read by `teamBrand` and `driverView`. They apply
    to the running career; the simulation never reads them.
  - Full packs: stats enter only through `createGameUniverse(definition, seed, {roster})`.
    `planRosterApplication` refuses them for a running career. "Apply names and colours only" is offered instead.
  - SETTINGS → Roster packs: file picker (web) and paste box, field-level errors, team/driver preview, apply,
    start a new career with confirmation, reset to default, and download the default pack. The active pack is stored
    as a device preference (`formula-tycoon.roster-pack`), outside the save, and re-validated on launch.
  - Car numbers shown on roster rows and the dossier. Turn controls are hidden while settings is open.
- **Decisions (owner-approved):**
  - A: the default pack keeps the existing stats, age and home market on every slot; the roster file's 8-attribute
    ratings are not used. Lap times/grids are not affected because no race simulation exists yet; development,
    driver and contract results are byte-identical.
  - B: internal IDs stay. Old working names survive only as opaque ID tokens (`team.*`, `driver.*`,
    `performance2026` keys) and in frozen historical contracts and fixtures, which must not be rewritten.
  - C: original car numbers chosen to avoid any current real-grid number.
- **TESTED:**
  - 432/432 tests, 23 suites (23 new in `src/game/roster/__tests__/roster.test.ts`). TypeScript and the web export
    pass.
  - Determinism: for seeds 1, 7, 42 and 123456, a 20-turn Floor career hashes identically to the pre-change build,
    with display name/bio fields excluded. Passing the default pack gives the same result as passing none.
  - The sample cosmetic pack applied mid-career leaves the universe and serialized save byte-identical.
  - The sample full pack builds the expected stats, keeps every other slot equal to the default, is deterministic,
    and round-trips through save v7.
  - Validation errors, the stored preference and schema-vs-validator field parity are covered.
  - Browser: the new `scripts/check-roster-packs.cjs` passes at 390×844 and 1440×1000 in light and dark (32
    screenshots in `docs/screenshots/roster-packs/`). Existing `check-ui-visual-v1`, `check-themes` and
    `check-driver-portraits` pass after updating their expected names, team identity text and palette colours.
- **NOT VERIFIED:** native file import (native builds get the paste box only; no picker dependency was added), native
  storage of the pack preference, the live Cloudflare preview build, and the owner's review of the new team colours
  in HQ art.
- **KNOWN ISSUES:**
  - Shown age is the simulation age (decision A), so it can differ from the roster file's age column. Shown
    nationality is the pack label, while commercial region still follows the slot's original home market. The
    dossier's commercial line now shows region only.
  - `helmetPattern` is stored, validated and shown as a number in the preview, but the V1 portrait does not render
    variants yet (Design Bible rule). Teammates still look identical until the §8 helmet template lands.
  - Reset to default restores names and colours. A career started from a full pack keeps its stats until a new
    career is started.
  - Every launch is still a new career (no durable save). A remembered full pack therefore seeds each launch.
- **TECHNICAL DEBT / ARCHITECTURAL RISK:**
  - Opaque IDs and `PERFORMANCE_2026` keys still contain historical working names. Renaming them needs a save-v8 ID
    migration, and frozen v1–v7 contracts/fixtures would still hold the old strings.
  - Older milestone screenshots in `docs/screenshots/` still show the old names (images were not regenerated).
  - Legacy ten-team definition names (`src/game/development/teams.ts`) are frozen regression content and were left
    unchanged.
  - The display layer is a module-level singleton (`setDisplayRoster`). That is fine for one app-lifetime session;
    a multi-session host would need it scoped.
- **NEXT MILESTONE:** owner review of the import screen and new team palette, then the §8 helmet/car art approval
  step on explicit instruction.

## Qualifying (merged in from `claude/happy-dirac-pw7zmq`)

**QUALIFYING BROADCAST PRESENTATION: ITEMS 1–8 DONE, AWAITING OWNER REVIEW.** Branch
`claude/trusting-hamilton-r5g89o`, fast-forwarded onto `claude/happy-dirac-pw7zmq` (Qualifying V1, still unmerged).
Presentation only: no results, lap times, RNG keys, seeds or save shapes changed.

- **COMPLETED:**
  - 1–4 (owner-approved): broadcast palette and brand red; team colour bars, rings and card edges; bundled
    condensed/mono type; dense tower with code, gap, interval, last lap, S1–S3, tyre, position change; inspect panel.
  - 5: mini-sectors (4 per sector desktop, 3 phone, 6 in Your cars) fill white with the replay glide and take the
    stored sector colour once it exists.
  - 6: live track map for Melbourne only (`LIVE_MAP_TRACKS`), sector boundaries, team-colour dots, player cars
    ringed with codes. Car position = laps since leaving the pits at the shown beat (`TowerRow.onTrack`), gliding
    toward the next beat via the replay clock's `progress` (visual only; held at 0 when stopped/reduced motion).
  - 7: LIVE / PAUSED / FINAL header with pulsing dot, venue, Q1/Q2/Q3 badges, mm:ss countdown and part bar.
  - 8: result moments (helmet, team colour, huge position, headline + detail from `headlines.ts`) and the full grid
    always visible (two columns on desktop) with knockout lines from stored segments.
- **TESTED:** fingerprint test (seeds 11 and 42, recorded on the untouched engine) still passes; read-model tests for
  codes, interval, last lap, tyre, moved, onTrack; headline invariants over six headless seasons (pole, margins,
  teammate knock-outs, no pronouns); track geometry tests. 437/437 tests, TypeScript, web export; Playwright flow at
  390×844 and 1440×900 with no page errors or overflow.
- **NOT VERIFIED:** native fonts/animation on iOS and Android; the live Cloudflare preview; smoothness on low-end
  phones (22 animated dots plus mini-sector fills).
- **KNOWN ISSUES:** cars that left in the same minute share a beat position, so the map spaces them slightly in
  tower order; sectors are equal thirds of the outline (the outline is stylized). At Q2/Q3 start the arrows can show
  big jumps as the first timed cars pass untimed ones (true to the stored order).
- **TECHNICAL DEBT / ARCHITECTURAL RISK:** `expo-font` added plus ~570 KB OFL fonts. The track map draws ~160
  rotated Views; fine in Chromium, unmeasured on native.
- **NEXT MILESTONE:** owner review of the Melbourne map, then enable maps track by track (each needs a reviewed
  outline), or merge Qualifying V1 + this presentation.

## Previous milestone

**QUALIFYING V1: READY FOR OWNER PLAY-TEST.** Branch `claude/happy-dirac-pw7zmq`, from main `a204428`. Not merged.
Design and as-built notes: [QUALIFYING-V1-DESIGN](development-notes/QUALIFYING-V1-DESIGN.md).

- **COMPLETED:**
  - Headless engine in `src/simulation/qualifying`: Q1/Q2/Q3 knockout over 22 cars, a plan per car, one call per
    segment, tyre allowance, traffic, track evolution, seeded weather with research-driven forecasts, rival AI
    policy, and 1–3 stored reasons per grid entry.
  - Campaign integration: `QUALIFYING` (Saturday) and `QUALIFYING_CLOSE` (Sunday) instructions, plus a Saturday turn
    target with plan and call gates.
  - Save v8, with the v7 contract and validation frozen, a new v7 fixture from the released build, and a
    v7 → v8 migration (approved Research estimate, no backfilled grids).
  - UI: plan screen, live timing replay with the call card, Report Card, and the grid in RACE event detail.
    The turn bar shows PLAN QUALIFYING and QUALIFYING LIVE.
  - Player Manual qualifying section.
  - Play-test 2 (owner: "rolls through, too jumpy"): a sector-by-sector replay with purple/green/yellow sectors,
    a "Your cars" panel (out lap, flying lap, in lap) and a live feed. It lingers on action and moves faster
    through quiet minutes. Lap times are unchanged.
  - Play-test 3:
    - breaks after Q1 and Q2, with the next part's plan;
    - dimmed inactive cars, a drop-zone divider, pulsing rivals at the cut, sliding rows and Focus mode;
    - 4×, and "on pace for";
    - commentary plus team radio;
    - Q1 reaches its call in about 44 s at 1×.

    Golden hashes prove lap times and grids are unchanged.
  - Play-test 4 (layout and UI fixes):
    - desktop: two columns, tower on the left; call, break, Your cars and commentary on the right;
    - phone: the call is a collapsible bottom sheet over the tower;
    - Focus switches on while a call is open, so the drop-zone battle stays in view;
    - no-time cars have no position number and are grouped under "No time yet";
    - a finished lap flashes the row (it replaces the gold edge);
    - call options carry one-line consequences, and the call states the pace needed to get through (now, else from
      the previous part);
    - larger Q1/Q2/Q3 steps and a progress bar with time left;
    - +1 DAY is locked during a live session.
  - Event-driven calls (owner-approved):
    - a conditions change (rain or drying) or a yellow flag becomes the part's one call;
    - yellow flags offer abort or push through per affected car;
    - without an event, the fallback checkpoint call stays.

    Sessions without an event are byte-identical (77 recorded per-session fingerprints).
  - Red flags (owner-approved):
    - the session stops, and laps in progress are lost;
    - the clock pauses at the restart call: go out first, wait for a clean track, wait for the end, or stay in;
    - about 8% of parts; yellows about 12%.
- **IN PROGRESS:** none.
- **TESTED:**
  - 472/472 tests (23 in `qualifying.test.ts`). They cover: a valid grid in every round of a headless
    season; no double processing; determinism and reload at every status; choices mattering; a better car winning
    more often but not always; bounded variation; forecasts improving with research; policy independence; gates;
    validation tampering; and v7 fixture migration with a golden development continuation.
  - The v6 and v7 golden development hashes are unchanged, so qualifying never touches development.
  - TypeScript and web export pass.
  - Browser play-test (Playwright, web export, seed 1) at 390×844 and 1440×1000 in light and dark: FP1 → plan →
    lock → live → three calls → result → RACE grid → Monday. No console errors, no horizontal overflow.
    Wet sessions were also checked on phone.
- **NOT VERIFIED:** native iPhone; live Cloudflare preview; balance across a full multi-season career; owner feel.
- **KNOWN ISSUES:**
  - Calibration weights (car vs driver seconds, traffic, mistakes, rain odds) are provisional game weights, not
    researched facts.
  - The fastest car takes most poles at circuits where it has a clear edge.
  - No full wet tyres.
  - The replay position is session-only, so it restarts from the beginning after an app reload.
- **TECHNICAL DEBT / ARCHITECTURAL RISK:**
  - Session records store every lap, about 22 KB per round (about 0.5 MB per season). Compaction may be needed
    before multi-season careers.
  - `qualifyingValidation.ts` reads the live `FORMAT`/`qualifyingDate`. Any change to the format must freeze a
    copy and bump the save version.
  - `validateDevelopmentRulesV7` is shared by frozen v7 and current v8 validation (the same pattern as v6).
- **NEXT MILESTONE:** owner play-test of Qualifying V1. Then either race simulation (E) or a qualifying tuning pass,
  as the owner decides.

## Milestone

**CORE GAMEPLAY FEEL V2 — WATCH THE WEEK: MERGED TO MAIN** (`a204428`, owner-approved, PR #2).
Before merging, head `de312c8` passed 409/409 tests, TypeScript and the web export. Save v7 and development rules 3
are now RELEASED. Notes: [CORE-GAMEPLAY-FEEL-V2](development-notes/CORE-GAMEPLAY-FEEL-V2.md).

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
- **Core gameplay feel pass (on the decision-interrupt foundation):**
  - The replay shows a moved ETA and fit beside the old ones ("May 25 (was May 18) · now fits Monaco (was Montreal)").
  - A QUALITY UP/DOWN beat appears from the swing day, from the existing bonus points.
  - Bars slide as work arrives, and stage changes play in two beats (RESEARCH COMPLETE → DESIGN STARTED).
  - The HQ card carries a LAST WEEK alert: setback/breakthrough and ETA/fit change, session only.
  - Strong or slow weeks get one quiet summary line.
  - The race-weekend Report Card's primary action is CONTINUE WEEK, gated: one press instead of two when nothing
    happens at the weekend.
  - Phone callouts are clamped on screen. No simulation, save or rules change. 409/409 tests.
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

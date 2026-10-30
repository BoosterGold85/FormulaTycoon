# Development status

## Milestone

**UI / VISUAL EXPERIENCE V1 COMPLETE — READY FOR VISUAL REVIEW.**
The owner paused feature expansion after D0. Qualifying has NOT started.

Branch: `feature/ui-visual-experience-v1`, from validated/published main
**200f4d61ff860537a1f5be6de1843f4888333912**. Main already contains C, its audit and D0; it is
unchanged by this UI branch. This milestone is committed locally, unpushed/unmerged for review.
Full handoff: [UI-VISUAL-EXPERIENCE-V1](development-notes/UI-VISUAL-EXPERIENCE-V1.md).

## COMPLETED

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

None. Await human visual review. Do not begin qualifying, publish or merge this branch merely
because validation passes. Main and the preserved worker-art worktree stay unchanged.

## TESTED

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

- Human visual acceptance; native iPhone/Safari, native font rendering, accessibility services,
  FPS/battery and small worker-prop readability on hardware.
- Live branch deployment; branch remains unpublished. Local Chromium smoke is not live/native proof.
- Qualifying/race controllers, pace/risk calibration, dynamic conditions, results, actual-weekend
  fitting, future season calendars and 20–50-season gameplay.
- Durable device storage/import/recovery; adapter remains volatile.
- Direct circuit-source retrieval or missing bibliography. Existing externally verified owner
  research remains honestly recorded (19 HIGH/four MEDIUM); no new source verification claim.

## KNOWN ISSUES

- V1 graphics use symbolic helmet identities and stylized circuit artwork, not likenesses or
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
| UI review | Human visual review before further feature expansion |
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

**READY FOR VISUAL REVIEW.** Review the screenshots and UI first. Qualifying remains paused.
Do not push/merge or implement qualifying without a separate instruction. Stop after this pass.

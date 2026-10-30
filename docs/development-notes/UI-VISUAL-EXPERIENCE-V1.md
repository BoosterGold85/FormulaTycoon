# UI / Visual Experience V1

## Outcome

**READY FOR VISUAL REVIEW.** Qualifying remains unstarted. This is a presentation and read-model
milestone, not a new management/racing feature. No push or merge is included.

Branch: `feature/ui-visual-experience-v1`, created from stable main
**200f4d61ff860537a1f5be6de1843f4888333912**. D0 a446cfa was already merged at f915c9f and
validated/pushed before this work. Main is unchanged by this feature branch. The old graphics
branch remains preserved at `1cfb07d`; it was not merged.

## Design philosophy and ownership

SHOW THE PLAYER WHAT THEY NEED TO KNOW FIRST. LET THEM TAP FOR DEPTH.

**GLANCE → UNDERSTAND → TAP → INVESTIGATE → ACT.**

- First-level screens show decision-level information.
- Second-level screens show management detail.
- Deeper views show analytical detail.

Presentation belongs to `ui/design`, screen components and original illustrative artwork. Existing
domain selectors remain authoritative. The same App-lifetime universe and mounted HQ are retained.
Local state contains filters, selected identities/events/months and disclosure expansion only.
No new persistence, clock, RNG, performance truth, contract rule or gameplay command.

The principal risks were losing useful data behind disclosure, incorrect calendar dates, exposing
hidden values, resetting the universe on navigation, interfering with worker routes/taps and
implying that future mechanics exist. Validation exercises those boundaries rather than snapshotting
colors or counting component tags. Native performance remains a separate unverified concern.

## Shared visual system

`ui/design/tokens.ts` owns dark navy/charcoal layers, warm text, blue team-oriented accent,
semantic green/gold/red, a 4/8/12/18/24/32 spacing scale and 11/12/14/20/30/36 typography scale.
`Icon` provides consistent symbolic navigation/action marks. `system.tsx` provides:

- Screen/page header and Section header.
- Primary Card, CompactRow and team accent border.
- Chip and GradeBadge.
- Primary/secondary Action with 44px-or-larger control height.
- Disclosure with explicit expanded accessibility state.
- Fact rows and EmptyState.

Portrait identity uses original stylized helmets/initials, not likenesses. Original car, garage,
trophy and 23 circuit motifs provide graphics without external assets or new dependencies.
Circuit illustrations are deliberately stylized, not surveyed maps or technical geometry; the
briefing and manual say so. Their coordinates never reach simulation.

HQ structure is preserved, including HUD, miniature scene, worker/department cards and NEW DAY.
Bottom navigation shares graphical icons and keeps stable accessible tab names. History is now
an available navigation destination containing an honest empty state.

## Drivers roster and dossier

DRIVERS starts with the two actual player race-seat drivers. Each compact row shows identity,
team, Talent grade/range, current form and contract horizon. No six-grade block, salary clauses,
full scouting explanation or overall rating appears in the list.

The market groups are Available, Prospects, Reserves and full Grid. Available excludes prospects
and contains people without current employment; overlap with the Reserve cohort is intentional.
Counts and membership come from a read model composing existing driver disclosure. Uncertainty
is preserved in grade ranges; no hidden raw values become public.

DriverProfile is shared by DRIVERS and TEAM. Its identity hero leads to six graphical grade tiles,
current form/car comfort/familiarity and specialties. Contract details, scouting, background/
commercial and career detail expand independently. Salaries, expiry, options, source status,
affiliations and owned option actions remain available. Scouting still dispatches the same free,
instant prototype command. No new ability, dynamic form or employment rules.

## Race calendar and event detail

RACE opens on a strong next-event hero and a Monday-first month grid. Its month cursor is UI
state, not campaign time. All actual weekend dates are marked, including Thursday–Saturday
weekends and the October/November Mexico crossing. Current date, next event, Sprint, passed
and future weekends have distinct visual treatment. Month navigation does not advance time.
Only that month's compact event rows appear; no stack of 23 full technical reports.

A marked date, event row or View weekend opens the same public event-detail selector. Identity,
dates, illustrative silhouette and up to four high/very-high published demands come first,
followed by qualitative fitted-car suitability, strengths and concerns. More details retains all
11 demands, rationale, provenance-related provisional warning where applicable, and limitations.
Sorting published qualitative labels controls display priority, not performance weights.
No normalized car values, internal field rank, cubic formula, lap time or result prediction.

The existing researched v2 Madrid/Singapore/Melbourne/Mexico corrections remain visible through
the deeper view. V1 content and identity remain intact. No Practice/Qualifying/Race controller,
new event-advance button or placeholder result was added.

## Team dashboard and History

TEAM is an executive overview: actual driver/staff/project pulse; illustrated fitted car with
suitability explicitly AT THE NEXT CIRCUIT; compact driver pairing; actual development; and HQ.
Car detail exposes qualitative strengths/concerns and fitted component spec identities, not a
universal car rating. Development shows actual stage/current-stage progress when a project exists,
or an honest empty state. There are no invented completion dates, project 62%, cash or morale.
Organization detail shows visible HQ worker-state counts, not a fake full staff/finance model.

Manage drivers opens DRIVERS; team driver rows open the shared dossier. These routes do not create
another universe. HISTORY uses an original trophy graphic and a future-records empty state,
without fabricated wins, podiums, championships or historical seasons.

## HQ art selection

Selectively ported exactly five cosmetic files from **1cfb07da50f662451965cb854842777235a099d4**:
WorkerArm, WorkerFigure, WorkerSprite, workerAppearance and workerPoses. No App, hook, HUD,
simulation, data, save or documentation file was copied from that old branch.

Head size reduces 7.5→5.8 relative units; torso broadens and leg length increases 5→7.5. Neck,
shoulders, separate legs/boots, costume shape, caps/headsets, gloves/hi-vis, tablet/tools/boxes
and two ground-shadow layers improve silhouettes and role differentiation.

Eight cosmetic pose variants: IDLE, WALK, SERVICE, INSPECT, DESK, SIMULATOR, FABRICATE and CARRY.
Each arm uses upper arm → visible elbow pivot → forearm → hand/tool, with independent near/far
shoulder and elbow animation. Existing activity periods, movement interpolation, route anchors,
assignments, depth/interaction and work simulation remain unchanged. Small props still need
native-device readability/performance review.

## Read-model additions and save decision

- `simulation/calendar/monthView.ts`: actual calendar content + root date → 42 calendar slots,
  real date membership and existing event-status disclosure. Cross-month weekend coverage tested.
- `simulation/managementViews.ts`: existing driver views, next-event briefing, project stage and
  HQ counts → roster/team read models. No fitted effects or development forecasts are invented.

These are read-only composition queries, not new advancement engines or rules. Existing development,
drivers, contracts, suitability, RNG, headquarters engines and persistence are unchanged.
External schema stays **v5**, trusted checkpoint **v3**. No persistent structure change warrants
migration. All 11 original historical hashes and both calendar hash regressions still pass.

## Validation

Executed with existing dependencies only:

- `npm test -- --runInBand`: **PASS 346 tests /17 suites**, zero failing/skipped. Includes all C/D0
  behavior, migrations, frozen contracts, driver/contract/HQ and new read-view regression tests.
- `npm run typecheck`: **PASS**.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: **PASS**,712KB JS,
  `index-fa7a04f6fc5c5b63c523b43c31615e6a.js`.
- `FORMULA_PREVIEW_URL=http://127.0.0.1:8781 FORMULA_ARTIFACT_DIR=/workspace/artifacts/ui-visual-v1/browser node scripts/check-milestone-c.cjs`:
  **PASS 390×844 and 1440×1000**, zero page errors/horizontal overflow.
- Independent original-Git-object historical byte/SHA comparison: **PASS 11/11**.
- `git diff --check`: **PASS**. No package, lockfile or dependency changes/install.

C's browser entry point now delegates to `check-ui-visual-v1.cjs` so the SAME contract, disclosure,
calendar and HQ invariants are exercised through current controls. Coverage includes own 2/grid 22/
prospects 10/reserves 11, all specified salaries/options/deadlines/provenance, no rival option control,
scouting uncertainty/review/navigation persistence, team car/development/organization/dossier paths,
all 23 events/six Sprints/nine researched details, History, worker/department taps, date-preserving
NEW DAY and repeated 8/8 working. Desktop navigation/overflow also tested.

Initial validation found a stale source-file assertion after extracting DriverProfile, a browser
heading locator using CSS-uppercase text, and an unsupported arrow glyph/clipped miniature drawing
on first visual inspection. These were corrected; the domain-boundary assertion remains enforced
in the extracted dossier. No assertions were disabled or gameplay workaround added. Existing npm
update/color-environment notices are nonblocking. Native iPhone/Safari/FPS/battery are NOT VERIFIED.

Logs/evidence: `/workspace/artifacts/ui-visual-v1/`. Web smoke is local; no live branch deployment
was created or tested. All screenshots are actual app renders, not generated mockups.

## Screenshots

Six 390×844 CSS-viewport renders at 2× pixel density are checked in for review:

- [HQ](../screenshots/ui-visual-v1/01-hq.png)
- [Drivers roster](../screenshots/ui-visual-v1/02-drivers-roster.png)
- [Driver dossier](../screenshots/ui-visual-v1/03-driver-profile.png)
- [Race calendar](../screenshots/ui-visual-v1/04-race-calendar.png)
- [Event detail](../screenshots/ui-visual-v1/05-event-detail.png)
- [Team dashboard](../screenshots/ui-visual-v1/06-team-dashboard.png)

[Offline gallery](../screenshots/ui-visual-v1/index.html). The screenshot timing can show staff still
arriving on TEAM and fully working later on HQ; these are actual states from the same test session.

## Known limitations and stop

Visual review is still a human gate. Symbolic helmets/cars and stylized circuit motifs are V1 art,
not photographic likenesses or precise maps. Native font rendering, small worker prop readability,
real-device performance and accessibility services are unverified. Mobile/desktop Chromium coverage
is not native hardware proof. Detail views reset to their header on entry/back; no navigation
history persistence is saved. The approved 2026 calendar remains the only released season content.

No hiring/development-management UI, payroll, real finance/morale, durable device storage,
qualifying, race sessions/results, weather or long-career loop was introduced. The UI honestly
reflects these boundaries. Car/driver ratings, contracts, track-fit calculations, development
balance, saves and RNG remain unchanged. Existing A/B/C/D0 debt remains in DEV_STATUS.

The branch is committed locally for visual review. Do not publish/merge or begin qualifying merely
because this pass is complete. **READY FOR VISUAL REVIEW.**

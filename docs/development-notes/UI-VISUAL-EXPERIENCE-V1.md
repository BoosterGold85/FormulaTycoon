# UI / Visual Experience V1

## Original V1 delivery — 9a95b7c

**READY FOR VISUAL REVIEW.** Qualifying remains unstarted. This is a presentation and read-model
milestone, not a new management/racing feature. V1 was initially delivered locally; the owner
subsequently authorized preview publication and confirmed the Cloudflare preview works. V1.1
polish is recorded below. Neither version has been merged.

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

V1 was delivered for visual review, then published with owner approval. The subsequent V1.1
review below supersedes that initial recommendation. Do not merge or begin qualifying automatically.

## V1.1 focused polish — READY TO MERGE

Continues the reviewed 9a95b7c on the SAME feature/ui-visual-experience-v1 branch. The owner
reported the V1 Cloudflare preview working. This pass preserves navigation, month browsing,
roster→dossier, Team drill-downs, disclosures, History and the same HQ/universe owners.
It changes presentation only. Main stays 200f4d6, unmerged; qualifying and the new weekly
player-development loop remain unstarted. Publishing uses the already authorized preview branch;
current commit/build status is reported in the delivery, not invented here.

### Objects and identity, fewer containers

Hero surfaces are flatter and quieter. Meaningful car/next-weekend objects can be tapped across
their whole surface, with one accessible button and no nested button. Secondary actions and
disclosures use open divider rows. Market/personnel lists and grade displays no longer repeat
rounded panel borders for every value. Shared design-system ownership remains intact.

The player's two personnel rows get 72px open helmet identities, team-color rails, larger names
and one clear Talent grade. Team, form and contract horizon remain compact. Market rows are
quieter and separated by rules. The generic promotional market card was removed; no actual
information was removed. All grade ranges/uncertainty and group membership remain unchanged.

Dossiers use a larger 140px helmet, two-line driver identity where needed, nationality/age,
role, team, form and short car-comfort status. Stripe variation is deterministic cosmetic name
art, not a performance trait or RNG. Six grades scan as open typography with dividers, followed
by specialties, car fit and familiarity. Career stage joins background disclosure; all contract,
scouting, commercial and recorded-history data remains reachable through the same controls.

### Race calendar, next race and event detail

The Next Race hero leads with venue, artwork, dates, prominent countdown, actual Sprint indicator
when applicable, car suitability and the full-surface View weekend action. The month calendar
sits on the page rather than in another enclosing card. MON–SUN headers, a circular current-date
marker and restrained weekend/Sprint bands give the dates priority over technical information.
All cells retain comfortable hit areas. The legend fits the initial 390×844 viewport.

Event detail places a compact venue/circuit identity above suitability, the single key strength
and main concern. Only THREE defining published demands appear initially; remaining demands,
all strengths/concerns, status, rationale and caveats remain under More details. No normalized
values or ranking appear. All statuses and technical answers still come from existing selectors.

### Team command center and development structure

The next-circuit car hero now immediately shows the major strength, concern and contextual
suitability. It is fully tappable; suitability remains explicitly tied to the upcoming venue,
never universal car overall. Drivers, development and organization follow as open sections and
compact whole-row interactions. Duplicate pulse pills and repeated marketing copy were removed.
Organization philosophy moved from the page subtitle into organization detail, where the
existing canonical text remains available; it is not a newly invented health rating.

DevelopmentSummary is a presentation component for actual project/part, current stage and
supplied CURRENT-stage percentage, with a factory-work illustration and stage rail. It is shared
by the overview and deeper project list, allowing future causal notes/events to extend the same
structure without inventing systems now. No completion estimate is available in the existing
read model, so none is fabricated. No Aero/Technical/research points, hiccups, breakthroughs,
start-project controls or weekly-loop rules were added. The initial career honestly has no
active projects and uses a quieter intentional factory empty state.

### HQ review

HQ layout, worker art and the entire renderer/animation implementation are unchanged from V1.
At 390×844 the worker bodies, costumes, work poses and ground shadows remain readable in context;
engineer desks, mechanics at cars and logistics/manufacturing colors/location distinguish roles.
Individual elbow joints and small tools/headsets are tiny in the full-HQ overview. Adding more
micro-detail would add noise, so no speculative cosmetic correction was made. Native-device
legibility/performance remains unverified. Worker/department taps, arrivals and repeated 8/8
working after NEW DAY passed again; NEW DAY still preserves campaign date.

### Information moved deeper

- Career-stage context moved into dossier background; contract/scouting/background/history
  remain independent disclosures.
- Event detail initially shows one strength/concern, with the full lists under More details.
- All 11 circuit demands remain available; only three defining demands lead the briefing.
- Detailed organization/development/fitted-part information stays in the existing drill-downs.
- Decorative/promotional containers and duplicate summaries were removed, not underlying data.

### Visual self-review

This is screenshot-based author inspection, not a measured new-player usability study.

| Screen | Three-second question | Obvious next action | Depth / game-feel review |
|---|---|---|---|
| HQ | Team workplace and working state are clear | Tap a person/department, or NEW DAY | Existing miniature campus remains the benchmark; tiny props need hardware review |
| Drivers | These are my two named drivers | Tap the full personnel row | Helmet/name dominate, one ability only; market sits below as a quieter list |
| Dossier | Who is this driver and what are their strengths? | Read six grades, then open contract/report | Large racing identity and open grade typography replace stacked mini-panels |
| Race | Melbourne is next, in 4 days | Tap the full next-race hero, a marked date or month arrow | Recognizable month calendar, current date and Sprint legend; no technical wall |
| Event | Venue, fitted-car suitability, one strength/concern | More details | Three defining demands; complete analytics preserved deeper |
| Team | How is the car suited to the next venue, who drives, what is in progress? | Tap car, driver, development or organization | Contextual car/part imagery and open management sections; no fake financial health |

Self-review caught COMPETITIVE wrapping to a lone final E in the Team hero. The art/text widths
and label size were corrected, then a mobile one-line browser guard was added. A slightly shorter
next-race drawing brings the calendar legend into the first viewport. Final screenshots were
inspected again after those corrections.

### V1.1 validation

- `npm test -- --runInBand`: **PASS 346 tests /17 suites**, no failures or skips; no tests disabled.
- `npm run typecheck`: **PASS**.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: **PASS**, 718KB JS,
  `index-7b6ab765dee61a52687feb9515d5a9dc.js`.
- `FORMULA_PREVIEW_URL=http://127.0.0.1:8783 FORMULA_ARTIFACT_DIR=/workspace/artifacts/ui-visual-v11/browser node scripts/check-milestone-c.cjs`:
  **PASS 390×844 and 1440×1000**, no page errors/horizontal overflow. Includes all prior contract,
  scouting, group counts, 23 rounds/six Sprints/nine researched details, all Team drill-downs,
  History, navigation, HQ cards, date-preserving NEW DAY and repeated 8/8.
- Additional browser guards cover the unbroken mobile suitability label and at most three initial
  demands with deep technical background hidden before disclosure. Existing complete demand/
  provenance assertions still execute after expanding it.
- **111/111** tracked game/simulation/persistence files are byte-identical to reviewed 9a95b7c,
  including both V1 read models. Historical original-Git-object checks: **PASS 11/11**.
- `git diff --check`: **PASS**. No package/lockfile/install or save migration. External save stays
  v5 and checkpoint v3. All gameplay, canonical content, RNG and D0 processing are unchanged.

Only existing npm update/color notices. No native performance claim. Live public V1.1 browser
behavior is unverified from this sandbox; Cloudflare build evidence is checked after publication.
Evidence/logs: `/workspace/artifacts/ui-visual-v11/`.

### Updated required review artifacts

Six actual 390×844 app PNGs, captured with CSS-pixel export, plus a combined review sheet:

- [HQ](../screenshots/ui-visual-v1.1/01-hq.png)
- [Drivers roster](../screenshots/ui-visual-v1.1/02-drivers-roster.png)
- [Driver dossier](../screenshots/ui-visual-v1.1/03-driver-dossier.png)
- [Race calendar](../screenshots/ui-visual-v1.1/04-race-calendar.png)
- [Event detail](../screenshots/ui-visual-v1.1/05-event-detail.png)
- [Team dashboard](../screenshots/ui-visual-v1.1/06-team-dashboard.png)
- [Combined review sheet](../screenshots/ui-visual-v1.1/review-sheet.png)
- [Offline gallery](../screenshots/ui-visual-v1.1/index.html)

These are actual browser renders, not generated mockups. The original V1 screenshots are retained.

### Remaining visual debt and recommendation

Native fonts, accessibility services, worker micro-props, phone FPS/battery and personal visual
preferences still need real-device/human review. Helmets/cars remain symbolic and circuit outlines
illustrative, not likenesses or surveyed maps. The initial live career has no active project;
the active-project layout is implemented against the existing read model but is not a newly
played weekly-development scenario. No fake test project was inserted into the player experience.
History and unavailable management/racing systems stay honestly empty/unimplemented.

The visible wrap defect is resolved and no further blocking visual defect was found in the
reviewed phone/desktop flow. **READY TO MERGE.** This is a recommendation only: do not merge,
start qualifying or begin the weekly development game without another instruction.


## V1.1 permanent Graphic Design Bible and driver portraits

Owner follow-up, October 30, 2026. Base af80f34, same `feature/ui-visual-experience-v1` branch.
The earlier helmet/initials graphics are superseded by one anonymous shoulders-up driver template.
No further milestone, merge, qualifying or weekly development loop is authorized by this task.

### Ownership and boundaries

- Permanent source: [Graphic Design Bible](../GRAPHIC_DESIGN_BIBLE.md), linked from AGENTS,
  guardrail36, brand policy, architecture and future milestone prompt requirements.
- Palette owner: existing canonical `game/brandRegistry`, extended with secondary/accent only;
  existing primary/gameplay properties retained. `color` aliases the same authored primary.
- Presentation: `DriverPortrait` receives only colors/size; `TeamDriverPortrait` resolves current
  employment from existing read-model teamId. One template on roster, dossier and compact Team rows.
  No portrait variants, initials, names, sponsors, faces or real likenesses baked into the artwork.
- Persistent state affected: none. No driver art fields, save change/migration, cached team colors,
  RNG call, ability, contract rule, scouting rule, performance or campaign-time change.
- Edge cases: neutral unassigned/expired identity; fixed charcoal visor; missing accent → white;
  near-equal primary/secondary → the higher-contrast white/charcoal presentation fallback.
  Canonical palettes never mutate. Test palettes are acceptance fixtures, not alternative team data.

### Validation actually run

- `npm test -- --runInBand`: **350 tests /18 suites PASS**, zero failed/skipped.
  Four new behavioral tests exercise mounted-template recoloring/geometry, a real domain signing
  and same-mounted-component transfer/expiry, stale familiarity, all eleven palette aliases and
  fallback/card-scale behavior. Existing historical/migration/regression tests remain active.
- `npm run typecheck`: PASS. Initial test-file missing Jest imports were corrected; final check passes.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: PASS, no install or package/lockfile change.
- `node scripts/check-driver-portraits.cjs`: PASS. Actual component rendered through existing RN Web;
  three palettes ×80/100/120px, all six color regions and fixed visor checked. Production exported
  app: two 80px own portraits, 140px dossier, rival palette, 390×844 and1440×1000; no errors/overflow.
- `FORMULA_PREVIEW_URL=http://127.0.0.1:8783 FORMULA_ARTIFACT_DIR=/workspace/artifacts/driver-portraits/regression node scripts/check-milestone-c.cjs`:
  PASS mobile/desktop, all prior data/actions/HQ/8-of-8/NEW DAY/date/disclosure coverage retained.
- Scope proof: of111 tracked game/simulation/persistence files, only canonical brand presentation
  metadata changes. All simulation and persistence files unchanged;18 historical contract/fixture
  files byte-identical to af80f34. Existing immutable-calendar/hash tests also pass.
- Final `git diff --check`: PASS. Logs under `/workspace/artifacts/driver-portraits/`.

### Visual review and limitations

[Review assets](../screenshots/driver-portraits/README.md): actual roster/dossier/rival phone renders,
desktop dossier, and one-template three-palette card-size review sheet. The sheet renders the actual
component through React Native Web, not an AI mockup. First visual review simplified a robotic-looking
chin and increased visible primary-color suit area. Final review confirms broad helmet/visor/shoulder
silhouettes at80px. Identical teammates intentionally share an image; names distinguish them.
Market rows remain48px subordinate thumbnails, not the80–120px featured-card acceptance size.
No native-device, assistive-technology, FPS/battery or public workers.dev runtime proof is inferred.
The supplied car reference informed broad shapes/shading only; cars/HQ were not redrawn. No separate
shoulders-up reference file was available; the written helmeted-driver composition governed the art.

READY FOR OWNER VISUAL REVIEW; previous READY TO MERGE recommendation remains a recommendation
only. Main unchanged. Any branch publication continues the already-authorized same preview branch;
Cloudflare status and actual commit hash are reported in delivery. Stop before new gameplay work.


## Default light theme follow-up

Owner-approved continuation on the same UI branch, base96ae582. Permanent visual direction now is
**DARK RACING SHELL + WARM LIGHT CONTENT CANVAS + STRONG ACCENT COLORS**, recorded in the Bible.
Warm cream canvas/cards, navy readable text, neutral borders/soft shadows and red interactions are
the default. Dark remains a real alternate using identical screens, components and information.
The supplied Drivers/Race concept is direction for surfaces/shell, not a claim of matching its
illustration fidelity. No new art-production or gameplay milestone starts.

### Ownership and scope

- One semantic token contract in `ui/design/tokens.ts`; `ui/theme.tsx` owns preference/context.
  Existing shared primitives and screens consume runtime tokens rather than module-level colors.
- Shared dark branding/date/event header across tabs; same five existing routes with a desktop
  side rail and mobile bottom strip. No Staff/Standings/Finances/Settings placeholders invented.
  Existing Team car/development/organization details receive the same surface treatment.
- Web preference only in `formula-tycoon.theme`; default light, respect valid local dark selection,
  invalid/denied storage safe. No gameplay save change, migration or new persisted campaign field.
  Native uses light/session-local selection; no native durable preference adapter installed.
- Same mounted campaign and screens on theme changes. HQ physical environment/worker art untouched;
  its controls/cards follow the theme. Canonical team colors unchanged. Text-only contrast fallback
  keeps team labels readable; neutral portrait backing and car shadows follow their canvas.
- Future management screens must use the same tokens/Bible. No qualifying/weekly loop or merge.

### Final validation

- `npm test -- --runInBand`: **354 tests /19 suites PASS**, no failures/skips. Four new theme tests
  cover default/preference/denied storage, same-mounted-child state, semantic contrast and all11
  team label corrections without identity mutation. Existing portrait/transfer tests retained.
- `npm run typecheck`: PASS.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: PASS. No install, package or lockfile change.
- `node scripts/check-themes.cjs`: PASS both390×844/1440×1000. Actual exported app checks light
  default, saved dark, reload preference, denied storage, team colors unchanged, scouting report
  surviving live toggles, HQ8/8/date preserved, all existing details/navigation and no errors/overflow.
- Full existing browser regression runs in both modes via `node scripts/check-milestone-c.cjs`,
  using `FORMULA_THEME=dark` for dark. Both PASS mobile/desktop,23 rounds/six Sprints/nine details,
  grades/contracts/options/scouting, Team drill-downs, HQ cards/NEW DAY/8-of-8 and root date.
- All tracked game/simulation/persistence files byte-identical to96ae582. Existing migrations,
  released hashes and original calendars remain covered. `git diff --check` PASS.
- Initial contrast test exposed weak selected-calendar/accent pairs; semantic colors were corrected.
  The new screenshot harness initially tried reselecting the current Drivers tab to leave a dossier;
  corrected it to use the existing Back action. These were reproduced and final checks rerun.
- Evidence: `/workspace/artifacts/default-light-theme/`.

[Theme screenshots](../screenshots/default-light-theme/README.md) include both modes at phone and
desktop sizes, actual roster/dossier/calendar/event/Team/car/HQ overlay. Native iPhone/Safari,
assistive technology, FPS/battery and live public workers.dev browser behavior remain unverified.
Artwork is the existing lightweight symbolic/component art; this task does not redraw it to the
reference's fidelity. Local web preference is not a durable campaign-save implementation.

Stable continuation is committed/published only to the already-authorized UI preview branch.
Main stays200f4d6. Delivery supplies exact commit/build status. Stop after the visual task.

# Post-Milestone C audit

## Overall decision

**READY TO MERGE WITH DEBT.** No BLOCKER or HIGH-severity defect was found in the current C
slice. Two MEDIUM integration obligations must be resolved before the first qualifying/event
consumer; three LOW items are scheduled below. This verdict does not authorize a merge or D.

Audited commit: **1290bb3e8485a441477a495cc4443f56e9e36edf**, branch
`feature/milestone-c-track-performance`. Main must remain **36e7df0**. The review inspected actual
source, schemas, immutable content, tests and browser behavior rather than accepting the handoff's
pass counts. Existing implementation/research commits and the separate worker-art worktree are
preserved. No production code, game data, tests, dependencies or gameplay rules were changed by
this audit; only this report and DEV_STATUS are updated. The audit commit remains local.

## Blockers

None found. No immediate fix under the audit auto-fix policy was required.

## High findings

None found. No reproduced save corruption, current clock divergence, invalid canonical calendar,
nondeterministic state, duplicated authoritative performance state or serious UI/domain violation.

## Medium findings

### C-M1 — Define the consume-once performance/context contract before qualifying

**Issue/evidence:** `technicalCar(team, profile, track?)` has both a base and circuit-contextual
mode; passing a track already applies matching packages and the legacy static heat/reliability
adjustment. `evaluateCarAtTrack` then derives suitability from those same values. No race consumer
exists yet, but the future-loop prose lists pace and car/track fit side by side without an explicit
consume-once rule. Eleven output axes also share seven source quantities: low-speed, medium-speed,
braking and mechanical grip are correlated proxies, not independent measurements.

**Why it matters:** a future lap model could add a fit bonus to an already track-weighted vector,
add the old average `pace` again, apply a package/thermal effect twice, or treat the reliability
component of a mixed suitability score as extra speed plus failure resistance. `TechnicalVector`
also names both 0..1 circuit demands and 0..100 car values; units/context need to be explicit at
the future boundary. These are concrete integration risks, not a current double-counting defect.

**Affected:** `src/simulation/trackPerformance/carVector.ts:9`, `trackPerformance/index.ts:16`,
`src/simulation/development/carModel.ts:26`, `src/game/calendar/types.ts:7`, `docs/GAME_LOOP.md:18`.

**Recommended fix:** before the first lap model, specify one domain composition path: fitted
truth → configuration/context once → one calibrated technical response to the circuit. The fit
label/explanations are disclosure of that response, **not an additional independent bonus**.
Do not stack legacy average pace or count correlated proxies as independently measured gains.
Distinguish pace response from cooling, tyre and reliability/hazard effects; apply each once.
Use explicit input units and keep driver attributes, driver/car comfort, form, weather and strategy
as separate inputs. Add integration tests for package/context and vector-versus-fit double counting.
No formula, vector dimensionality or race implementation is changed in this audit.

**Due:** before implementing the first D qualifying-lap calculation or any race consumer.

### C-M2 — Resolve dated event progression versus the preserved fitting kernel deliberately

**Issue/evidence:** the playable registry contains the approved 23 dated events, but
`advanceDevelopmentWeek` still fits READY work at the old 24-event `development.calendar` weeks.
The first compatibility fitting event is BHR/week10, mapped by C0.1 to **2026-05-11**; the first
playable weekend begins **2026-03-06**. Calendar status is date-only and no result/session state
or event-aware advancement UI exists. This separation is documented and intentionally preserves
existing development balance/RNG/history, so it is not an accidental duplicate playable calendar.

**Why it matters:** blindly wiring Advance-to-Qualifying/Race to the displayed schedule will not
make READY upgrades fit at those weekends. Replacing the old calendar in place can instead change
planning, historical event references and deterministic continuation. Date-passed COMPLETED must
also never become proof that a session/result/reward was processed.

**Affected:** `src/game/development/calendar.ts`, `src/simulation/development/world.ts:98`,
`src/simulation/universe/index.ts:35`, `src/simulation/calendar/index.ts:5`, calendar v1/v2 content.

**Recommended fix:** choose and document the event/weekly-work ordering and fitting policy before
connecting dated player advancement to sessions. Introduce any changed cadence through explicit
content/save/replay compatibility work with existing pending projects and histories preserved.
Keep date-derived calendar status separate from actual session/result processing. When session
records are introduced, retain their calendarId/event identity instead of resolving old results
against a later live default. Do not delete the compatibility kernel or fabricate results now.

**Due:** before D exposes event-directed advancement/fitting; archive identity before persisting
session/results. Full offseason remains later scope.

## Low findings

### C-L1 — Authoring validation and content-ID registration can disagree during expansion

**Issue/evidence:** the catalog's data list and `RELEASED_CALENDAR_IDS` are separate maintained
lists. The current two entries agree and unknown saves fail safely. However, authoring validation
accepts a clone with `id = calendar.2027.v99` while season/events remain 2026: ID syntax and season
are checked separately. There is no single catalog-wide check for duplicate calendar IDs or for
registry/catalog equality. `profileVersion` is only checked for nonempty text.

**Why it matters:** a future content addition can register a save ID that cannot be resolved, shadow
a catalog entry, or mislabel its season. Current frozen v1/v2 are consistent and hash-protected;
this is an authoring/maintenance gap, not currently invalid canonical data.

**Affected:** `src/game/calendar/index.ts:12`, `releasedIds.ts:2`,
`src/simulation/calendar/validation.ts:9`, `src/persistence/universeValidation.ts:12`.

**Recommended fix:** add small catalog-wide invariants/tests for unique IDs, registration/lookup
agreement, season/ID coherence and the intended profile-version relation. Preserve lightweight
static registration and immutable revisions; no new registry framework is needed.

**Due:** before the next calendar revision or first additional season is authored.

### C-L2 — Some test titles promise more than their assertions prove

**Issue/evidence:** `trackPerformance.test.ts:104` says contrasting designs can reverse ordering,
but asserts only a target gain and a larger gain than another circuit. Both gains could remain
positive, so that test alone does not prove a reversal. Pending-project exclusion and all-eight-
part influence are readable in the implementation but not directly asserted by the shipped vector
suite; audit probes exercised both successfully. Actual canonical Wellington/Alpinor reversal,
delivered/reverted work, mutation/name independence and all required generic contrasts *are*
asserted by other shipped tests.

**Why it matters:** a later translation change could weaken these specific guarantees while a
misleading test name stays green. This does not invalidate the current behavioral evidence.

**Affected:** `src/simulation/__tests__/trackPerformance.test.ts:26` and `:104`.

**Recommended fix:** assert both sides of an intended synthetic reversal, or rename it to the
relative-benefit property it actually tests. Add direct pending/READY-without-fitting and all-eight-
part behavioral coverage when translation is next changed. Keep tests about fitted effects and
state preservation rather than copying coefficient tables.

**Due:** before the next car-vector change or D performance extension. No tests were changed here.

### C-L3 — One current loop paragraph still says research awaits verification

**Issue/evidence:** `docs/GAME_LOOP.md:94` says the technical weights await required external source
verification. The accepted owner handoff, research ledger and current DEV_STATUS correctly say
the gate is complete. Historical C0/C0.1 notes are correctly historical and need no rewriting.

**Why it matters:** the contradictory current paragraph can make a later agent reopen a closed
gate or misstate provenance. It has no simulation or save effect; the Player Manual is accurate.

**Affected:** `docs/GAME_LOOP.md:92`.

**Recommended fix:** update that paragraph to the accepted external provenance and pinned v2
profiles at the next documentation pass. Keep the explicit no-direct-Codex-access limitation.

**Due:** next handoff documentation update, before D. Left as debt under the audit fix policy.

## Observations

### C-O1 — External provenance is honest, but not an independent source-page verification

The ledger and preserved owner handoff explicitly state that Codex did not retrieve blocked pages.
All 23 v2 profiles are CONFIRMED with 19 HIGH and four MEDIUM confidence, matching the owner-
supplied evidence. Exact underlying article URLs/titles were not supplied or invented. Game
weights and unverified tendency metadata are identified as design interpretations. The approved
23-event schedule is the project's owner-defined content contract, not an independently verified
live official-calendar claim by this audit.

Affected: CIRCUIT-RESEARCH.md, CIRCUIT-RESEARCH-HANDOFF.md, calendar2026v2.json. No immediate fix;
retain provenance and collect exact bibliography/late-season updates when available, especially
for the existing source/originality review before public/commercial release.

### C-O2 — No meaningful current performance regression is evident

There are 23 event rows, one selected detail/car query and two global frozen content revisions.
Saves store an ID, not copied profiles/vectors. The HQ owner publishes visible state/route/
assignment changes and stops its timer when settled; it does not force constant calendar rendering
for every animation position. No field-comparison loop runs in the player calendar. Export is
678KB and the local interaction suite passes, but native device FPS/memory/battery were not measured.

Affected: useGameUniverse.ts, CalendarScreen.tsx, game/calendar/index.ts. No optimization proposed;
measure when adding sessions, more seasons or real-device release profiling.

## Calendar / content versioning

PASS: one domain catalog owns the playable content; v1/v2 are immutable revisions, not independently
synchronized current calendars. Both have 23 chronological, nonoverlapping events, stable geographic
event/track IDs, exactly six correct Sprints, Sepang round 16 and no playable Sakhir/Jeddah.
Event dates and IDs are equal between revisions. Root currentDate is the only campaign clock;
current/next/previous/future/status/countdown are derived. No currentRound state exists.

New games select v2. Existing V5 saves retain v1 or v2 exactly. Missing/unknown IDs fail instead
of falling back to the current default. V1–V4 imports intentionally receive the frozen v1 target.
The optional default inside createGameUniverse is only new-game initialization, not save loading.
The old development schedule is compatibility planning/fitting data: see C-M2, not deletion debt.

## Save / migration health

PASS: reviewed deserialize/dispatch/source validation/intermediate transforms/final validation/
detached clone and repository write/read boundaries. V1/V2→frozenV3→frozenV4→V5 and V3/V4 paths
validate source/intermediates; V5 validates and roundtrips both content IDs without reinitialization.
Unknown versions/definitions/IDs and extra current-time mirrors fail. Trusted checkpoint 3 is not
used as an imported-file decoder. Current external schema remains 5 with no new persistent shape.

Tests compare full earned development, pending work/history, HQ routes, team/driver identities,
contracts/exercised options, scouting, dates/metadata and stable RNG/project IDs. Continuation is
checked through remaining season/rollover and repeated repository/serialization boundaries.
The audit independently reran both V5 IDs for 20 weeks after restore.

The **11 claimed historical hashes** were checked against original Git objects, not only an
artifact checksum list: four pre-calendar snapshots plus three V1–V3 fixtures against e6a479c;
V4 snapshot/fixture against 36e7df0; V5 snapshot/calendar-v1 against 34e486a. All match. V2 calendar
also remains independently hash-pinned by the shipped test. Before a future schema 6 migration,
freeze current V5 validation semantics and both registered revisions as required by AGENTS.

Durable device storage/recovery is still absent and honestly documented; it is carried debt before
users can rely on campaign saves, no later than the existing G gate. Save FORMAT health does not
prove disk/device recovery or 20–50-season gameplay correctness.

## Track profile and researched v2 review

All 11 axes share one canonical key list; demands use 0..1 and car values 0..100. Authoring checks
shape, finite bounds, positive aggregate demands, dates/references, metadata, confidence and
statuses. There is no UI component/style data in the profiles. All current values are valid.

Actual v1/v2 numeric diff confirms nine changed profiles (seven minor/two material), not merely
rationale changes. Madrid is mixed-speed/braking/tyre-demanding CONFIRMED/HIGH in v2, and retains
its provisional placeholder only for a pinned v1 career. Singapore is cooling 1.00, stress .50,
tyre preservation .50 and severity .45. Mexico altitude 2250m/cooling 1.00, Spielberg 660m,
Melbourne/Miami tyre reductions, Baku medium-speed increase and grip-evolution changes match the
accepted handoff. No unsupported bank-angle/altitude physics or tyre warm-up implementation.

## Car vector

PASS: fitted parts and homologated power remain technical truth. All eight fitted upgrade areas
influence at least one vector dimension; independent +1 fitted-rating probes confirmed this.
RESEARCH/READY projects alone do not change the vector. Shipped tests exercise actual delivered/
reverted paths and reliability repair. Translation is deterministic/nonmutating;
no RNG, hidden team-name bonus or duplicate persisted vector. Underlying development, driver and
HQ source is unchanged from C0.1 main.

The 11 axes are meaningful *coarse proxies*, not 11 independent physical variables. Inputs are six
existing car attributes plus reliability. Low/medium-speed, braking and mechanical grip share
source quantities; they are not identical aliases for every fitted state. Future handling detail
can extend this single translation owner without changing the saved current-clock/calendar model.

## Car / track fit and cubic demand weighting

PASS: generic car values versus circuit demands only. The wrapper resolves the actual team's
fitted state, then the pure evaluator normalizes demand³. No driver ability/comfort, form,
strategy, dynamic weather, incident or RNG input; track/team identity affects lookup and stable
debug tie ordering, never performance bonuses. Rain/altitude/incident metadata is descriptive.
Static package/heat context is already applied in technicalCar: see C-M1 for future integration.

The cube is centralized/documented. Positive canonical weights normalize to 1 and the score stays
0..100; zero-total/invalid numeric input rejects. Across all canonical tracks, the largest one-axis
share is **25.94%**, the smallest positive share **0.0182%** (an intentionally very-low demand),
and demands≥.4 retain at least **1.166%**. Secondary characteristics are not categorically erased.

An independent ±.05 single-demand sweep over all 23 tracks/all 11 starting cars changed scores by
at most **.60082 points**; basis-vector stress samples changed by at most 2.84561 points. No numeric
instability was observed in these samples. This is not a statistical calibration of all possible
future profiles. Labels naturally change at thresholds. No evidence justifies a formula retune.

No new universal car overall exists. The old average `CarProfile.pace` remains a development
planning proxy and is not read by the C technical vector/evaluator or rendered as competitive truth.

## Double-counting risk and future consumer contract

C itself does not double-count a lap result: no lap/result engine exists. C-M1 is the required
future boundary. Qualifying should consume the domain's numeric technical response **once**;
car/track fit is its player-facing interpretation, not a separately stacked bonus. Retain driver
ability/driver-car comfort/form/weather/strategy as separate domain inputs and do not infer
independent physical gains from correlated proxy axes. Configuration, cooling, tyre effects and
failure risk need explicit once-only ownership/calibration. This report documents that rule;
it does not implement qualifying or choose a new lap formula.

## Field variation and generic upgrade comparison

Reproduced without starter retuning or randomness. Entries are circuit-specific technical ranks,
not race forecasts:

| Team | Monaco | Monza | Suzuka | Las Vegas | Sepang |
|---|---:|---:|---:|---:|---:|
| team.vortex | 1 | 1 | 1 | 1 | 1 |
| team.ferano | 2 | 2 | 2 | 2 | 2 |
| team.mercurion | 3 | 3 | 3 | 3 | 3 |
| team.mclarin | 4 | 4 | 4 | 4 | 4 |
| team.arden | 5 | 5 | 5 | 5 | 5 |
| team.alpinor | 6 | 7 | 6 | 7 | 6 |
| team.wellington | 7 | 6 | 7 | 6 | 7 |
| team.hartman | 8 | 8 | 8 | 8 | 8 |
| team.veloce | 9 | 9 | 9 | 9 | 9 |
| team.auden | 10 | 10 | 10 | 10 | 10 |
| team.caldera | 11 | 11 | 11 | 11 | 11 |

The top five remain hierarchical and Wellington/Alpinor swap 6/7, as claimed. Tiny Monza/LasVegas
margins are not overstated as practical race parity.

| +10 fitted rating | Monaco gain | Monza gain | Suzuka gain | Silverstone gain |
|---|---:|---:|---:|---:|
| Rear wing / efficiency |.184|1.009|1.162|1.177|
| Diffuser/rear edge / aero |.344|.449|1.141|1.179|
| Rear suspension / mechanical |3.401|1.143|1.279|1.224|

Required generic inequalities hold. No named-track or team bonus exists in technical matching.

## Driver/car fit and UI / simulation separation

PASS: selectDriverCarFit is unchanged from main and composes employment plus the legacy car
profile in the driver domain. DriversScreen calls the selector. No dead DTO fit field has returned,
and CalendarScreen does not reuse/overwrite driver comfort.

App still owns one universe; the calendar keeps only selection/notice/scroll UI state. Domain
selectors own status, dates/countdown, technical translation and fit. Counting rows/Sprint markers
in the header is presentation, not a duplicate Sprint schedule. HUD receives selectNextEvent;
there is no hard-coded Melbourne branch. No current-round or manual status synchronization.

Public event detail omits internal score/vector/field rank; UI renders qualitative demands/fit/
strengths/concerns and source-informed factual prose. No raw normalized vector, cubic formula,
universal overall or finishing-position prediction is shown. A successful local browser run covers
corrected v2 Madrid/Singapore/Melbourne/Mexico and existing HQ/Drivers/Team behavior.

## Player manual

PASS for the audited current mechanics: 23-round browsing, Sprint markers without sessions,
date-passed COMPLETED without results, fitted/pending distinction, circuit differences, coarse
car/track suitability versus driver comfort, no guaranteed result and no warm-up simulation.
It explicitly says durable storage/import UI and racing are unavailable. No new mechanic is
claimed implemented merely because metadata exists. C-L3 is a separate stale GAME_LOOP paragraph.

## Research provenance

PASS as an honestly documented **owner-verified external handoff**, not independent direct Codex
source research. 19 HIGH/four MEDIUM are implemented exactly. Underlying article titles/URLs are
not invented; authored game weights and uncalibrated metadata are distinguished from supplied
facts. C-O1 records the bibliographic/verification limit without reopening the accepted gate.

## Test quality

The pass count is not the basis for acceptance. Important behavioral coverage includes both
content IDs through save/load, rejected unknown IDs, frozen source validation without live
registries, full-state migration comparisons, rollover continuation, real upgrade delivery/
reversion, pure deterministic/nonmutating queries, name independence, comparative circuit gains
and public DTO disclosure exclusion. Hash tests legitimately protect immutable released content;
they are not a substitute for those behaviors. Exact authored numbers are checked selectively.

C-L2 identifies narrow overstatement/coverage gaps. Audit-only public-API probes independently
checked pending/READY exclusion, all-eight-part influence, changed driver abilities/form having
no technical effect, no Math.random use, all 23-track/11-car bounded results, same-name-independent
answers, save continuation, score-free disclosure and cubic sensitivity. These probes are outside
the checkout and do not inflate the 317 shipped test count. No tests/assertions were disabled.

## Validation results

Executed on 1290bb3 before documentation changes:

- `npm test -- --runInBand`: **PASS 317/14 suites**, zero failures/skips.
- `npm run typecheck`: **PASS**.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: **PASS**, 678KB JS; bundle
  `index-d6e4afaae0c6e64e00188d5c52400a9d.js`.
- `FORMULA_PREVIEW_URL=http://127.0.0.1:8778 FORMULA_ARTIFACT_DIR=/workspace/artifacts/post-c-audit/browser node scripts/check-milestone-c.cjs`:
  **PASS 390×844**, 9 circuit details, calendar 23/six Sprints, HQ cards/NewDay/repeated 8/8,
  Drivers 22/Prospects 10/reserves 11/TEAM 2, contracts/options/scouting/navigation; **zero page errors
  and no horizontal overflow**. Uses existing Playwright/Chromium; no installation.
- `node /workspace/artifacts/post-c-audit/audit-probes.cjs`: **PASS 7 independent check groups**;
  data/field/sensitivity/source-boundary evidence in probes.json.
- Independent original-Git-object SHA comparison: **PASS 11/11**.
- Canonical profile comparison: **PASS**, 23 circuits, 9 numeric changes,19 HIGH/four MEDIUM.
- `git diff --check`: **PASS**.

Nonblocking npm update/color-environment notices only. No failed required tests remain. Native
hardware profiling, durable-device recovery and multi-decade gameplay were not run or claimed.
Audit artifacts/logs/screenshots: `/workspace/artifacts/post-c-audit/`.

## Cloud preview

Read-only GitHub check for the exact audited commit 1290bb3 reports **Cloudflare Workers Builds:
formulatycoon succeeded**, Build ID 9e46cae6-f212-4553-9989-5d8dca23724a. No preview URL is exposed
by the retrieved check page. A candidate hostname derived from the owner's previous branch-URL
pattern was attempted and denied at the cloud proxy with CONNECT 403; its actual deployment URL
was not confirmed. **Live-preview browser validation NOT RUN**, not a failed application test or
proof the deployment is absent. This optional access limitation does not block architecture review.
Local browser/build proof and remote build-check proof remain explicitly distinct.

## Technical debt schedule

| ID | Severity | Required gate |
|---|---|---|
| C-M1 | MEDIUM | Define consume-once/context/units/pace-vs-hazard contract before first D lap-model consumer |
| C-M2 | MEDIUM | Decide dated advancement/fitting compatibility before D event advance; retain version identity when sessions persist |
| C-L1 | LOW | Authoring ID/season/catalog registration invariants before next content revision/new season |
| C-L2 | LOW | Strengthen reversal/pending/all-part assertions before next vector/performance change |
| C-L3 | LOW | Refresh stale current GAME_LOOP research paragraph at next handoff, before D |
| C-O1 | OBSERVATION | Retain external provenance; article bibliography/source rights before public/commercial release |
| C-O2 | OBSERVATION | Measure device/session/multi-season cost before optimization when those systems expand |

Carried B debt remains separate: imperfect scouting, playerTeamId-derived control, broader contract
rule consolidation, role grouping, history/archive growth and originality/source-rights review.
Durable storage/recovery precedes user dependence on campaigns (existing no-later-than-G gate).
None is silently implemented or closed by this audit. The current model is a modular C foundation,
not a claim that qualifying/racing or 20–50-season gameplay is already complete.

## Files changed / audit commit

- `docs/development-notes/POST-C-AUDIT.md` — this report.
- `docs/DEV_STATUS.md` — audit outcome, evidence and scheduled debt.

The separate audit documentation commit is identified by the delivery/git history rather than a
self-referential hash. No production/test/data/Player Manual changes were required or made.
No branch push, PR, merge or qualifying work is part of this audit completion. Main and the
published implementation commit remain unchanged.

## Merge recommendation

**READY TO MERGE WITH DEBT.** Schedule C-M1/C-M2 before their D integration gates; preserve the
current working model now. Do not merge automatically and do not begin qualifying in this task.

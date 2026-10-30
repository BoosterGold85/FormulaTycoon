# Milestone D0 — Race weekend integration foundation

## Outcome and scope

**READY FOR QUALIFYING DESIGN.** Qualifying itself has not started. D0 resolves Post-C
C-M1/C-M2 and C-L1/C-L2/C-L3 without new gameplay screens, lap times, results, weather,
calendar revisions or changes to development balance/RNG.

Branch: `feature/milestone-d0-race-weekend-foundation`, based on validated merged main
**884459e50e3e29053d6e0e9e62c14659cdc9d3c8**. D0 was completed as the separate feature commit
**a446cfa1c438414db83ae5d65cb02e9c50733da1**. The owner subsequently authorized integrating
it into main; merge commit **f915c9f411783a1d000a2e242238df2aec85a66c** has an identical tree.
Fresh merged-main validation passed341 tests/16 suites, TypeScript, web export,390×844 browser
and11/11 historical hashes. Evidence: `/workspace/artifacts/d0-main-integration/`.

## Milestone C integration

The owner authorized publication of audit 22f0a97 and integration of C. The remote feature branch
now contains implementation 34e486a, preserved research record 46e1e47, researched content and
audited feature 1290bb3, plus Post-C audit 22f0a97. No production code changed before that push.

Merged feature into main using a normal non-fast-forward merge, then validated before pushing
main. The merge tree is exactly equal to 22f0a97; no conflict resolutions or behavioral changes.
Merge/main commit: **884459e50e3e29053d6e0e9e62c14659cdc9d3c8**, pushed and verified remotely.

Merged-main evidence: 317 tests/14 suites PASS, TypeScript PASS, web export PASS, 390×844 browser
PASS and 11/11 original historical hashes PASS. Export retained the audited 678KB bundle
`index-d6e4afaae0c6e64e00188d5c52400a9d.js`. Logs: `/workspace/artifacts/milestone-d0/main/`.
D0 began only after these passed. Worker-art 1cfb07d remains clean/unmerged and unchanged.

## Ownership and failure boundaries

| Question | D0 decision |
|---|---|
| System owner | trackPerformance owns technical composition; universe owns date-work coordination; subsystem engines retain their rules |
| Persistent state | Existing root currentDate and subsystem transitions only; no new stored fields |
| Interfaces | Canonical contextual technical result; typed due instructions; existing development/contract APIs; unchanged validated save boundary |
| Failure risks | Double-counted traits/context, skipped/repeated work, same-date ambiguity, history/RNG retiming, save/load divergence |
| Evidence | Real project and seeded fitting equivalence, daily/jump/kernel comparisons, boundaries, save/load, ordering traces, package/repair tests, full regression/browser suite |

## Permanent performance rule

**TECHNICAL CAR/TRACK SUITABILITY IS DERIVED INFORMATION, NOT A SECOND PERFORMANCE BONUS.**

`technicalPerformanceAtTrack(universe, definition, teamId, track)` is the canonical domain
boundary for future session consumers. It requires a circuit and returns:

- `trackId`: provenance of the contextual result. Callers resolve the career's pinned calendar.
- `car`: eleven derived 0..100 capabilities from fitted development truth, already contextualized.
- `suitability`: the existing circuit-specific score, label, strengths and concerns from comparing
  that car with 0..1 demands. The old `evaluateTeamAtTrack` projects this SAME result.

No new score/formula or independent performance truth is introduced. `evaluateCarAtTrack` remains
the one low-level pure comparator for synthetic tests/tools. Public event detail still removes
the numeric score and car vector. Nothing is persisted or promoted to universal car overall.

Future session composition separates technical car response, driver ability, driver/car comfort,
form, conditions, session decisions and seeded uncertainty. The suitability label/score discloses
the technical response; it is never an extra bonus. Do not add the old planning `CarProfile.pace`
or independently sum correlated low/medium-speed/braking/grip proxies again.

The preserved C score mixes speed-related characteristics with operating readiness, including
reliability/cooling. It is NOT calibrated potential pace or a failure probability. Before D
implements laps, its design must specify how the returned capabilities yield pace versus risk
once; it must not turn mixed disclosure into lap speed and apply the same reliability advantage
again. This is an integration contract, not a new lap formula in D0.

## Package, reliability and cooling/heat ownership

| Effect | Current sole owner | Future rule |
|---|---|---|
| LOW_DRAG | computeCarProfile: existing matching LOW-downforce efficiency adjustment (+3) | Contextual car already includes it; never add another session package bonus |
| HIGH_COOLING | computeCarProfile: existing hot-context cooling adjustment (+6) | Use resulting capability once, including its existing heat-readiness effect |
| Static heat consequence | computeCarProfile: hot-track penalty max(0,75-cooling)*.2 to reliability | Do not add another penalty for the same static hot context |
| Fitted reliability | Existing part reliability, weakest/mean aggregation, maturation/repair in development | Future mechanical-risk domain owns failures/degradation/lost running, not a free generic pace bonus |
| Cooling capability | Existing fitted contributions plus matching package | Distinct from circuit cooling demand and future ambient conditions |
| Track cooling/stress demand | Versioned content and existing suitability comparator | Readiness/importance disclosure, not another weather/failure modifier |
| Ambient weather/temperature | Not implemented | Future conditions layer owns actual ambient consequences and must reconcile/version overlapping static heat rather than stack it |

`technicalCar` translates the existing model once and never reads its old average pace. Package
modifiers are not retuned. No ambient-temperature assumptions, reliability-to-pace conversion,
failure draws, tyre physics, altitude physics or hidden modifiers are added.

## Permanent advancement rule

**ADVANCING THE CAMPAIGN TO AN EVENT MUST PROCESS EVERY DUE GAME EVENT BETWEEN THE OLD DATE
AND NEW DATE.**

All date/day/week commands and the explicit standings-driven reset use `universe::advanceTo`.
It validates a monotonic target and season-boundary authorization before processing. For each
date entered it discovers due instructions from latest state, sorts them explicitly and executes
their subsystem owners, then arrives at the target. Discovery refreshes every date, rather than
freezing a long-jump plan that could miss work scheduled for a later day.

`universe/campaignEvents.ts` provides typed instructions and the date/priority/stable-ID comparator.
It also exposes interval discovery for domain tests/tools. The production owner requests one
entered date at a time. This is a small fixed pipeline, not a callback registry, global event bus,
second advancement engine or saved queue. Future instruction kinds need an explicit priority and
an exhaustive transition handler; they cannot silently do nothing.

Only implemented systems execute: development weekly work/fitting, explicitly authorized season
reset and daily driver option/expiry checks. Scouting remains instant; there are no fake facility,
sponsor or session completions to fill a framework. Calendar status cannot generate results/rewards.

## Development/calendar bridge and versioned integration policy

Both **calendar.2026.v1** and **calendar.2026.v2** retain released C0.1 date policy unchanged:

- Season1/week0 is March 2, 2026; subsequent work boundaries are seven-day increments from that
  annual March-2 anchor through week52. This is not ISO week or calendar-year numbering.
- On crossing a boundary, the previous date's `developmentView` supplies the old completed-week
  index to the existing kernel, which processes the next week once. Its derived clocks are
  removed from persisted state. There is one date-to-kernel bridge.
- That work operation preserves AI planning, project advancement, reliability maturation and
  READY fitting order, plus all existing keyed RNG identities.
- Fitting still follows historical 24-event compatibility content. First fitting is BHR/week10
  → **May 11, 2026**, not playable Melbourne starting March 6. This deliberately retains the
  cadence for current/future work in these careers; it is not a hidden realignment.
- Technical profile revisions never reschedule development, change saved project IDs, rename
  RNG keys or reinterpret completed history. No new project/session dates are persisted.
- Future calendar releases must state their cadence policy explicitly. A new content ID alone
  does not permit retiming work. Real-weekend fitting requires versioned compatibility/migration/
  balance review for pending work, history and deterministic replay.

Normal jumps cannot cross the annual season boundary. The existing explicit command requires
completed week52 and supplied valid standings. It uses this same pipeline to reset development
before refreshing contracts, fabricating no championship result or new calendar. Future session
archives must retain calendarId/event identity and completion state before result/reward processing;
date-only COMPLETED cannot substitute for that.

## Same-date ordering and boundaries

The processed interval is **(oldDate, targetDate]**, including the target. Effects execute when
advancing INTO a date, not by opening a screen or loading a save already on that date.

1. Sort by date ascending.
2. Priority10: development week OR explicit season reset (mutually exclusive).
3. Priority20: daily contract check, preserving development-before-contract order.
4. Stable instruction ID breaks equal-priority ties using code-point order, not locale or object
   iteration. Handler registration order never determines gameplay.

Inside development preserve the kernel order above. Option decisions remain valid THROUGH their
deadline; lapse occurs entering the following date. Daily checks are intentionally idempotent,
not claims that a deadline changes state every day. Future same-date systems must select their
ordering relative to these operations before joining the pipeline.

## Save/migration decision and duplicate prevention

External schema remains **v5**, internal checkpoint **v3**. No persistent shape, released timing
semantics, definition identity, calendar content or RNG changes: no migration/bump is justified.
Historical validators/contracts/fixtures remain untouched. Both calendar IDs retain identity.

Root currentDate is the sole processed-through watermark for current systems. Instructions are
transient and recomputed after restore only for dates later than that watermark. Same-target
advancement returns the same universe; backwards advancement rejects. Fitted projects are consumed
by the kernel and contract refresh is idempotent. Pure advancement cannot publish half-processed
state; real-device atomic storage/recovery is separate unimplemented debt.

Future partial sessions/results require their OWN saved lifecycle/completion identity, validation
and migration before awarding consequences exactly once. D0 does not claim currentDate alone
solves that future problem or durable-device crash recovery.

## C-L1 / C-L2 / C-L3

- C-L1: startup catalog checks unique calendar IDs, no duplicate save-ID registration, exact
  registration/lookup agreement, season/ID coherence and season-valid profile identity. Existing
  event-ID uniqueness stays tested per calendar; stable events may occur in both immutable
  revisions. Profile revision suffix need not match calendar revision suffix.
- C-L2: specialist tests now assert actual reversal on the other circuit. New direct tests cover
  pending/READY exclusion, successful fitting, failed-upgrade reversion, all eight areas and
  reliability repair. No development rewrite or coefficient-mirroring suite.
- C-L3: GAME_LOOP records completed external research, pinned profiles and honest provenance.

## Validation and equivalence evidence

Merged-main commands ran first, then repeated for D0:

- `npm test -- --runInBand`: **PASS 341 tests/16 suites**, zero failed/skipped (main 317/14).
- `npm run typecheck`: **PASS**.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: **PASS**, 680KB JS,
  `index-5b68b850ba2f9f212f046d40ac830d12.js`.
- `FORMULA_PREVIEW_URL=http://127.0.0.1:8779 FORMULA_ARTIFACT_DIR=/workspace/artifacts/milestone-d0/final/browser node scripts/check-milestone-c.cjs`:
  **PASS 390×844**, 23 rounds/six Sprints/nine details; worker/department taps, NEW DAY, repeated
  8/8, navigation, Drivers/Team/contracts/scouting; zero page errors/horizontal overflow.
- Original-Git-object byte/SHA comparison: **PASS 11/11** historical contracts/fixtures/calendar-v1.
  Both released calendar hash tests pass. No historical or profile data changes.
- `git diff --check`: **PASS**. No dependencies/lockfile changes or installs. Existing npm update
  and NO_COLOR/FORCE_COLOR notices only.

Progression tests prove both IDs' daily == direct jump == 40-week legacy-kernel output with an
actually started project, seeded successful fitting, AI submissions and contract lapse. Coverage
includes day-before/on/day-after fitting, multiple due dates, same-target no-op, save immediately
before fitting then restore/continue/reload, unique submission keys, actual same-date call traces,
stable ties, rejected backward/implicit rollover, explicit reset and dates without DriverWorld.
No duplicate stored clock/queue was introduced.

Performance tests prove canonical disclosure equality without stacking, purity/determinism,
no Math.random, driver/form/name/metadata independence, fitted versus unfitted truth, all eight
part effects, once-only package/static heat and reliability-only repair capability changes.
They do not pretend to prove a nonexistent future lap model has correct calibration.

The first targeted run failed two new test-harness assertions: spying on a read-only re-export
and expecting the backward-date error for a target preceding the entire supported career.
Spies now use defining modules and the test uses a valid earlier career date. Targeted rerun
passed 65/65; subsequent full suite passed 341/341. No production workaround or disabled test.
Logs/screenshots: `/workspace/artifacts/milestone-d0/`.

## Limitations and remaining debt

No Practice/Qualifying/race controller, lap model, sessions/results, weather, championship advance
button, event-directed fitting, new screens or persisted scheduler. No native performance or live
D0 deployment was tested. Browser smoke is local; main integration does not establish deployed
runtime behavior. Player Manual remains accurate/unchanged because no new player-facing mechanic
is introduced.

The retained weekly cadence is explicit but is not real-weekend fitting. Future retiming needs
the compatibility review above. Pace/risk calibration remains qualifying DESIGN work; correlated
technical proxies and mixed-readiness comparison are not physical telemetry. Research remains
the accepted owner-verified handoff, not newly retrieved source pages.

Carried B/A debt remains: imperfect scouting, playerTeamId-derived control, contract-rule cleanup,
role grouping, archive growth, source/originality rights, durable storage/recovery before users
depend on saves, and later long-career/device profiling. No unrelated cleanup was added.

## Files and stop condition

Runtime: game/calendar/index; simulation/calendar/validation; development/carModel (comment only);
trackPerformance/index and carVector (comment); universe/index and new campaignEvents.
Tests: calendar, trackPerformance, new technicalPerformance and campaignProgression suites.
Docs: GAME_ARCHITECTURE, GAME_LOOP, SYSTEM_MAP, MILESTONES, DEV_STATUS and this note.

Main now contains audited C, Post-C audit documentation and owner-authorized D0 integration.
Worker art is untouched. **READY FOR QUALIFYING DESIGN** does not authorize implementation.
Stop after the authorized integration; do not start qualifying automatically.

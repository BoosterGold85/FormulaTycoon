# Development status

## Milestone

**D0 — Race weekend integration foundation COMPLETE. READY FOR QUALIFYING DESIGN.**
Qualifying has NOT started. No Practice/Qualifying screen, lap model or race result exists.

Current branch: `main`. The owner authorized D0 integration after its completion. D0 commit
**a446cfa1c438414db83ae5d65cb02e9c50733da1** is merged at
**f915c9f411783a1d000a2e242238df2aec85a66c**. Main contains Milestone C, the Post-C audit and D0.
The merge tree equals the completed D0 feature tree; no production changes were added.
Worker art at `1cfb07d` stays separate/unmerged.
Details: [MILESTONE-D0](development-notes/MILESTONE-D0.md).

## COMPLETED

- Published C feature/audit `22f0a97` without production changes, preserving implementation `34e486a`,
  research record `46e1e47` and audited `1290bb3`. Merged to main `884459e`, validated and pushed main.
  Merge tree equals the audited feature tree; no behavioral merge changes.
- C-M1: canonical technicalPerformanceAtTrack returns one configured fitted car and its derived
  suitability. Existing briefing/debug API delegates to it. Suitability is disclosure, never an
  extra pace bonus. Package/static-heat effects retain one owner in computeCarProfile. Reliability
  capability, circuit cooling demand and future ambient/risk effects are distinguished.
- C-M2: typed transient due-work discovery and explicit ordering in universe/campaignEvents.
  All campaign commands use one pathway, refreshing discovery on every entered date. Interval
  (old,target] includes target; same-date development/reset precedes daily contract status.
  Both calendar revisions deliberately retain the released weekly bridge/fitting cadence.
- Root currentDate is the sole clock and processed-through watermark. No queue/processed ledger
  or current-time mirror is stored. Save stays v5/checkpoint v3; historical contracts unchanged.
- C-L1: unique catalog IDs/registration, lookup agreement, season/ID/profile coherence; existing
  event uniqueness retained. Profile and calendar revision suffixes need not match.
- C-L2: actual specialist reversal assertions and pending/READY/fitting/reversion/all-part tests.
- C-L3: GAME_LOOP research wording corrected to accepted external provenance.
- Architecture, system map, loop and milestone gates updated. Player Manual unchanged because
  no new player-facing mechanic or formula disclosure is introduced.

## IN PROGRESS

None. D0 integration was explicitly authorized by the owner. Await a separate instruction for
qualifying design/implementation. Graphics stay separate.

## TESTED

Merged D0 main `f915c9f`:

- Fresh341 tests/16 suites, TypeScript, web build and390×844 browser smoke all PASS.
- All11 historical hashes match original Git objects. No page errors/horizontal overflow.
- Merge tree equals feature commit a446cfa. Subsequent integration-status edits are docs only.
- Logs/screenshots: `/workspace/artifacts/d0-main-integration/`.

Merged main `884459e`, before D0:

- `npm test -- --runInBand`: **317/317 tests, 14/14 suites PASS**.
- `npm run typecheck` and `EXPO_NO_TELEMETRY=1 npm run build:web`: **PASS**.
- Existing 390×844 browser script: **PASS**, zero page errors/overflow.
- Original historical hashes: **11/11 PASS**. Audited-feature tree equality confirmed.

D0:

- `npm test -- --runInBand`: **341/341 tests, 16/16 suites PASS**, zero failed/skipped.
- `npm run typecheck`: **PASS**.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: **PASS**, 680KB JS export.
- `FORMULA_PREVIEW_URL=http://127.0.0.1:8779 FORMULA_ARTIFACT_DIR=/workspace/artifacts/milestone-d0/final/browser node scripts/check-milestone-c.cjs`:
  **PASS 390×844**, 23 rounds/six Sprints/nine details, worker/department cards, repeated 8/8,
  NEW DAY, Drivers/Team/contracts/scouting/navigation, zero page errors/horizontal overflow.
- Independent original-Git-object comparison: **11/11 historical hashes PASS**. Both immutable
  calendar hash regressions pass; no calendar/driver data changes.
- Both calendar IDs: daily == jump == released 40-week kernel with real project, seeded fitting,
  AI/option deadlines; save before fitting/reload/continue; before/on/after and multi-date
  boundaries; no duplicate submissions; no-op repeats and backward rejection.
- Actual same-date engine call traces and reversed-list/tie sorting pass. Explicit reset,
  no implicit rollover and no second stored clock stay protected.
- Canonical technical result: no stacked bonus, mutation/unseeded RNG/driver/form contribution;
  pending/READY excluded, fitting included, failure retains prior truth; all eight fitted areas
  matter; packages/static heat once; repair changes reliability capability only.
- Initial test-harness failures corrected; targeted rerun 65/65 PASS before full 341/341. No
  production workaround or assertion disabling. Details in MILESTONE-D0.
- `git diff --check` PASS. No packages/lockfiles changed or installs. Existing npm update/color
  notices are nonblocking. Evidence: `/workspace/artifacts/milestone-d0/main/` and `final/`.

## NOT VERIFIED

- Future qualifying pace/risk calibration, sessions/results/rewards, dynamic conditions,
  actual-weekend fitting, season-calendar generation or 20–50-season gameplay.
- Durable device storage/import UI/restart recovery: adapter stays volatile.
- Native iPhone/Safari performance and live deployed runtime behavior; a Git push/build alone
  does not establish live application behavior.
- Direct source-page retrieval or missing article bibliography. Research remains the accepted
  external handoff: 19 HIGH/four MEDIUM; no invented titles/URLs or new direct verification claim.
  See [CIRCUIT-RESEARCH](development-notes/CIRCUIT-RESEARCH.md).

## KNOWN ISSUES

- Fitting remains historical 24-event compatibility content, distinct from playable 23-event
  schedule. First fitting is BHR/week10 on 2026-05-11; Melbourne begins March 6. Future retiming
  must version policy and preserve histories/RNG.
- C's comparison score includes reliability/cooling readiness, not lap pace/failure probability.
  D must design separate once-only pace/risk/ambient consequences before implementing laps.
- Eleven scalar-derived characteristics are coarse correlated proxies. The starter field stays
  hierarchical; Wellington/Alpinor swap 6/7 by circuit without retuning.
- Existing V5/v1 careers retain original profiles/provisional Madrid; new careers select v2.
  No silent content upgrade. Both retain the same development bridge.
- No campaign-advance UI/results. Date-only COMPLETED is not processed session state.
- Annual March-2 phase, no offseason recruiting, fixed cohorts/instant free scouting, expiry
  vacancies, starter-bonus assumptions and lack of payroll remain carried limitations.

## TECHNICAL DEBT / ARCHITECTURAL RISK

| Finding | Status / due gate |
|---|---|
| C-M1 | RESOLVED: canonical boundary/ownership and no-double-counting rule; D must calibrate pace/risk before lap implementation |
| C-M2 | RESOLVED: ordered pipeline and explicit retained cadence; later retiming requires versioned compatibility review |
| C-L1 | RESOLVED: catalog/registration/ID-season invariants and tests |
| C-L2 | RESOLVED: reversal and unfitted/fitted/reverted/all-part coverage |
| C-L3 | RESOLVED: current research wording corrected |
| Session identity | Before persisted sessions/results: calendarId/event identity, lifecycle validation/migration and exactly-once consequences |
| H1 | Historical V1–V5 snapshots/fixtures/calendar-v1 retained; new content gets new identity |
| M1 | Imperfect seeded scouting before expansion |
| M2 | Root date resolved by C0.1; D0 adds no clock |
| M3 | playerTeamId-derived control before team chooser |
| M4 | Separate driver/car-fit selector retained |
| M5 | Broader contract-rule overlap cleanup before expansion |
| M6 | Role grouping before multi-season/offseason |
| M7 | Archive/history growth by G |
| M8 | Originality/source rights and bibliography before public/commercial release |
| Persistence | Durable storage/atomic recovery before users depend on campaigns, no later than G |

L1–L10, balance and device/long-career profiling remain carried work. No broad cleanup or
starter retuning. Research/audit provenance stays in CIRCUIT-RESEARCH and POST-C-AUDIT.

## NEXT MILESTONE

**READY FOR QUALIFYING DESIGN.** Milestone C, its audit and D0 are integrated into main.
Do not begin qualifying without a separate instruction. Graphics stay independent/unmerged.
Stop after the owner-authorized main integration.

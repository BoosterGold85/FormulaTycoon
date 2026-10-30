# Development status

## Milestone

**Milestone C — implementation and externally verified research gate COMPLETE.**
**POST-C AUDIT: READY TO MERGE WITH DEBT. No blockers/high findings.**
This recommendation does not authorize a merge or qualifying work.

Branch: feature/milestone-c-track-performance. Implementation34e486a and research-blocked record
46e1e47 are both preserved. Main remains C0.1 at36e7df0. Worker-art1cfb07d remains separate.
Post-C audit target: 1290bb3e8485a441477a495cc4443f56e9e36edf. Actual source, persistence, data,
tests and browser behavior were reviewed independently of the handoff claims. The separate audit
documentation commit is local/unpushed; no production code, data, tests, dependencies or rules
were changed. Full findings: [POST-C-AUDIT](development-notes/POST-C-AUDIT.md).

## EXTERNAL RESEARCH HANDOFF

> Source content was verified externally by the project owner/research assistant because the Codex runtime returned HTTP 403. Codex did not directly retrieve these pages.

Evidence: **FORMULA TYCOON — COMPLETE MILESTONE C RESEARCH GATE**, October29,2026, preserved in
[CIRCUIT-RESEARCH-HANDOFF](development-notes/CIRCUIT-RESEARCH-HANDOFF.md). The
[ledger](development-notes/CIRCUIT-RESEARCH.md) reviews all23 circuits:19 HIGH-confidence,
4 MEDIUM-confidence. The late-season four use stable official/recent technical material while
2026 event-specific previews were pending in the handoff. Exact article titles/URLs were not
provided and are not invented. Codex proxy access remains unavailable; it no longer blocks the
accepted external evidence. Confidence supports supplied facts, not every authored metadata number.

## COMPLETED

- Immutable owner-approved23-round/six-Sprint calendar, geographic IDs, date/status/countdown
  queries, RACE calendar/circuit briefing and HQ real next event from the same root date.
- Domain fitted-car technical translation and generic demand matching, qualitative explanations,
  no universal car overall/finishing forecast. Driver/car comfort remains separate and unchanged.
- External research review:14 profiles confirmed numerically unchanged,7 minor adjustments,
  2 material adjustments (Madrid and Singapore). New profiles are CONFIRMED with explicit
  HIGH/MEDIUM confidence. Exact changes/provenance are in the ledger, not claimed official weights.
- Madrid now has supported fast/mixed sectors, heavy braking, banked-corner tyre-energy demand;
  CONFIRMED/HIGH, no new-career provisional warning. Sepang's balanced fast-aero/thermal profile
  is confirmed unchanged. Singapore cooling stays high while car stress/tyre severity decrease.
- Minor changes: lower Melbourne/Miami tyre severity; stronger Melbourne/Montreal/Budapest grip
  evolution; Spielberg660m; Baku meaningful medium-speed sections; Mexico2250m/maximum cooling.
  Monaco/Lusail tyre values and LasVegas wear versus warm-up interpretation confirmed without retune.
- New immutable calendar.2026.v2/track-profiles.2026.v2 selected for new careers. Original v1
  remains byte-identical/available. Event dates/IDs/Sprints are identical across revisions.
- Save schema stays5, checkpoint3: no persistent shape change. A frozen append-only static-ID
  registry accepts both versions. Existing V5 careers retain their identity; frozen V1–V4→V5
  migration retains its original v1 target. New defaults never change historical migration output.
- All historical snapshots/fixtures remain unchanged; both saved IDs roundtrip/continue correctly.
  No automatic saved-content upgrade UI/policy was added.
- No starter-car/development balance/RNG/car-vector or fit-algorithm changes; no named-track
  bonuses. HQ routes/assignments/timing/art and driver data/logic remain unchanged.
- Player manual corrects Madrid and cooling/stress/wear/warm-up interpretation, without exposing
  weights. Existing imported careers' pinned content is explained.

## IN PROGRESS

Audit complete. Await owner merge decision; no Milestone D work is in progress. Two MEDIUM
integration gates (C-M1/C-M2) and three LOW items are scheduled below. No immediate production fix
was required under the audit policy. No branch push, PR, merge or installation was performed.

## TESTED

- Main36e7df0 integration previously passed261 tests/types/export before C.
- Researched C: `npm test -- --runInBand` **PASS317/14 suites**, zero failed/skipped;
  `npm run typecheck` PASS; `EXPO_NO_TELEMETRY=1 npm run build:web` PASS,678KB JS.
- Original development/HQ/driver/contract/scouting/calendar/profile/vector/fit/save tests pass.
  New regressions protect researched revision confidence, unchanged event data, Madrid's confirmed
  character, Singapore heat/stress separation, low tyre severity, altitude/cooling, both content
  IDs and V5 restore/continuation. V1–V4→V5 migration remains tested with immutable source fixtures.
- Eleven original snapshot/fixture/calendar-v1 SHA checks PASS, including frozen V5 contract.
  Both calendar revisions are separately hash-pinned. Unknown future IDs still rejected.
- All11 canonical starters re-compared on Monaco/Monza/Suzuka/LasVegas/Sepang: same ordering,
  Wellington/Alpinor swap6/7. Mostly hierarchical, tiny margins, no forced/randomized movement.
  Generic rear-wing/diffuser/suspension upgrade-response comparisons remain valid.
- Existing Chromium390×844 browser script now covers9 details, including corrected
  Madrid/Melbourne/Singapore/Mexico, scrolled car fit and all prior HQ/NewDay/cards/8-of-8,
  Drivers/Team/options/scouting/navigation checks: **PASS**, no page errors/horizontal overflow.
- `git diff --check` PASS. No packages/lockfiles changed. Existing npm/color notices nonblocking.
  Artifacts: `/workspace/artifacts/milestone-c-complete/`.

## POST-C AUDIT EVIDENCE

- Fresh execution on 1290bb3:317 tests/14 suites, TypeScript and web export PASS. Local390×844
  browser PASS across9 circuit details and existing HQ/NewDay/cards/Drivers/Team/scouting flows;
  zero page errors/horizontal overflow. No failing or skipped required tests.
- Seven independent public-API probe groups PASS: both content IDs, all eight fitted part areas,
  pending/READY exclusion, name/driver/form independence, no Math.random, mutation protection,
  field/upgrade contrasts, public numeric-disclosure exclusion and save continuation.
- All11 historical hashes independently match original Git objects (e6a479c/36e7df0/34e486a),
  rather than relying solely on the earlier artifact hash list. V2 also remains hash-pinned.
- Cubic sensitivity sweep: maximum one-axis share25.94%; demands≥.4 retain at least1.166% share.
  A single demand±.05 changes actual starting-car scores by at most.60082 points in the sampled
  canonical field. No current instability or reason to retune was found.
- Cloudflare build check for1290bb3 succeeded. No confirmed live-preview URL was exposed; a
  derived candidate hostname was denied by the proxy with CONNECT403. Remote runtime NOT RUN,
  not an application failure or an architecture-review blocker.
- Evidence/logs/screenshots: `/workspace/artifacts/post-c-audit/`. No native/device/long-career
  guarantee is inferred from these checks. The audit report records coverage gaps explicitly.

## NOT VERIFIED

- Direct Codex retrieval of underlying technical pages; source/article-level bibliography beyond
  the owner-supplied handoff. These are provenance limits, not an outstanding research gate.
- Any live-preview browser behavior not explicitly recorded after push; a Cloudflare build check
  alone proves no runtime behavior. Native iPhone/Safari/hardware profiling is optional/unverified.
- Durable saves/import UI/restart recovery (memory adapter stays volatile), calibrated lap time,
  detailed tyre/altitude/drag physics and decades of balance/performance.
- Qualifying/races/strategy/weather/incidents/results/finances/offseason/future calendars: not built.

## KNOWN ISSUES

- C-M1: define the future consume-once performance/context contract before D; do not add derived
  car/track fit as a second bonus to already weighted car traits, reapply packages/heat, or treat
  correlated proxies/mixed reliability suitability as independent lap-speed gains.
- C-M2: old development fitting and dated event progression are deliberately separate. The first
  old fitting event is BHR/week10 (2026-05-11) while playable Melbourne starts2026-03-06. Choose a
  versioned integration/processing policy before D event advancement; do not rewrite old histories.
- Low audit items: catalog/ID/season authoring invariants, a specialist-test title/assertion gap,
  direct pending/all-part regression coverage, and a stale research-awaiting GAME_LOOP paragraph.

- Existing24-event weekly development/introduction fixture remains internal compatibility truth;
  actual race-date fitting integration needs a later deliberate migration/balance decision.
- Existing V5/v1 careers intentionally retain original profiles, including provisional Madrid.
  Only new careers select researched v2; no implicit content rewrite or upgrade action exists.
- Correlated scalar-derived technical characteristics are coarse proxies, not physical telemetry.
  Heat, car stress, tyre energy/wear/warm-up are distinguished in content; warm-up/altitude physics
  are not implemented. Metadata outside the supplied evidence remains authored design data.
- Initial field is strongly hierarchical; Monza Wellington/Alpinor gap~.078, LasVegas~.001 internal
  points. No race competitiveness or lap-time precision is claimed.
- Annual March2 compatibility phase, no offseason recruitment, fixed cohorts/free immediate
  scouting, expiry vacancies, starter-bonus assumption and lack of payroll remain as before.

## TECHNICAL DEBT / ARCHITECTURAL RISK

| Finding | Status / due gate |
|---|---|
| H1 | Historical V1–V5 snapshots/fixtures and calendar-v1 retained; new content gets a new ID |
| M1 | Deferred: imperfect seeded scouting before expansion |
| M2 | Root date resolved by C0.1; no new current clock |
| M3 | Deferred: playerTeamId-derived control before team chooser |
| M4 | Domain driver/car-fit selector unchanged |
| M5 | Shared deadline retained; broader overlap cleanup before expansion |
| M6 | Deferred: role grouping before multi-season/offseason |
| M7 | Deferred: history growth/archive by G |
| M8 | Deferred: originality/source rights before public/commercial release |
| C research | COMPLETE through accepted external handoff; exact bibliography/late previews can refine later |
| C-M1 | MEDIUM: consume-once/context/units and pace-vs-hazard contract before first D lap consumer |
| C-M2 | MEDIUM: dated advancement/fitting compatibility before D event advance; version identity on session records |
| C-L1 | LOW: catalog/registration/ID-year invariants before next revision or new season |
| C-L2 | LOW: reversal/pending/all-part test assertions before next vector/performance change |
| C-L3 | LOW: update stale current GAME_LOOP research paragraph at next handoff, before D |
| C integration | Weekly fitting vs dated race weekends deliberately separate; future explicit policy |

L1–L10, durable storage/recovery, closed driver schema, balance and device profiling remain carried
work. Do not edit released IDs or saved decision dates. No unrelated cleanup sprint.

## NEXT MILESTONE

**READY TO MERGE WITH DEBT.** Audit found no BLOCKER/HIGH defect. Await owner approval to merge;
complete C-M1/C-M2 before their qualifying/event integration gates. Qualifying has NOT started.
Main remains36e7df0 and the graphics workstream remains separate/unmerged.

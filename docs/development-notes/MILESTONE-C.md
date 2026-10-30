# Milestone C — Calendar and track performance

**IMPLEMENTATION AND EXTERNAL RESEARCH GATE COMPLETE — READY FOR POST-C AUDIT.**
No merge or qualifying work is authorized by this handoff.

## Before implementation: five ownership questions

1. **Owner:** `game/calendar` owns immutable versioned calendar/event/circuit content. Events
   reference stable track IDs; technical profiles belong to tracks. `simulation/calendar` owns
   date queries/disclosure. `simulation/trackPerformance` owns development-to-vector translation
   and deterministic generic car/track matching. Driver/car fit stays separate and unchanged.
2. **State:** static schedule, profiles and weights are not copied into careers. A career gains
   only `calendarId = calendar.2026.v1`. Root currentDate remains the sole clock. This structure
   change requires external save5, frozen V4 validation/fixture and explicit V4→V5 migration.
   No event status flags, car vectors, rankings or race results are persisted.
3. **Interfaces:** calendar queries consume root currentDate and calendarId. Translation reads
   fitted development truth through existing car-model semantics. UI consumes derived disclosure;
   qualifying/race/weather/strategy/championship later consume these pure APIs, never UI rules.
   Compatibility weekly development scheduling remains unchanged; dated championship events are
   a separate registry, not a silent rebalance or rewrite of old upgrade history/event IDs.
4. **Failure modes:** invalid/overlapping dates, duplicated IDs/rounds, missing tracks, stale
   schedule edits, save-content drift, invalid weights, correlated metrics, universal ordering,
   disconnected upgrades, false race predictions and named-track rule branches. Madrid profile
   uncertainty and research access must be explicit, not replaced by invented precise facts.
5. **Proof:** exact owner-approved23-round/six-Sprint schedule; clock edges/gaps/end; bounded
   profiles and malformed-content rejection; real fitted upgrades/reversions/packages/reliability;
   deterministic/nonmutating translation; contrasting technical/upgrade comparisons; eleven-car
   ordering evidence; frozenV1–V4 source/output/continuation tests; full tests/types/export and
   Chromium390×844 HQ/calendar/details/driver/team/navigation regression.

## Integration and preserved work

C0.1 b1b7dab was pushed/merged to main36e7df0, which passed261 tests/types/export before C.
Implementation34e486ab2b8262a744deb0070706fb0adbd9a5b6 was pushed for branch-preview testing.
Blocked-research documentation46e1e47ac9ac959d459f301b1597fbf1e85d25d3 is preserved in branch history.
Neither commit was discarded. Main stays at C0.1; worker-art1cfb07d remains separate/unmerged.
The owner now supplies externally verified circuit research and explicitly authorizes the final
research review, justified corrections, revalidation, commit and feature-branch push only.

## External research handoff

> Source content was verified externally by the project owner/research assistant because the Codex runtime returned HTTP 403. Codex did not directly retrieve these pages.

The accepted evidence is **FORMULA TYCOON — COMPLETE MILESTONE C RESEARCH GATE**, owner handoff,
October29,2026. Factual/confidence sections are preserved in CIRCUIT-RESEARCH-HANDOFF.md; all23
reviews and provenance are in CIRCUIT-RESEARCH.md. Underlying article titles/URLs were not included
and have not been invented. Confidence is HIGH for19 circuits, MEDIUM for SãoPaulo/LasVegas/
Lusail/YasMarina, whose event-specific2026 previews were pending in the handoff. They are not
provisional merely because Codex could not retrieve a source. Direct proxy access is unchanged,
but **no longer blocks the research gate** after the explicit external verification handoff.

## Profile review and justified corrections

- **14 CONFIRMED without numeric change:** Shanghai, Suzuka, Monaco, Barcelona-Catalunya,
  Silverstone, Spa, Zandvoort, Monza, Sepang, Austin, SãoPaulo, LasVegas, Lusail, YasMarina.
- **7 MINOR ADJUSTMENTS:** Melbourne (lower tyre severity/preservation, more grip evolution),
  Miami (lower tyre severity/preservation), Montreal/Budapest (more grip evolution), Spielberg
  (~660m altitude), Baku (meaningful medium-speed streets), Mexico (~2250m and maximum cooling).
- **2 MATERIAL ADJUSTMENTS:** Madrid (supported mixed-sector/fast/braking/tyre profile replaces
  uniform placeholder) and Singapore (separate high cooling/grip from non-extreme car/tyre stress).

Madrid's confirmed hybrid22-corner layout, fast opening, heavy stops and very loaded banked turn
support high fast-aero/braking and very high tyre-energy demand. It is CONFIRMED/HIGH; v2 has no
provisional warning. Banking is reported as up to24%, not24 degrees. No precise unsupported
corner-speed model or new bank-physics system was added.

Sepang's existing fast middle/medium-high-speed aero, long straights/traction, cooling1.00 and
HIGH rain metadata already fit the external facts. Numeric values stay unchanged; status is
CONFIRMED/HIGH. It is not reduced to a straight-line-only venue.

Singapore keeps cooling1.00, braking/traction/mechanical-grip demands and night/rain metadata.
Car-stress demand drops .85→.50, tyre preservation .70→.50 and severity .70→.45. Those changes
reflect the supplied2026 Pirelli distinction; ambient heat is not automatically severe mechanical
stress or exceptional degradation. Monaco's low tyre severity, LasVegas's moderate severity
(warm-up differs from wear) and Lusail's maximum tyre demand are confirmed without numeric change.

Every normalized number remains FormulaTycoon design data, never an official rating table.
Rationales are updated throughout; confirmed-without-change refers to numeric demands/metadata,
not to retaining unsupported old prose. All23 v2 profiles are CONFIRMED, with explicit confidence.
No starter-car, part balance, RNG, fit formula or named-track/team bonus change was made.

## Content identity and save compatibility

Corrections are a new immutable **calendar.2026.v2 / track-profiles.2026.v2**. V1 remains available
byte-for-byte. Both revisions have the exact same23 events, geographic IDs/dates and six Sprint
markers; Sepang remains round16, no playable Sakhir/Jeddah. New careers select v2.

External schema stays **5**: existing string calendarId can represent either registered revision.
A small append-only, frozen ID registry extends current validation to2; unknown revisions still
fail. No new career field, duplicate clock, copied track data or speculative save6 is introduced.
Definition identity for the unchanged core development/HQ/driver structure remains the same.

Existing V5 saves retain their saved calendarId and therefore their original profiles. Frozen
V1/V2→V3→V4→V5 migration retains its v1 target; a live default change never changes historical
migration output. This means imported old careers intentionally keep the original content until
an explicit future opt-in upgrade policy exists. No such upgrade UI/command was added here.
All V1–V5 contract snapshots, meaningful fixtures and calendar-v1 bytes remain unchanged.
Internal checkpoint remains3; its structure is unchanged. V5 roundtrips/continuation are tested
on both IDs, plus original V1–V4 migration and future/unknown-ID rejection.

Calendar and statuses remain static-content/date queries: current/next/previous/future/countdown,
inclusive weekend membership, date-passed COMPLETED with no generated results. After the last
event there is no invented next calendar/offseason. C0.1's annual March2 phase and old24-event
weekly development/introduction fixture remain unchanged for balance, IDs and RNG continuation.
Connecting actual race dates to fitting is still deliberate later integration work.

## Car translation and generic technical matching

Existing computeCarProfile supplies fitted part attributes, package matching and reliability.
The new technical vector consumes those truths and ignores average pace; no persisted car copy
or new drag/altitude/tyre-warm-up physics. Driver/car comfort remains separate. Normalized cubic
circuit demands determine circuit-specific technical suitability; qualitative fit/strengths/
concerns derive from the same result. Internal scores are debug evidence, never universal car
overall, lap seconds or finishing predictions. No driver/form/strategy/weather/RNG input.

Revalidated generic +10 fitted-part responses (internal comparison units):

| Upgrade area | Monaco | Monza | Suzuka | Silverstone |
|---|---:|---:|---:|---:|
| Rear wing / efficiency |.184|1.009|1.162|1.177|
| Diffuser/rear edge / aero |.344|.449|1.141|1.179|
| Rear suspension / mechanical |3.401|1.143|1.279|1.224|

Low-drag benefit Monza>Monaco, fast-aero benefit Suzuka/Silverstone>Monaco and mechanical benefit
Monaco>Monza remain generic weighting outcomes. The existing engine was not retuned.

## Eleven-car field evidence after research review

Seed1, untouched canonical starters, researched v2 content. Circuit-specific technical order:

| Team | Monaco | Monza | Suzuka | Las Vegas | Sepang |
|---|---:|---:|---:|---:|---:|
| Mclarin Racing | 4 | 4 | 4 | 4 | 4 |
| Ferano Corse | 2 | 2 | 2 | 2 | 2 |
| Mercurion GP | 3 | 3 | 3 | 3 | 3 |
| Vortex Racing | 1 | 1 | 1 | 1 | 1 |
| Arden Motorsport | 5 | 5 | 5 | 5 | 5 |
| Wellington Racing | 7 | 6 | 7 | 6 | 7 |
| Alpinor GP | 6 | 7 | 6 | 7 | 6 |
| Hartman Racing | 8 | 8 | 8 | 8 | 8 |
| Veloce Racing | 9 | 9 | 9 | 9 | 9 |
| Auden Motorsport | 10 | 10 | 10 | 10 | 10 |
| Caldera Racing | 11 | 11 | 11 | 11 | 11 |

Order is unchanged across these five venues because their existing numeric profiles were
confirmed. Wellington/Alpinor still swap6/7: Monza gap about.078 internal points; LasVegas gap
about.001. The field remains mostly hierarchical. No randomness, starter retune or name-based
bonus was used to manufacture movement. Different future car concepts can produce more diversity;
this is not a claimed race prediction or calibrated multi-season balance result.

## UI and player manual

RACE calendar/detail and HQ date-backed next event remain the existing implementation. New
careers now show researched rationales, Madrid confirmed without the obsolete provisional flag,
Singapore's lower stress/tyre categories, Melbourne's low tyre demand and Mexico's corrected
altitude/cooling explanation. No new screen, race session or campaign-advance control added.
Player manual updates those interpretations, distinguishes cooling/stress and wear/warm-up, and
explains that imported earlier careers keep their original profiles. No hidden weights/formulas.

## Validation

- `npm test -- --runInBand`: **PASS317/14 suites**, zero failed/skipped.
- `npm run typecheck`: **PASS**.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: **PASS**,678KB JS.
- `FORMULA_PREVIEW_URL=http://127.0.0.1:8777 FORMULA_ARTIFACT_DIR=/workspace/artifacts/milestone-c-complete/browser node scripts/check-milestone-c.cjs`:
  **PASS**, v2 researched profiles,9 circuit details and all existing flows; no page errors or
  horizontal overflow.
- `sha256sum --check /workspace/artifacts/milestone-c-complete/historical-hashes.txt`: **PASS**,
  all11 original snapshots/fixtures/calendar-v1 files; researched v2 separately hash-pinned.
- `git diff --check`: **PASS**.

The full suite includes original calendar/profile/car-vector/fit/development/HQ/driver tests,
V1–V4→V5 migration, V5 restore/continuation and new meaningful research-revision regressions.
They protect both saved content IDs, event equality, confidence, Madrid's corrected character,
Singapore's heat/stress distinction, wear/warm-up/altitude interpretation and unknown-ID rejection.
Browser now checks9 circuit details, including corrected Madrid/Melbourne/Singapore/Mexico,
plus existing HQ/cards/NewDay/8-of-8, Drivers/Team/contracts/options/scouting/navigation.
No native iPhone proof is required to close this milestone. Logs/screenshots/evidence:
`/workspace/artifacts/milestone-c-complete/`. No dependencies installed; nonblocking npm/color
warnings only. No test was disabled and no historical input/hash expectation was rewritten.

## Cloud preview

The owner authorizes a normal feature-branch push after the reviewed commit, preserving34e486a
and46e1e47. Main is not merged or advanced. Cloudflare's updated build check is verified after
push and reported in the final delivery, with evidence under the artifact directory. A successful build check is distinct from a live browser run; direct preview access
can remain unverified when its host is outside the managed network policy.

## Known limitations / audit debt

Underlying article-level titles/URLs were not supplied with H. No direct Codex source access is
claimed; provenance is external and confidence owner-assigned. Metadata not addressed in H
remains authored design data, not measured probabilities. Late-season previews can refine the
four MEDIUM-confidence profiles later under a new revision. No unsupported precision/physics.

Native iPhone/Safari/hardware performance, durable storage/recovery/import UI, live-preview browser
behavior and long-run lap-time/balance calibration remain unverified unless explicitly recorded.
The old weekly fitting/calendar separation and existing audit M1/M3/M5-broader/M6/M7/M8/low-priority
items remain scheduled. No qualifying/race/weather/strategy/results/finance/offseason work.

**READY FOR POST-C AUDIT.** Validation has passed; the updated Cloudflare build is checked after push. Research access
is no longer a blocker after the accepted external handoff. Do not merge or begin qualifying.

## Research-gate changes manifest

21 files changed relative to preserved blocked-record46e1e47:

- `README.md`
- `docs/DEV_STATUS.md`
- `docs/GAME_ARCHITECTURE.md`
- `docs/MILESTONES.md`
- `docs/PLAYER_MANUAL.md`
- `docs/SYSTEM_MAP.md`
- `docs/development-notes/CIRCUIT-RESEARCH-HANDOFF.md`
- `docs/development-notes/CIRCUIT-RESEARCH.md`
- `docs/development-notes/MILESTONE-C.md`
- `scripts/check-milestone-c.cjs`
- `src/game/calendar/calendar2026v2.json`
- `src/game/calendar/index.ts`
- `src/game/calendar/releasedIds.ts`
- `src/game/calendar/types.ts`
- `src/game/defaultGame.ts`
- `src/persistence/__tests__/calendarMigration.test.ts`
- `src/persistence/contracts/README.md`
- `src/persistence/universeValidation.ts`
- `src/simulation/__tests__/calendar.test.ts`
- `src/simulation/__tests__/researchedProfiles.test.ts`
- `src/simulation/calendar/validation.ts`

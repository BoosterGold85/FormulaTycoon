# Post-Milestone B architecture, data-integrity and save-safety audit

Audit of `feature/milestone-b-driver-world` at **`e87aa06`**. The brief named `335f0b7` (B.1), but the branch
has one later commit, `e87aa06` ("configure Cloudflare branch previews"). That commit changes only
`README.md`, `DEV_STATUS.md` and `wrangler.json`, and it is included here. Milestone C was not started.
The audit commit itself adds documentation only. No gameplay, data or save code changed.

Method: read every required document, then the actual implementation (`game/brandRegistry`,
`game/drivers/*`, `game/canonicalDevelopment`, `game/legacy*`, `simulation/drivers/*`,
`simulation/universe/*`, `persistence/*`, `ui/DriversScreen`, `ui/hooks/useGameUniverse`, `App.tsx`)
and all six test suites. On top of the existing suites, temporary headless probes (deleted afterwards) and a fresh 390 × 844
browser pass checked: options, scouting disclosure, save growth, mid-career v1 migration, float grade boundaries and the mobile UI.

## Overall assessment

**READY TO MERGE WITH DOCUMENTED DEBT.** No blockers were found. There is one authoritative career state, and seats derive
from contracts. The canonical data, contracts and four options match the independent fixture exactly. Migrations v1, v2 and v3 behave
as documented and never mutate their input, and save → restore → continue is deterministic. One HIGH finding must be addressed
before C edits shared content; it does not have to be addressed before merge.

## Findings

Severity scale: BLOCKER (fix before merge), HIGH (before C), MEDIUM (scheduled debt), LOW (cleanup), OBSERVATION.

### BLOCKER

None.

### HIGH

**H1. "Frozen" legacy validation definitions share live content.** *Required before merge: no.
Required before C changes any calendar, part, regulation, team, layout or driver content: yes.*
- Files: `game/legacyGame.ts`, `game/legacyDriverGame.ts`, `persistence/driverValidation.ts`,
  `persistence/universeValidation.ts`, `persistence/saveEnvelope.ts`.
- Problem: neither legacy definition is actually a frozen snapshot.
  - The v1 definition uses the live `DEFAULT_DEVELOPMENT_CONTEXT` (parts, calendar, regulations, ten profiles)
    and the live HQ layout and roster.
  - The v2 definition reuses the same `CANONICAL_DEVELOPMENT_CONTEXT` object as the current default.
  - Driver validation derives its fixed ID set from the live `GRID`/`MARKET` content.
- Why it matters: Milestone C is a calendar and track milestone, and the calendar lives inside the shared development context.
  Editing it in place would silently change how v1, v2 and v3 saves validate and migrate, for example through
  submission `eventId`s or part keys. Old careers could then become unloadable or be mis-migrated. The frozen JSON fixtures would
  fail, which is a safety net, but a later agent could "fix" them instead.
- Recommended action: at the start of C, before touching shared content, snapshot the content each released schema
  validated against into versioned, immutable definitions. Bump the save schema to v4 together with C's content change,
  and add a v3 fixture. This needs a deliberate design, so it was not done as an audit hot-fix.

### MEDIUM

**M1. Scouting ranges are centred on the true grade.** Files: `simulation/drivers/selectors.ts` (`driverView`).
- Problem: the range is the true grade ± a radius. In the canonical start, 64 of 116 ranged grades have a midpoint exactly
  equal to the truth, and the rest are clipped at the scale edges, which also reveals it.
- Why it matters: raw numbers stay hidden, but the true grade can be inferred, so prospect uncertainty is largely
  cosmetic. The manual's "estimates" framing remains technically true.
- Action: design a seeded estimator owned by the observer (offset or bias that shrinks with reports, still enclosing the truth)
  before scouting gameplay expands. Not required before merge. Scouting cost and time remain an accepted limitation.

**M2. Two stored campaign clocks.** Files: `simulation/universe/index.ts`, `drivers.season/week`, `development.season/week`.
- Problem: `DriverWorld` mirrors the development clock (+2025). The adapter keeps them in step, and validation
  rejects any mismatch (`drivers.calendar`).
- Why it matters: the same fact is stored twice. It is guarded today, but C introduces the real calendar.
- Action: C should define one campaign-clock owner and derive the driver and development views from it, with a
  migration. Not required before merge.

**M3. Player team is stored twice.** Files: `universe.playerTeamId` and `canonicalDevelopment.ts` (`controlledBy`).
- Problem: the career choice lives both in state and in static definition content. Validation requires them to agree.
- Why it matters: a future team chooser would need per-career definition content.
- Action: before team selection, derive AI or player control from `playerTeamId`. Not required before merge.

**M4. Car fit is composed inside a React component.** Files: `ui/DriversScreen.tsx`.
- Problem: the screen calls `computeCarProfile` and `carCompatibility` with the raw driver object. The DTO's `fit` field
  is unused.
- Why it matters: it is not duplicated logic, but it is selector composition in the UI. C adds car and track
  performance, and driver/car fit must stay a separate domain selector so it never becomes car/track fit.
- Action: add a `driverCarFit(universe, definition, driverId)` selector and remove the dead `fit` field. Should be
  cleaned before or early in C.

**M5. Contract rules are duplicated.** Files: `simulation/drivers/contracts.ts`, `selectors.ts`, `persistence/driverValidation.ts`.
- Problem:
  - The option-deadline predicate is written 3 times: calendar lapse, option decision and validation.
  - The contract-window and overlap predicates appear 5 times: `activeContracts`, the reserve lookup in
    `driverView`, `decideTeamOption`, `signDriverContract` and validation.
- Why it matters: they are consistent today, and probes found no domain-legal state that fails validation. But
  divergence is likely once buyouts, renewals or offseason transitions arrive.
- Action: extract `optionDeadlinePassed`, `contractCovers(season)` and `contractsOverlap` before contract work (H). Not required before merge.

**M6. The 2026 cohort label is used as roster grouping.** Files: `driverView` and `DriversScreen` (`category`, the "22 seats" copy).
- Problem: seats correctly derive from contracts, but the DRIVERS "2026 starting grid", the "22 seats" copy
  and prospect "Unknown" disclosure all key off the fixed cohort label.
- Why it matters: once seats change through options or future signings, the lists will mislead.
- Action: group by derived contract role before H, keeping the cohort label as history. Not required before merge.

**M7. Development upgrade history grows without bound.** Files: `development.submissions` and save validation.
- Problem: about 150 submissions per season. The serialized save grows by about 41KB per season (96KB at start,
  509KB after 10 seasons), and serialize plus validate rose from about 25ms to 56–82ms.
- Why it matters: projected to about 2MB after 50 seasons. This is not urgent, but G needs an archive or compaction policy.
- Action: measure again and decide at G. Not required before merge.

**M8. Fictional IP risk in working identities.** Files: `game/drivers/grid.ts`, `brandRegistry.ts`, `performance2026.ts`.
- Problem:
  - Driver identities pair real first names with lightly altered surnames (for example Lewis Harlton, Max Verhoeven,
    Charles Leclair).
  - Team names closely echo real teams (for example Mclarin).
  - A real third-party dataset label (`P2P 2026`) and its values are persisted in saves (not displayed).
- Why it matters: guardrail 14 forbids near-copies as permanent identities. These are owner-supplied working
  identities, already tracked in DEV_STATUS as release risk.
- Action: legal and originality review before any release. No merge impact.

### LOW

- **L1:** `DriversScreen` decides option-button eligibility by parsing the display string (`option?.includes('pending')`),
  and `exerciseOption` ignores failures silently. The domain still validates ownership and deadlines, so no invalid
  state is possible. Expose a `canExerciseOption` selector and surface refusals.
- **L2:** Dead or placeholder surface that future agents could mistake for active features:
  - the unused hook APIs `advanceWeek` and `checkpoint`;
  - the unused DTO field `fit`;
  - unused future interfaces `marketValue`, `technicalContribution` and `commercialContribution`, plus the deprecated
    `GameSaveStorage`.
  `marketValue` is a weighted aggregate of all six abilities and must never be shown as a rating.
- **L3:** The name `DEFAULT_DEVELOPMENT_CONTEXT` refers to the legacy ten-team context. The real default is
  `CANONICAL_DEVELOPMENT_CONTEXT`, so the name is a trap.
- **L4:** `sourcePerformance` (about 4KB) is copied into every new save but never read at runtime, and it is not checked
  for equality with the canonical content. That is acceptable as a historical snapshot; either validate it or store a reference.
- **L5:** The HQ HUD still shows the placeholder "Your Team" although state holds Wellington.
- **L6:** Documentation drift:
  - `docs/ROADMAP.md` still describes a ten-team "Milestone 1";
  - `DEVELOPMENT_ENGINE.md` describes the ten-team context;
  - `MILESTONES.md` says B/B.1 are "not merged or pushed" (they are pushed).
- **L7:** `migrateSave` replaces v1/v2 validation messages with one generic error, which makes failed imports harder to diagnose.
- **L8:** Grade conversion has no float tolerance. All 69 derived values grade correctly today: Takase's Composure is
  exactly 85, giving A, and no value lies within 0.05 of a threshold. Future derived means could produce artifacts such as 84.99999999999999.
- **L9:** The reserve driver Takase shows the affiliated Vortex car under "Current car" although he holds no race seat.
- **L10:** DEV_STATUS "TESTED" still cites the author's browser script under `/workspace/artifacts`, which is not in
  the repository.

### OBSERVATIONS

- Wellington is set to PLAYER, so its development never auto-plans headlessly. Projects that Northstar had pending
  in a migrated v1 save still complete.
- Caldera's profile reuses Kestrel's facilities, staff and power unit, overriding level 62, budget 40,
  correlation 65 and aggression 0.45. The eleven-entry wind tunnel allowance runs from 70% to 120%.
- After migration, AI planning random draws are keyed by the new team IDs, so future rival choices differ from the pre-migration
  trajectory. Only pending project outcomes were promised to stay stable, and they do (opaque IDs are kept).
- A v1 save migrated in 2028 has 7 active race contracts, because the starting deals expire and there is no offseason AI.
  This is documented and valid.
- Driver names, summaries and traits are career data in saves. Identity always uses stable `driver.*` / `team.*` IDs.
- 3.9MB of tracked screenshots live under `docs/` and are not bundled into the app.
- The HQ keeps ticking while DRIVERS is visible, and each snapshot rebuilds 43 DTOs. This is negligible at current scale.

## Data integrity

- **Canonical 2026 ratings:**
  - All 23 records (22 starters plus Takase) match the independent fixture exactly, including the three unranked
    13/18 contexts.
  - Values are stored unrounded, and the three source-backed buckets are equal-weight means (no rounding before grading).
  - Adaptability, Technical Feedback and Marketability keep their authored values.
  - Grading has one owner (`gradeIndex`/`gradeFor`), whose thresholds match the brief exactly. Ranges use the same function.
  - No screen recreates thresholds.
  - No raw values, `overallReference` or universal overall appear in DTOs, selectors or UI. Browser text confirms this.
- **Canonical contracts:** all 23 salary, team, end-year and provenance records match.
  - Exactly four options exist: Harlton 2028 (decide by 2027 W40), Ortez 2027 (2026 W40), Bearford 2027 (2026 W40)
    and Botten 2028 (2027 W40).
  - Only the owner can act on an option. A driver or seat booked elsewhere blocks exercise, and an exercised option blocks
    a rival signing.
  - Years remaining are derived and never stored.
  - Option deadline and option-year salary are the documented assumptions, not source data.
- **Grid:** 11 teams and 22 race seats, two per team (seats 1 and 2), with 10 prospects, 11 reserves and 43 people in total.
- **Reserve handling:** Takase's reserve contract has a null seat and no option, never appears in `activeContracts`/TEAM,
  and still blocks overlapping race employment. Expiry produces vacancies safely.

For owner cross-check against the original source text (the fixture was transcribed by the B.1 agent; this audit can
verify runtime == fixture but cannot see the original document):

| Driver | Pace | Racecraft | Tyre | Quali | Consist. | Discip. | Overall ref | Team | $M/yr | Through | Option | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| antonello | 91 | 95 | 90.1 | 90.9 | 85.3 | 90.6 | 89.1 | mercurion | 2 | 2027 | — | CONFIRMED |
| verhoeven | 92.3 | 86.9 | 85 | 86.6 | 70.8 | 95.2 | 85.1 | vortex | 107 | 2030 | — | CONFIRMED |
| ronnis | 87.5 | 81.2 | 82.6 | 83.7 | 78.5 | 94.8 | 82.8 | mclarin | 35 | 2030 | — | CONFIRMED |
| harlton | 83.2 | 85.9 | 88.4 | 84.3 | 86.2 | 89.4 | 82.7 | ferano | 60 | 2027 | 2028 | CONFIRMED |
| leclair | 85.7 | 86.3 | 82.6 | 85.5 | 73.9 | 93.8 | 82.4 | ferano | 53 | 2030 | — | REPORTED |
| roussel | 78.4 | 87.9 | 86.6 | 86.9 | 76.1 | 90.7 | 81.5 | mercurion | 34 | 2027 | — | CONFIRMED |
| piastra | 76.3 | 76.5 | 80.1 | 79.7 | 84.7 | 91.3 | 76.7 | mclarin | 27 | 2028 | — | CONFIRMED |
| gasson | 77.9 | 67.7 | 71.5 | 74.3 | 86.6 | 88.3 | 73.6 | alpinor | 15 | 2028 | — | CONFIRMED |
| larsen | 72.2 | 73.4 | 69.1 | 69 | 88.3 | 92 | 71.8 | veloce | 1 | 2026 | — | CONFIRMED |
| hadrian | 68.3 | 70.4 | 77.5 | 78.5 | 75.8 | 92.7 | 71.3 | vortex | 5 | 2027 | — | CONFIRMED |
| lindholm | 64.9 | 69.8 | 71.1 | 67.7 | 85.5 | 90.4 | 68.2 | veloce | 0.75 | 2026 | — | CONFIRMED |
| hollenberg | 70.8 | 60.9 | 67.8 | 65.3 | 84.3 | 83.4 | 66.9 | auden | 7 | 2027 | — | CONFIRMED |
| bearford | 65.3 | 57.9 | 66.3 | 68.4 | 79.5 | 91.4 | 64.9 | hartman | 1 | 2026 | 2027 | CONFIRMED |
| ortez | 63.1 | 68.9 | 62 | 59.4 | 82.3 | 91.9 | 64.8 | hartman | 7 | 2026 | 2027 | CONFIRMED |
| bortelli | 64.4 | 58.4 | 63.6 | 66.5 | 82.6 | 89.5 | 64.6 | auden | 2 | 2028 | — | REPORTED |
| takase (reserve) | 68.6 | 56.8 | 70.1 | 56.8 | 78 | 92 | 64.5 | vortex | 5 | 2026 | — | REPORTED |
| sainor | 62.5 | 64.7 | 59.4 | 65.8 | 82.6 | 82.9 | 64 | wellington | 30 | 2027 | — | CONFIRMED |
| colavita | 59.9 | 63.1 | 65.9 | 62.1 | 79 | 80.8 | 61.7 | alpinor | 0.75 | 2027 | — | CONFIRMED |
| alburn | 59.8 | 62.7 | 53 | 55.7 | 78 | 89.5 | 59.9 | wellington | 12 | 2027 | — | CONFIRMED |
| peralta | 58.9 | 63.3 | 55.6 | 56.4 | 77.6 | 81.7 | 59.7 | caldera | 10 | 2029 | — | CONFIRMED |
| alvarro | 56.6 | 58.8 | 56.4 | 61.4 | 78.1 | 89.2 | 59.4 (13/18 unranked) | arden | 40 | 2027 | — | CONFIRMED |
| sterling | 56.8 | 62.3 | 57.5 | 51 | 77.9 | 91 | 58.9 (13/18 unranked) | arden | 17 | 2027 | — | CONFIRMED |
| botten | 45.8 | 49.8 | 47.6 | 53.9 | 71.4 | 89.1 | 51.5 (13/18 unranked) | caldera | 5 | 2027 | 2028 | CONFIRMED |

## Architecture

- **Ownership:** `App` → `useGameUniverse` is the single owner, and commands read the latest ref.
  - `GameUniverse` holds HQ, development and `DriverWorld`.
  - Seats and current team derive from signed, date-valid contracts. There is no mutable roster table.
  - `familiarity.teamId` and `affiliatedTeamIds` are separate facts, not seat assignments.
  - Knowledge is per observer, with no copies of true profiles.
  - Calendar placeholders are display-only constants.
  - Duplicated facts (M2, M3, and the driver-to-contract index `history.contractIds`) are each validated for
    consistency. There is no unguarded competing state.
- **UI and simulation separation:** screens display DTOs and dispatch scout and option commands. Grade, contract-expiry,
  option and scouting rules live in `simulation/drivers`. The exceptions are M4 (car fit) and L1 (option button).
  No component writes abilities, seats or contracts directly.
- **Coupling:** car fit reads car characteristics at an average circuit (no track, no event). It never feeds development,
  race, sponsor or finance code. The feedback, commercial and market interfaces are unused placeholders.

## Save and migration health

- **v1 → v3:** the full legacy schema is validated first, then the explicit ten-to-eleven map is applied.
  - HQ, parts, projects, spend, allowances and history are preserved.
  - Opaque pending project IDs are kept, so keyed outcomes are unchanged.
  - Caldera is initialized fresh at a 120% allowance.
  - The driver world is initialized at the save's current date.
  - Unmapped or invalid IDs fail.
  - The legacy IDs that remain are classified as intentional: the frozen ten-team fixture and profiles, the
    migration map, the project-ID prefix check in validation, and the tests and fixtures. No dead usage remains.
- **v2 → v3:** validated against the B definition. Abilities, signed terms, option decisions and knowledge are retained.
  Only source snapshots and Takase are added.
- **v3:** identity plus full validation. Missing, invalid, future and unknown versions fail with codes, with no partial or default
  game. Input is never mutated: migrations deep-copy, and the result is detached.
- **Persisted identity:** stable IDs (`team.*`, `driver.*`, `contract.*`) are persisted. Display names are not used as keys.
- **Risks:** H1 and L7. The fixed 43-person closed schema and the full knowledge matrix will need versioned migrations
  for procedural drivers, as already documented.

## Determinism

- The driver world uses no RNG. IDs are deterministic (`contract.2026.N`, `contract.new.N`, the reserve ID), and no wall-clock time
  reaches simulation (`Date.now` appears only in the HQ animation timer).
- Gameplay order comes from definition arrays, not from object key order.
- Save → restore → continue was verified for:
  - a v3 save after scouting;
  - a 52-week season plus a season rollover;
  - a v2 import;
  - a v1 import made in 2028 W10, continued for 20 weeks (audit probe).

## Test quality

The 161 tests protect the important player expectations:
- **Grid:** 11, 22, 2 seats per team, 43 people.
- **Contracts:** conflicts, ownership, deadlines, idempotence, expiry and reserve overlap.
- **Scouting:** enclosure, narrowing, observer isolation and truth unchanged.
- **Canonical data:** exact source and contract rows from an independent fixture.
- **Migrations:** frozen v1 and v2 fixtures, a progressed v2, and v3 round trips.
- **Saves:** malformed-save rejection matrices.
- **Existing systems:** HQ and development regressions.

Meaningful gaps:
1. A guard that legacy definitions cannot drift (H1).
2. An explicit owner exercise and lapse test for Bearford and Botten. This is covered generically, and the audit probe
   passed for all four options.
3. A test of 11-team canonical development over several seasons (balance evidence remains documented debt).
4. Option-button eligibility, which is tested only in the browser.

No trivial tests were added.

## Performance

At the current scale there are no concerns: 43 DTOs per render, about 2k contract-filter operations, and a 96KB starting save. Save
growth (M7) is the only trend worth measuring at G. There is no full-universe cloning on UI actions; scout and option
commands copy shallowly. Validation is O(contracts²), which is negligible at 23 contracts.

## Player manual accuracy

`PLAYER_MANUAL.md` matches the implementation:
- the six grades, with no overall rating;
- form starting at NORMAL and not yet evolving;
- car fit as a coarse estimate with no effects;
- feedback and marketability with no bonuses or income;
- guaranteed and future years, owner-only options with deadlines and lapses, vacancies, and Confirmed/Reported status;
- Takase's reserve status;
- free, instant, team-specific scouting;
- volatile saving.

It reveals no formulas and claims no unimplemented system as active. Two caveats: its "estimates" wording should be
revisited when M1 is fixed, and the "assigned car" wording is loose for reserves (L9).

## Dependencies

There are no dependency changes relative to `main`: `package.json` and the lockfile are identical. The runtime dependencies are
`expo`, `react`, `react-native`, `react-dom`, `react-native-web`, `@expo/metro-runtime` and `expo-status-bar`, all used.
Dev dependencies are `jest`, `jest-expo`, `@types/jest`, `@types/react` and `typescript`. There are no duplicates or unused packages.

## Validation results (this audit)

- `npm test -- --runInBand`: PASS, 161/161, six suites.
- `npm run typecheck`: PASS.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: PASS. `dist/` is static export only.
- Chromium at 390 × 844, touch, device scale 2, against the fresh export. All of the following passed:
  - HQ 8/8;
  - worker card and dismissal, and department card;
  - NEW DAY 0/8;
  - grid 22, prospects 10, market 11;
  - six buckets on detail with no overall;
  - Verhoeven $107M/2030 with 4 future years;
  - the Harlton, Ortez, Bearford and Botten option texts and deadlines, with no foreign option buttons;
  - Sainor with no option;
  - prospect ranges and Unknown, with 2 reviews moving confidence LOW to MEDIUM;
  - Takase as a reserve on $5M with the Vortex/Veloce system;
  - TEAM showing exactly Sainor and Alburn;
  - RACE "Coming soon";
  - scouting persisting across navigation, and the HQ session retained (8/8 after return).

  There were zero page or console errors and no horizontal overflow. One scripted "identity at top" assertion failed
  because of a role-name mismatch in the script. The screenshot confirms the identity header is at the top, so this is not a regression.
- NOT VERIFIED: native iPhone/Expo Go, real-device performance, the Cloudflare remote deploy and durable storage.

## Fixes made during audit

None required. The only change is documentation: this report and DEV_STATUS.

## Deferred technical debt

H1 (before C edits shared content); M1–M8; L1–L10.

## Merge recommendation and next milestone

Merge B/B.1 into `main` as **READY TO MERGE WITH DOCUMENTED DEBT**, on owner approval.

Next milestone: **Milestone C — Calendar, Track Profiles & Car-to-Track Performance**. It should open with H1 (snapshot the
released content plus a v4 schema) and fold in M2 (one campaign clock) and M4 (a car-fit selector). C was not started.

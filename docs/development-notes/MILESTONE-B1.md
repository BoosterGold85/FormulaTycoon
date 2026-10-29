# B.1 — Canonical 2026 Driver Data Alignment

Five pre-implementation questions:
1. Owner: existing driver domain; plain canonical data owns source snapshots/starting terms.
2. Persistent changes: source subskills/reference metadata, individual starting contracts and one
   reserve affiliation/contract. Single timelines still own contract expiry/years remaining.
3. Connections: centralized grade derivation -> disclosure UI; driver validation/save migration;
   future racing may read separate subskills, not source overall as a universal driver rating.
4. Risks: transposed decimals/contracts, unwanted third race seat, option display on non-option
   drivers, raw source leakage, overwriting saved career decisions, losing unknown scouting state.
5. Proof: independent exact expected tables, derivation boundaries, reserve exclusion, all existing
   suites, save/migration regression fixtures and 390x844 profile/contract/prospect/HQ checks.

Assumptions for unspecified source fields: option decision deadline stays week 40 of the last
guaranteed year; option-year salary equals the supplied annual salary (no invented raise).
Performance bonus remains B's existing $0.35M for starters; reserve has no bonus. Those figures
are not represented as supplied contract data. New reserve: Yuto Takase, `driver.takase`, Japanese,
25, associated with Vortex/Veloce, primary reserve employer Vortex. No 23rd race seat.

Derivation: equal-weight mean of Pace/Qualifying -> Talent; Racecraft/Tyre Management ->
Racecraft; Consistency/Discipline -> Composure. No rounding before centralized letter conversion.
Adaptability/Feedback/Marketability remain the authored B values. Source observations are a
separate 2026 snapshot, not immutable lifetime ability; no form/growth/racing engine is added.
Initial form stays NORMAL (the source doesn't separate car results from form).

Schema v3/default content `driver-world-2026-aligned-v3` adds the reserve and optional source/
contract metadata. V1 retains the explicit team migration and starts aligned driver content.
V2 is validated against its frozen definition before upgrading: existing abilities, contracts,
option decisions, knowledge, HQ, development and history are preserved; source metadata and
Takase are added without replacing the career. Source-backed starting terms are for NEW games.
If a v2 user had changed a name/ability/contract, that saved fact is not silently overwritten.
Source v2 input is never mutated. V3 reload is identity plus validation. Trusted checkpoints keep
requiring a compatible definition rather than pretending to be imported save files.


## Validation and handoff

- `npm test -- --runInBand`: PASS, 161 tests in six suites (100 previous + 61 alignment).
- `npm run typecheck`: PASS.
- `EXPO_NO_TELEMETRY=1 npm run build:web`: PASS.
- `node /workspace/artifacts/milestone-b1/browser.cjs`: PASS against the static export on
  `http://127.0.0.1:8768`, Chromium at 390 × 844, device scale 2. Browser tooling was already
  available in the cloud; no npm/package/system installation performed.
- `git diff --check`: PASS. No failed/skipped automated cases. Final suite covers raw source
  records, deals/options/provenance, thresholds, derived years, reserve employment conflicts
  and later signing, DTO boundaries, legacy initializer fidelity, v1/v2 migration, v3 round trip,
  deterministic continuation and all existing HQ/development/persistence regressions.
- Browser: 22/10/11 cohorts and two TEAM contracts, Max $107M/2030, Harlton $60M/2027 + 2028
  option, Ortez $7M/2026 + 2027 option, Leclair $53M/2030 Reported, Takase $5M/2026 Reserve,
  Wellington $30M/$12M without options. Foreign option buttons absent. Profile/prospect/scouting,
  navigation retention, HQ 8/8, worker/department cards, NEW DAY 0/8 all pass. No page errors or
  horizontal overflow. Visual review found retained scroll hiding profile identity; minimal
  scroll-to-top effect fixed it, with a browser identity-position regression assertion.
- Nonblocking build warnings: NO_COLOR ignored because FORCE_COLOR is set. npm update notice
  was informational; nothing updated. Logs and browser script are cloud artifacts under
  `/workspace/artifacts/milestone-b1/`. Screenshots are tracked under `docs/screenshots/milestone-b1/`.

## Delivery scope and recommendation

Performance: exact 23 supplied snapshots preserved independently from ability/form; overall
reference stays internal. Authored Adaptability/Technical Feedback/Marketability unchanged for
existing cast. Contracts: exact 23 salary/end/team records and four options. Reserve affiliation
and nullable-seat role are the only contract-shape extension, not a DriverWorld redesign.
Years remaining remain derived. Initial form is NORMAL, with no dynamic form engine.

Manual covers the six evaluations, whole-driver performance concept, fit, veteran feedback,
commercial context, guaranteed/option terms/expiry, source status, scouting uncertainty, HQ and
prototype saving limitations without hidden formulas. AGENTS and permanent guardrails require
manual updates at every major player-facing Definition of Done.

Known limits: unspecified option salary/deadline assumptions above; retained $0.35M starter bonus
is not source-supplied. Existing B careers preserve their old ratings/deals instead of resetting.
Free scouting, no automatic offseason recruitment, no real payroll/sponsors/racing/growth/form
updates; save adapter remains volatile with no player save/load screen. Native/device performance,
deployment, durable recovery and long-career balance remain unverified.

Recommendation: ready for B/B.1 review, with explicit attention to the documented option assumptions
and non-destructive v2 import policy. Do not merge/push without instruction. Do not start C.

## Delivery file manifest

- `AGENTS.md`
- `README.md`
- `docs/DEVELOPMENT_GUARDRAILS.md`
- `docs/DEV_STATUS.md`
- `docs/GAME_ARCHITECTURE.md`
- `docs/GAME_LOOP.md`
- `docs/MILESTONES.md`
- `docs/PLAYER_MANUAL.md`
- `docs/SYSTEM_MAP.md`
- `docs/development-notes/MILESTONE-B.md`
- `docs/development-notes/MILESTONE-B1.md`
- `docs/screenshots/milestone-b1/01-grid.png`
- `docs/screenshots/milestone-b1/02-established.png`
- `docs/screenshots/milestone-b1/03-option.png`
- `docs/screenshots/milestone-b1/04-option-2027.png`
- `docs/screenshots/milestone-b1/05-reported-contract.png`
- `docs/screenshots/milestone-b1/06-prospect.png`
- `docs/screenshots/milestone-b1/07-reserve.png`
- `docs/screenshots/milestone-b1/08-team.png`
- `docs/screenshots/milestone-b1/09-hq-worker.png`
- `docs/screenshots/milestone-b1/10-hq-new-day.png`
- `docs/screenshots/milestone-b1/README.md`
- `src/game/defaultGame.ts`
- `src/game/drivers/contracts2026.ts`
- `src/game/drivers/market.ts`
- `src/game/drivers/performance2026.ts`
- `src/game/drivers/types.ts`
- `src/game/legacyDriverGame.ts`
- `src/persistence/__tests__/fixtures/canonical-2026.json`
- `src/persistence/__tests__/fixtures/driver-world-v2.json`
- `src/persistence/alignmentMigration.ts`
- `src/persistence/driverValidation.ts`
- `src/persistence/saveEnvelope.ts`
- `src/persistence/universeValidation.ts`
- `src/simulation/__tests__/driverAlignment.test.ts`
- `src/simulation/__tests__/drivers.test.ts`
- `src/simulation/drivers/contracts.ts`
- `src/simulation/drivers/performance.ts`
- `src/simulation/drivers/selectors.ts`
- `src/simulation/drivers/world.ts`
- `src/simulation/universe/index.ts`
- `src/simulation/universe/types.ts`
- `src/ui/DriversScreen.tsx`

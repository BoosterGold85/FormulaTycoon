# Milestone B implementation notes

Historical record of B (`e065ebd`). B.1 supersedes its generic starting ratings/contracts,
42-person count and current save version. See MILESTONE-B1.md for the aligned content/migration.

## Five questions (recorded before delivery)

1. **Owner:** `simulation/drivers` owns driver initialization, contracts, calendar expiry, scouting
   and disclosure. Canonical identities/content are in `game/brandRegistry` and `game/drivers`.
   `GameUniverse.drivers` is the single persistent owner; seats are derived from contracts,
   never duplicated as mutable team rosters. UI stores navigation/selected ID only.
2. **State:** driver identity/age basis, six true abilities, hidden potential/growth/personality,
   dynamic form/morale/confidence/fatigue, comfort/familiarity/commercial profiles, history,
   contracts/options, observer-specific knowledge and contract ID counter. No race/economy state.
3. **Connections:** canonical team IDs join development and contracts; validated v2 saves own
   restoration/migration. Future race engines consume ability + car-fit inputs; engineering gets
   a feedback/experience interface, sponsors a commercial-market interface; finance gets salary/
   bonus obligations. Staff/facilities/offseason/growth remain consumers planned for later slices.
4. **Failure cases:** duplicate identities/seats, overlapping driver deals across teams, wrong IDs,
   invalid grade/hidden bounds, missed option deadlines, expired active deals, leaking hidden
   truth, scouting changing skill, lost market/knowledge on restore and malformed legacy saves.
5. **Proof:** fixed 11/22/42 counts and two seats/team; bounds/disclosure/grade tests; contract
   overlap/deadline/idempotence/expiry tests; independent observation narrowing; malformed save
   rejection; v1 migration with mapped history/pending projects; deterministic continuation;
   all legacy regression suites, types/build and phone-size navigation/profile/scouting/HQ smoke.

## Deliberate assumptions

- Wellington is the initial player organization; no new-game team chooser in B. Its two seats
  are Sainor/Alburn. Other teams remain AI; no full personnel AI or hiring UI is introduced.
- Ages, abilities, contract amounts and reputation summaries are fictional design values, not
  copied real statistics/birth dates/contracts. All 42 cast profiles are fixed across seeds.
- All starters get 2026–2027 contracts with a 2028 team option, deadline 2027 W40. No claims about
  real-world terms. Annual salary/one performance-bonus obligation are $M; no payroll/payouts.
- New domain contracts have guaranteed terms only; exercising existing fixed starting options
  is supported. No buyouts, driver options, negotiations, signing bonuses or transfer fees.
- Free scouting report review adds 20 knowledge points; no costs/time/staff simulation. Grade
  envelopes deliberately contain true grades. Actual evidence capture and imperfect estimators
  can replace this simple conservative model later without duplicating true profiles.
- Current-car fit uses downforce/mechanical-grip proxies, not a new braking/balance/race model.
  Technical feedback/marketability interfaces do not secretly award development/sponsor effects.
- Existing development math is unchanged. Ten calibrated profiles map to canonical organizations;
  Caldera starts from a distinct initialization (level 62, budget 40, correlation 65, aggression .45).
  ATR has eleven entries, 70–120%. Rebalance is future work, not a claim of championship realism.

## Legacy content migration

`CURRENT_SAVE_VERSION=2`, default definition `driver-world-2026-v2`. Legacy ten-team definition
is frozen in `legacyGame.ts` for validation/regression. v1 input must pass old full validation
before migration. Explicit map: aurora→vortex, rossa→ferano, silverline→mercurion, papaya→mclarin,
emerald→arden, azure→alpinor, northstar→wellington, falcon→hartman, ironworks→veloce,
kestrel→auden (all targets `team.*`). This is a product mapping, not a historical equivalence.

Keep seed, season/week, HQ, parts, specs, projects, spend, allowances and upgrade history. Rewrite
actual team references; keep opaque pending project IDs, preserving their keyed RNG outcomes.
Caldera alone gets fresh initial parts/zero spend; driver world initializes for the current date,
with past starting contracts naturally expired where applicable. No retroactive driver results.
The original save remains untouched; caller must explicitly save migrated data. v2 identity load
is idempotent. Invalid/unknown legacy IDs fail instead of resetting the career.

## Disclosure and scope

Public views show letter grades/ranges/Unknown, age, identity, contract terms, selected known traits
and qualitative potential/confidence. No overall driver score or raw internal abilities/potential/
personality. Commercial reach is withheld for incompletely known market drivers as well.
No racing, qualifying, track simulation, points, sponsors, finances, facilities construction,
full driver development, retirement or offseason logic. Future careers are not forced to real history.

## Delivery file manifest

- `App.tsx`
- `README.md`
- `docs/BRAND_IDENTITY.md`
- `docs/DEV_STATUS.md`
- `docs/GAME_ARCHITECTURE.md`
- `docs/GAME_LOOP.md`
- `docs/MILESTONES.md`
- `docs/SYSTEM_MAP.md`
- `docs/development-notes/MILESTONE-B.md`
- `docs/screenshots/milestone-b/01-grid.png`
- `docs/screenshots/milestone-b/02-detail.png`
- `docs/screenshots/milestone-b/03-prospects.png`
- `docs/screenshots/milestone-b/04-scouting.png`
- `docs/screenshots/milestone-b/05-team.png`
- `docs/screenshots/milestone-b/06-market.png`
- `docs/screenshots/milestone-b/README.md`
- `src/game/brandRegistry.ts`
- `src/game/canonicalDevelopment.ts`
- `src/game/defaultGame.ts`
- `src/game/drivers/grid.ts`
- `src/game/drivers/market.ts`
- `src/game/drivers/types.ts`
- `src/game/hudPlaceholders.ts`
- `src/game/legacyGame.ts`
- `src/persistence/__tests__/fixtures/foundation-v1.json`
- `src/persistence/__tests__/saveRepository.test.ts`
- `src/persistence/driverValidation.ts`
- `src/persistence/saveEnvelope.ts`
- `src/persistence/teamMigration.ts`
- `src/persistence/universeValidation.ts`
- `src/simulation/__tests__/drivers.test.ts`
- `src/simulation/__tests__/universe.test.ts`
- `src/simulation/drivers/carFit.ts`
- `src/simulation/drivers/contracts.ts`
- `src/simulation/drivers/index.ts`
- `src/simulation/drivers/selectors.ts`
- `src/simulation/drivers/world.ts`
- `src/simulation/universe/index.ts`
- `src/simulation/universe/types.ts`
- `src/ui/DriversScreen.tsx`
- `src/ui/HeadquartersScreen.tsx`
- `src/ui/hooks/useGameUniverse.ts`

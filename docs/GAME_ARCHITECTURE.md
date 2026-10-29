# Game architecture

Milestone A establishes a composed, headless universe without replacing the tested HQ or
car-development engines. Read DEV_STATUS.md first for implementation evidence and limitations.

## Audit of the starting tree

| Area | Existing behavior and debt | Decision |
|---|---|---|
| `game/models.ts`, `headquartersData.ts` | Fixed eight-person roster, room/station/nav/prop definitions | Keep stable; visible workers are not yet the organization-wide staff system |
| `simulation/headquarters` | Pure assignment, deterministic routing, 50 ms movement, IDLE/WALKING/WORKING | Keep rules and APIs; compose state under universe |
| `game/development` | Ten fictional AI team profiles, eight parts, facilities, staff quality, 24 events, regulations | Reuse IDs and definitions; do not create duplicate team/car tables |
| `simulation/development` | Weekly planning, budgets, projects, introduction, failures/reversions, reliability and winter reset | Keep; this is development, not a race/finance simulation |
| `carModel.ts` | Six attributes, average/event-weighted pace and reliability | Existing pace is a planning proxy, not a race result; track translation belongs to C |
| HQ hook/UI | Hook owned only HQ state; other tabs/HUD are placeholders | Root App now owns a universe hook and passes HQ projection/actions down |
| Persistence | No saved format, storage or autosave existed | A: trusted checkpoints; A.1: validated serialized envelope/repository and volatile adapter |
| RNG | One PRNG, development-local keyed stream factory | Share the factory without changing hashing, calls or existing outcomes |
| Tests/deploy | 36 engine tests, Jest/Expo, static web export; no checked-in CI workflow | Keep commands; add integration tests; deployment remains external |

Duplicate-looking concepts are not interchangeable: HQ milliseconds are animation time, development
weeks are campaign time; worker roles are not engineering-quality ratings; development spend is
not team cash; development team profiles are not driver rosters. No automatic conversions yet.
The original HUD comment claiming no team/calendar system existed was stale: the engine had
both definitions, but no HUD integration. No UI redesign was needed.

## Layer contracts

1. `src/game`: plain content/configuration. Stable string IDs, not UI component references.
2. `src/simulation`: pure transitions and queries. No React, timers, storage or wall clock.
3. `simulation/universe`: composition/coordination, never a second copy of subsystem rules.
4. `src/persistence`: snapshots, version dispatch, future migrations and storage contracts.
5. `src/ui`: application lifetime, scheduling, input dispatch, derived views, animation.

Runtime flow: player command -> pure universe/subsystem transition -> authoritative state ->
optional checkpoint -> presentation projection. Storage is a side effect outside simulation,
not a dependency required on each render. Persist first only when a command needs durable
confirmation; do not put racing rules in UI handlers or storage adapters.

`App` owns `useGameUniverse(DEFAULT_GAME_DEFINITION)`. Its ref holds the latest authoritative
universe; the React snapshot is deliberately less frequent for animation performance. Commands
read the ref, never a potentially stale displayed snapshot. Future navigation must remain below
this owner. Mounting one session per screen would create independent games and is prohibited.
Definition/seed initialize a session; changing props is not a new-game/load operation. Future
new-game/load commands must explicitly replace the owner state after validation (or remount the
session), never quietly discard progress. There is no singleton service, new global framework
or empty screen scaffolding.

## State ownership

`GameUniverse` contains definition version, seed, player selection, HQ runtime, DevelopmentWorld
and (for the canonical B definition) DriverWorld. Legacy definitions omit DriverWorld. `GameDefinition` supplies layout/roster/development context. It is treated
as immutable. Version strings must change when content/rules need migration; they are not an
automatic content hash. A changed definition cannot be applied to an old universe silently.

DevelopmentWorld currently owns season/week, runtime cars/parts/projects, spending and upgrade
history. Queries should derive calendar/team/car views from those owners instead of mirroring
values. Universe HQ ticks and NEW DAY never advance/reset development. Weekly advancement is
explicit; end-of-season advancement requires complete caller-supplied standings. No race results
are invented from development pace. The canonical B definition has eleven teams and Wellington as the documented initial player
organization. The original ten-team context remains a legacy fixture, not the new-game default.
No staff/driver-to-development bonuses are silently introduced.

## Future universe domains (design only)

| Domain | Owner/relationship when implemented |
|---|---|
| Season/calendar | Campaign clock, events reference track IDs; migrate existing development season/week once, retain compatibility adapter |
| Teams/cars | Canonical team IDs extend existing profiles; per-season cars reference team and part specs |
| Drivers/staff/principals | Persistent people IDs; HQ workers reference staff IDs when that mapping actually exists |
| Contracts/scouting | Contracts reference people/team IDs; scouting exposes estimates separately from hidden true ability |
| Finances/sponsors | Ledger and obligations; development spending becomes a ledger transaction through an adapter, not a second charge |
| Tracks/weekends | Track data, session state, entries referencing team/car/driver IDs; pure engine consuming commands |
| Championships/history | Standings derived from official results; archived results and careers survive roster changes |
| Events/news/media | Typed domain events after committed changes; feed text cannot alter authoritative outcomes |
| RNG | Root seed plus system/event/entity keys, versioned with replay rules |

Do not add optional bags for all these systems now. Each enters the universe with its own types,
transitions, tests and save migration when its vertical slice exists. An event bus/ECS or generic
rules framework is not required for the current two systems.

## Save compatibility and replay (hardened in A.1)

Two intentionally distinct contracts exist:

- `gameSave.ts`: A's trusted internal checkpoint API, unchanged for compatibility. Its old
  `GameSaveStorage` is deprecated; it is not an imported-file decoder.
- `saveEnvelope.ts`: the durable serialized format, `CURRENT_SAVE_VERSION = 2`, containing
  gameVersion, saveId, canonical UTC createdAt/updatedAt, and universe. App/repository callers
  supply metadata; domain code never generates wall-clock timestamps or unseeded save IDs.

`createSaveEnvelope` -> `serializeSave` -> `SaveRepository` -> raw `SaveStorage` is the write
boundary. Loading calls `deserializeSave` -> `migrateSave` -> full validation -> detached envelope.
Only `ok: true` exposes a universe. Errors carry a code/message; no partial initialization or
fallback new game. Metadata gameVersion is informational; schema and definitionVersion determine
compatibility. Root/development seed, clocks, routes/assignments, teams/parts/projects and upgrade
history are serialized. No live PRNG/timer/React object enters the format.

Private validators check the complete schema field shape, reject extra/missing keys and nonfinite or
out-of-range numbers, and check IDs, slot/worker correspondence, route references, project
progress/sequence, budget bounds and event chronology. This is structural/domain consistency,
not tamper-proof anti-cheat or proof that an entire historical career is authentic. Validation is
scoped to the loaded definition; future systems must extend it and their migration fixtures.

`migrateSave` now upgrades validated v1 legacy saves to v2. It explicitly maps ten-team IDs,
preserves earned development state/HQ/history and initializes Caldera plus DriverWorld. Opaque
pending project IDs stay unchanged so their keyed outcomes remain unchanged. v2 is identity;
missing/future versions fail safely. See development-notes/MILESTONE-B.md for exact mapping.
Original input is not mutated. Future transforms require fixtures and final semantic validation.

`SaveStorage` transports raw strings via write/read/list/delete; it imports no React Native or
platform APIs. `SaveRepository` validates before writing/after reading, checks slot identity and
returns controlled storage errors without overwriting a valid slot on validation failure.
`MemorySaveStorage` is implemented and tested but VOLATILE: no data survives recreation/restart.
The durable FORMAT exists; real-device durable storage, file picker/import UI, autosave, quota
handling, atomic writes/backups and crash recovery are not implemented. A small validated web/native
adapter is the next persistence infrastructure step; no new dependency was added for A.1.

Keyed RNG streams are reconstructed from seed and logical keys; no live PRNG object is saved.
Keep legacy development key sequences unchanged. Future systems use namespaces such as weather,
mechanical, driver-error, pit-stop, scouting and world-event plus season/weekend/entity/draw keys.
Repeated identical keys intentionally replay identical draws. Use stable tokens without `|` until
a new, versioned key-encoding scheme exists. A resumed sequential PRNG would require its cursor
in saved state; do not recreate a stream mid-sequence and expect it to continue automatically.

## Long-run constraints

Future drivers retain nationality/age, distinct pace/racecraft/consistency/tyre/wet/start/aggression/
feedback attributes; hidden potential/curve/peak/personality; form/morale/confidence/fatigue;
contracts/options/value/interest; career team/season history and earnings. Scouting is imperfect.
Tracks contain speed/drag/corner/braking/traction weights, wear/overtaking/pit loss, safety-car,
weather/evolution and street/permanent data. No circuit-name branches in a race engine.

Keep development's vector characteristics; do not use its single planning pace as universal race
strength. Midfield compression, controlled variance and explainable outcomes need statistical
headless tests in C–K. Results must carry causal events for strategy, tyres, weather, reliability
and mistakes. Qualifying traffic/runs/weather timing and pit-wall choices belong in transitions.
History must archive stable IDs and actual outcomes, not references to mutable current ratings.
Hundred-season simulation is a target, not something Milestone A claims to have verified.

## A.1 addendum: permanent product pillars and organization evolution

The permanent pillars are CAR DEVELOPMENT; STAFF & LEADERSHIP; DRIVERS; FINANCES & COMMERCIAL;
FACILITIES; RACING & STRATEGY; TEAM LEGACY. Their future circular tycoon economy is:
facilities -> development capability -> car performance -> results -> prize/sponsor income ->
finances -> staff/driver/facility investment -> future performance. This is a design contract,
not an implemented economy. Never connect visible work loops to invented financial effects.

Facilities are first-class future universe state, owned by team ID. EVERY MAJOR FACILITY UPGRADE
MUST HAVE BOTH A SIMULATION EFFECT AND A VISIBLE HQ EFFECT. Categories: Design & Aero,
Manufacturing, Race Engineering, Driver Simulator, Garage/Assembly, Staff Facilities, Logistics.
Lifecycle: PLANNED -> UNDER_CONSTRUCTION -> COMMISSIONING -> ACTIVE. Definitions/state will
hold construction cost, build time, upkeep, capacity effects, temporary disruption and visual
HQ stage/variant IDs. Only commissioned/active capability applies the designed lasting effect;
construction disruption is explicit and tested. Domain time advances construction, not animations.

Facilities must eventually affect development capability/capacity, staff effectiveness, reliability,
finance obligations, recruitment, logistics and race preparation. One domain transition updates
facility state; capability queries feed other engines and read-only scene selectors choose visible
HQ evolution. Do not maintain separate UI facility levels. Current development profile facilities
are legacy abstract inputs; current HQ furniture is decoration. The facility milestone must replace
those inputs with an adapter from canonical facilities, preserving or migrating existing values
and avoiding double bonuses/charges. No construction, facilities types or gameplay added in A.1.

Fictional organization definitions extend team IDs with identity/history/reputation, finances,
facilities, development and driver philosophy, commercial strength, risk tolerance, fan base and
personality. Different AI choices must follow these traits rather than just colors/names. See
[BRAND_IDENTITY.md](BRAND_IDENTITY.md) for the canonical future registry, working eleven-team grid,
fictional commercial policies and ID/migration rules. No runtime team identity changes in A.1.

## Milestone B: driver/contract/scouting boundary

Canonical identity lives in `src/game/brandRegistry.ts`; fixed profiles live under `game/drivers`.
`simulation/drivers` owns transitions/disclosure, not React. DriverWorld stores 42 profiles,
contracts and observer-owned knowledge. Seats/current team are DERIVED from signed date-valid
contracts; there is no second authoritative roster table. Age derives from ageAt2026 and calendar
year. History arrays are empty initially, with fictional reputation summaries, not real records.

Six raw ability buckets remain independent of part/car strength. Public `driverView` returns
letter grades/ranges/Unknown and qualitative disclosure, never raw ability/hidden personality or
exact potential. Knowledge stores precision/date/report count per observer/driver, not truth copies.
The current conservative uncertainty model always encloses the true grade; report reviews are free
prototype actions. Different observers remain independent. Future growth must version this model.

Contract V1 protects driver/seat overlap across guaranteed and exercised-option windows. Fixed
starting options are callable through a team-authorized transition, have deadlines and idempotent
repeat decisions. Calendar advancement lapses missed options and expires ended contracts without
paying anything. Contract history preserves IDs. No automatic roster refill or offseason AI exists.

Technical contribution and commercial contribution interfaces are available for future engineering/
sponsors; they apply no bonuses/payouts. Coarse carCompatibility uses existing downforce/mechanical
grip proxies and driver comfort, not a race model. The future race engine must consume the full
ability/car/track/weather/strategy/form interaction, not an overall rating. MarketValue is an initial
salary estimate, not shown as a universal player-facing score. Grades are centralized in selectors.

`useGameUniverse` owns report/option commands at app lifetime. DRIVERS/TEAM consume disclosure views;
HQ remains mounted and its simulation/assignments remain intact when navigating. No new dependency.

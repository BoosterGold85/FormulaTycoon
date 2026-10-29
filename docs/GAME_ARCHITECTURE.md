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
| Persistence | No saved format, storage or autosave existed | Introduce versioned trusted checkpoints and storage interface only |
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

`GameUniverse` currently contains definition version, seed, null player selection, HQ runtime
and DevelopmentWorld. `GameDefinition` supplies layout/roster/development context. It is treated
as immutable. Version strings must change when content/rules need migration; they are not an
automatic content hash. A changed definition cannot be applied to an old universe silently.

DevelopmentWorld currently owns season/week, runtime cars/parts/projects, spending and upgrade
history. Queries should derive calendar/team/car views from those owners instead of mirroring
values. Universe HQ ticks and NEW DAY never advance/reset development. Weekly advancement is
explicit; end-of-season advancement requires complete caller-supplied standings. No race results
are invented from development pace. The default context remains ten AI teams; no player takeover
or staff-to-development bonus is silently introduced.

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

## Save compatibility and replay

`GameSave` version 1 is the FIRST trusted in-memory checkpoint contract, not a shipped save file
feature. Capture/restore deep-copy both engines. Unknown schema versions, incompatible content
and inconsistent root/development seeds are refused. No prior user save format exists to migrate.
There is no disk/browser/native storage implementation, autosave, import UI or arbitrary-JSON parser.
`GameSaveStorage` adapters MUST validate unknown data at the boundary before restoring. Never use
`JSON.parse(...) as GameSave` on user files. Current JSON cloning is for known plain-data states only.

Before persistent campaigns ship: implement runtime schema/invariant validation (IDs, slot ownership,
finite values, projects), atomic slot writes/backups, explicit ordered migrations with fixtures,
content-version retention and recovery UX. Never replace an unreadable save with a new universe.
Future migrations must preserve source data, have from/to versions, and reject future versions.

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

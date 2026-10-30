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

GameUniverse owns definition version, seed, player selection, **currentDate**, HQ state,
immutable calendarId, clock-free DevelopmentState and clock-free DriverWorld. currentDate is a branded plain
YYYY-MM-DD string, not a timestamp, with one domain advancement path. Source/current state
contains no competing season/week/weekday/current-round fields. Contract seasons and historical
result/observation timestamps are distinct factual data.

CampaignTime centralizes strict parsing, Gregorian day arithmetic, formatting, comparisons,
weekday/year/deadline queries and derived championship/development context without Date/Intl/
locale/timezone APIs. New careers begin 2026-03-02. Normal advancement rejects backward movement.
HQ milliseconds/frame timers and NEW DAY replay never move the career date.

The existing balanced development kernel consumes an ephemeral DevelopmentWorld temporal VIEW:
root currentDate -> derived season-index/week -> kernel work -> clock-free state. Its time fields
are read-only projections, not persisted ownership. Driver queries/commands receive the root
calendar date explicitly. The old development-to-driver synchronization adapter is removed.

C0.1 preserves prototype time semantics: old season1/week0 -> 2026-03-02; each completed week
adds seven days from the March2 annual anchor. Week52 and next season/week0 stay distinct.
Championship season remains the preceding year through January/February; it is not simply the
calendar year. The annual anchor is a provisional compatibility policy, not the actual race or
offseason calendar. Existing explicit standings-driven reset crosses it; ordinary jumps cannot
invent results. Details and dates are in development-notes/MILESTONE-C01.md.

## Future universe domains (design only)

| Domain | Owner/relationship when implemented |
|---|---|
| Future season lifecycle | Extend existing root date/versioned calendar; preserve released compatibility policy and historical validation |
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

- `gameSave.ts`: trusted internal checkpoint v3 for date-clock state. Older trusted checkpoints
  are incompatible; imported files use the explicit external migration path. Its old
  `GameSaveStorage` is deprecated; it is not an imported-file decoder.
- `saveEnvelope.ts`: the durable serialized format, `CURRENT_SAVE_VERSION = 5`, containing
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
scoped to the released content contract resolved by definition ID, never the caller's live arrays.
Unknown content IDs require explicit registration/migration; future systems add a new contract.

`migrateSave` validates frozen source v1/v2/v3 contracts before any transform. V1/V2 first
reach the immutable canonical v3 boundary, then the explicit v3→v4 migration maps old progress
to currentDate, removes current season/week mirrors and converts option deadlines to dates.
It retains all other earned state, contracts/decisions, knowledge, IDs, history and HQ. New
careers start March2; old careers are not reset to that date. Original inputs remain unchanged.

Historical JSON contracts and fixtures are unchanged. Type-only preCalendarTypes preserves the
old clock shapes for frozen validators while live types remove them. V4 has its own immutable
content snapshot and meaningful migrated fixture. V4 validation rejects duplicate current clocks
and legacy deadline fields; it uses ephemeral date-derived projections for unchanged structural/
content checks, plus the shared explicit-date deadline predicate. These views are never saved.

Permanent migration rule: when persistent structure changes, increment the schema, freeze the
prior contract/semantics, preserve its fixture, implement and test migration, and validate source
and final output. Never edit historical fixtures/contracts just to match live content. Future
changes to C0.1's provisional phase/week interpretation must retain its released mapping and
validation semantics for old data rather than quietly changing the meaning of a saved date.

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
`simulation/drivers` owns transitions/disclosure, not React. DriverWorld stores 43 profiles,
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

## Canonical 2026 alignment (B.1)

`game/drivers/performance2026.ts` owns exact source subskills and reference-only overall metadata.
`simulation/drivers/performance.ts` derives the three source-backed starting buckets; the other
three remain authored. Source snapshots and mutable ability/form are separate facts. Grade
conversion stays centralized in disclosure selectors. Raw sources/reference overall never enter
the public driver DTO. No dynamic form, growth or race engine was introduced.

`contracts2026.ts` owns new-career salary/end/option/provenance content. Contract timelines remain
authoritative; years remaining are derived. Optional role `RESERVE` uses a null seat; absence of
role means the existing race contract. Race contracts require seat 1 or 2. `activeContracts` returns
only race seats, preserving two-person TEAM comparison. Reserve employment still prevents
overlapping driver contracts, but a null reserve seat never occupies a numbered seat. Optional
affiliated team IDs are informational associations, not additional employment/seat assignments.

The B.1 definition was `driver-world-2026-aligned-v3`; `driverDataVersion: 1` identifies the frozen
B definition for validation/compatibility. V3 validates 43 drivers (22 starters, ten prospects,
eleven reserves). V2 validates the original 42. Existing career terms are not retroactively
replaced with the new starting content. Frozen v1/v2 fixtures protect both migration paths.

## C0: driver/car fit and campaign-clock preparation

`simulation/drivers/carFit.ts::selectDriverCarFit` composes current employment, the team's car
profile and qualitative driver compatibility. `DriversScreen` requests the result and does not
build a car or evaluate compatibility. The dead DTO `fit` placeholder is removed. The selector
has no circuit/event input: driver/car fit remains separate from future car/track fit. Existing
race/reserve behavior and fit thresholds are unchanged; L9 remains deferred.

C0 identified duplicated clocks; C0.1 removes both persisted mirrors after the owner's approval
of actual calendar dates. The allowed architecture boundary is now implemented in v4. Current
state has one root date; all source-era schema validation and C0 fixtures remain immutable.
See development-notes/MILESTONE-C01.md for mapping, interval processing, option dates, the
standings-driven transition and remaining compatibility-phase limitations. C adds the registry below.


## Milestone C: calendar, circuits and technical car/track fit

`game/calendar/calendar2026v1.json` preserves the initial content; `calendar2026v2.json` adds
the owner-researched profiles. Both have the same approved23-round schedule and six Sprints. Stable event IDs reference track IDs; geographic
names carry no sponsor branding. `calendarById` returns detached recursively frozen content;
unknown versions fail rather than silently falling back. Runtime authoring validation checks
canonical dates/order/overlaps, round/ID uniqueness, references and bounded technical metadata.

A career persists only its versioned calendarId alongside its one root currentDate (new
careers select v2; saved v1 careers retain v1). The
content ID pins both dates and `track-profiles.2026.v1`; later edits require a new content ID and
explicit migration policy. No event statuses, next-event index, track data, car vectors or field
scores are duplicated in saves. External schema is5; internal trusted checkpoint is3.

Historical V4's content/meaningful fixture remain unchanged. Its former validator now lives in
`contracts/datedValidationV4.ts` and keeps its released date-policy/structural semantics. V1/V2
reach frozen V3, then frozen V4; validated V4→V5 attaches only calendarId/new definition identity.
V5 validation strips/checks that identity before the frozen dated structural checks. Imported
careers keep their dates, all earned development/HQ/driver state, contract dates and RNG IDs.

`simulation/calendar` derives current/next/previous/future events, countdowns and public briefing
views. Weekend membership is inclusive; next means current weekend while inside it, otherwise
next future start. Completed means date passed, not a generated result. After the final event,
queries return no next event; no next season/offseason is fabricated. The C0.1 annual March2
compatibility phase and old weekly development/introduction schedule are deliberately unchanged.
The old24-event engine fixture is not the playable23-round race calendar and is never rendered.
Connecting introduction scheduling to real weekends is future deliberate migration/balance work.

`simulation/trackPerformance` reads the existing `computeCarProfile` attributes, never its average
pace, and derives eleven coarse technical characteristics. Existing part-contribution truth,
package matching and heat/reliability semantics are reused. It does not infer new drag tradeoffs,
altitude physics or detailed aero stability from scalar part ratings. No new authoritative car
state exists. Pure `evaluateCarAtTrack` normalizes cubic circuit demands and weights technical
values; qualitative labels and relevant strengths/concerns derive from that same comparison.
Internal circuit-specific scores support tests/debug field comparisons; public event detail omits
scores/rankings. No driver/form/strategy/weather/RNG input and no named-track/team bonus branches.
`selectDriverCarFit` is unchanged and still answers the separate comfort question.

RACE now hosts calendar/detail views under the same App-lifetime universe. HQ stays mounted;
next-event HUD uses a domain selector. No player date-advance UX, qualifying or race engine added.
Native/durable storage remain unimplemented. **Circuit research is externally verified through the owner handoff; Codex did not retrieve the
underlying pages.**
See MILESTONE-C and CIRCUIT-RESEARCH notes for evidence and the outstanding gate.


### Researched content revision

The owner-supplied external research completes the gate despite direct proxy403. New careers
select immutable calendar.2026.v2/track-profiles.2026.v2; v1 remains unchanged and available.
Both have identical dates/events. Madrid is CONFIRMED/HIGH;23 profiles have19 HIGH/four MEDIUM
confidence. Data corrections do not change starter cars or technical matching formulas.
Save shape/version remains5: calendarId already identifies the revision. A frozen append-only
ID registry extends validation to the newly released ID, independently of the live default.
Existing V5 saves retain their ID; frozen V1–V4→V5 migration still attaches v1. No implicit
migration to new profiles or optional upgrade UI is added. The same core definition ID remains
valid because the already-versioned calendarId owns these content semantics independently.

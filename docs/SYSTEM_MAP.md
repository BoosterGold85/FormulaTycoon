# System map

Solid connections below exist today. Everything in the future table is design, not working code.

```mermaid
flowchart TD
    Definition[GameDefinition: existing content and rules] --> Universe[Pure universe transitions]
    Universe --> HQ[Existing headquarters engine]
    Universe --> Clock[One root currentDate / CampaignTime]
    Clock --> Events[Ordered due-work discovery and execution]
    Events -->|derived temporal view| Dev[Existing development kernel]
    Events -->|daily status checks| Drivers
    Catalog[Versioned calendar and circuit content] --> Calendar[Pure date/event queries]
    Clock --> Calendar
    State -->|calendarId| Calendar
    Dev --> Vector[Fitted technical car translation]
    Catalog --> TrackFit[Generic car-track technical matching]
    Vector --> TrackFit
    TrackFit --> Technical[Canonical contextual car and derived suitability]
    Technical --> CalendarUI[Calendar and circuit briefing]
    Calendar --> CalendarUI
    Calendar --> UI
    Universe --> Drivers[DriverWorld: profiles, contracts, knowledge]
    Drivers --> State
    Drivers --> Disclosure[Grade-only disclosure selectors]
    Disclosure --> DriverUI[Drivers and Team screens]
    DriverUI -->|report and option commands| Universe
    HQ --> State[GameUniverse state]
    Dev --> State
    App[App lifetime useGameUniverse] -->|commands / 50ms HQ steps| Universe
    State -->|display snapshots| UI[HQ scene, HUD, cards]
    State --> Checkpoint[Version 3 trusted checkpoint]
    Checkpoint -->|version + content checks| State
    State --> Envelope[Validated v5 serialized envelope]
    Envelope --> Repo[SaveRepository]
    Repo --> Memory[MemorySaveStorage: volatile]
    Memory -->|raw strings| Decode[JSON decode / migration dispatch / validation]
    Frozen[Immutable released v1 v2 v3 v4 v5 contracts] --> Decode
    State --> Fit[Domain driver-car fit selector]
    Definition --> Fit
    Fit --> DriverUI
    Decode -->|success only, detached state| State
    RNG[SeededRandom / shared keyed streams] --> Dev
```

| Boundary | Data passed | Must not happen |
|---|---|---|
| App -> HQ transition | Latest universe, definition, finite dt | Frame time advancing weeks |
| Explicit week command -> development | Existing world/context | React implementing project rules |
| NEW DAY -> HQ reset | Existing layout and roster | Wiping development budgets or history |
| Snapshot -> renderer | Worker states/routes, room data | Animation changing authoritative positions |
| Checkpoint -> restore | Trusted versioned plain-data snapshot | Treating this as a file parser |
| Definition -> engines | Stable part/team/station/event IDs | Duplicated runtime state in static data |

Future integrations:

- Expanded driver growth/offseason -> people/contract state -> player-visible estimates.
- Canonical contextual technical result -> future qualifying/race engines; suitability is
  disclosure of the technical response, never another stacked bonus.
- Weekend commands + forecast/tyres/traffic -> simulation events/results -> standings/history.
- Development commitments, salaries and sponsor obligations -> one finance ledger.
- Results/personnel changes -> morale/market/world events -> choices and news projections.
- Season transition -> archive official results -> contracts/retirements/regulations -> next calendar.
- Validated storage adapter -> migration chain -> universe restore; never UI-owned migration rules.

Keep subsystem APIs independently callable for fast fixtures and tools. Share IDs, clock decisions,
checkpoint boundary and RNG conventions; isolate HQ geometry, project rules, future race rules and
platform storage. Introduce typed events when a real consumer exists, not a global mutable bus now.

## Facility and brand connections (planned, not implemented)

Canonical organization/brand ID -> identity/history/personality -> differentiated AI policies.
Canonical facility definitions + team-owned lifecycle state -> capability/capacity selectors ->
development/staff/reliability/logistics/preparation; the SAME lifecycle state -> HQ visual
variant selector -> construction/commissioned/active appearance. Finance ledger later owns
construction/upkeep charges. No second copy of capability in the renderer and no duplicate
charges/bonuses in legacy development. EVERY major upgrade needs simulation AND visible effects.

The canonical registry is `src/game/brandRegistry.ts`; the working grid and sponsor/other
brand policy live in BRAND_IDENTITY.md. Saves/history use entity IDs, registry lookups supply
names/art. Track geography/profile IDs are independent from commercial event branding.
B retains the ten-team fixture for v1 validation and maps its runtime references into the
canonical eleven-team definition. See the B migration notes; new games do not use the old grid.

Only the memory adapter is implemented today. Native/browser storage belongs behind SaveStorage;
the simulation imports neither platform storage nor persistence. Repository decode never mutates
an active session; a future explicit application load action may replace state only after success.

## C0.1 single-clock boundary

GameUniverse.currentDate -> CampaignTime -> derived development/contract/display contexts.
Persisted development and DriverWorld contain no current clocks. The balanced development
kernel's dated view is temporary; its season/week fields are never stored. Date advancement
processes the ordered interval, running existing weekly work and explicit option/expiry checks.
Future dated systems join this interval; a target-date jump cannot skip their intermediate work.

V1/V2 -> frozen validated V3 -> date migration -> frozen validated V4 -> calendar identity -> V5 validation. Source snapshots and
fixtures remain untouched. The v4 fixture preserves C0's meaningful audited progress.

UI -> domain date/day selectors; current HQ NEW DAY -> animation replay, never the campaign
clock. The next-event HUD now reads the immutable event registry. Calendar year,
championship lifecycle, dated facts and HQ milliseconds are different concepts.

C0's clock inventory/migration plan is historical context; C0.1 implements the approved actual-
date model. Provisional annual March2/52-work-week projection preserves old progress until real
calendar/phase definitions replace it through an explicit compatibility step. C leaves that phase policy intact.


## C calendar/content and technical boundaries

- `game/calendar`: append-only calendar.2026.v1/v2 -> stable events/track IDs/profiles; recursive
  freeze and authoring validation. Career stores only the ID, never a copied registry.
- `simulation/calendar`: rootDate + ID -> current/next/previous/future/status/countdown and
  score-free detail disclosure. Calendar status cannot generate a result.
- `simulation/trackPerformance`: fitted development -> existing attribute/package/reliability
  semantics -> technical vector -> generic demand comparison -> qualitative briefing.
- Driver/car comfort is separate and unchanged. No performance logic in CalendarScreen or HUD.
- Save4 source semantics/fixture -> validated ID attachment -> save5; no source fixture edits.
- D0 retains the old weekly development cadence for both content IDs and owns one ordered
  date-event bridge. Fitting at actual race weekends would require a later versioned policy.
- Research gate COMPLETE through externally verified owner handoff. New careers choose v2
  profiles; saved v1 identity and original migrations remain unchanged. No direct Codex source
  retrieval is claimed. Frozen static-ID registration is separate from the live default.

## D0 ownership and extension points

`universe/campaignEvents.ts`: root date + current subsystem presence -> transient due instructions;
`universe::advanceTo` executes them through the existing engines. Discovery refreshes every entered
date. Order is date → explicit priority (development/reset 10; daily contracts 20) → stable ID.
Normal date/day/week commands and the standings-driven reset share this path. No sessions,
facility completions, scouting delays or sponsor events are invented for an empty framework.

`trackPerformance::technicalPerformanceAtTrack`: fitted parts + required circuit -> existing
package/static-heat context once -> technical car + derived suitability. Briefing/debug selectors
project that result. Future session pace/risk/conditions consumers must define their distinct
effects without counting the same car trait twice. Driver/car comfort is still its own selector.

The date interval is open at the old date, closed at the target. Same-target calls do nothing;
save/load resumes from root currentDate. Weekly work/fitting dates remain the frozen compatibility
mapping for v1/v2; no content-ID change rewrites development history. Schema stays v5 because no
persistent state changes. Future session archives must retain calendar/event identity and completion
state before processing results/rewards. See development-notes/MILESTONE-D0.md.

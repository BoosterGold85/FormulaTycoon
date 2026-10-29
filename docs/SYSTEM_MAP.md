# System map

Solid connections below exist today. Everything in the future table is design, not working code.

```mermaid
flowchart TD
    Definition[GameDefinition: existing content and rules] --> Universe[Pure universe transitions]
    Universe --> HQ[Existing headquarters engine]
    Universe --> Dev[Existing development engine]
    HQ --> State[GameUniverse state]
    Dev --> State
    App[App lifetime useGameUniverse] -->|commands / 50ms HQ steps| Universe
    State -->|display snapshots| UI[HQ scene, HUD, cards]
    State --> Checkpoint[Version 1 trusted checkpoint]
    Checkpoint -->|version + content checks| State
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

- Driver/scouting/contract commands -> people/contract state -> player-visible estimates.
- Part specs -> car characteristic vector -> track-weighted performance -> qualifying/race engines.
- Weekend commands + forecast/tyres/traffic -> simulation events/results -> standings/history.
- Development commitments, salaries and sponsor obligations -> one finance ledger.
- Results/personnel changes -> morale/market/world events -> choices and news projections.
- Season transition -> archive official results -> contracts/retirements/regulations -> next calendar.
- Validated storage adapter -> migration chain -> universe restore; never UI-owned migration rules.

Keep subsystem APIs independently callable for fast fixtures and tools. Share IDs, clock decisions,
checkpoint boundary and RNG conventions; isolate HQ geometry, project rules, future race rules and
platform storage. Introduce typed events when a real consumer exists, not a global mutable bus now.

# Roster packs

A roster pack is one JSON file that renames the grid: teams, drivers, colours, car numbers,
nationalities, archetypes, bios and helmet patterns, and (full packs only) driver stats.
The game ships one pack, the fictional default roster: `src/game/roster/defaultRoster.json`.
Players import others from **SETTINGS → Roster packs**.

- Authoring schema: [`roster-pack.schema.json`](roster-pack.schema.json) (JSON Schema 2020-12, for editors).
- Authoritative validator: `src/game/roster/validate.ts`. It also checks the merged-roster rules below.
- Sample packs used by the tests: `src/game/roster/__tests__/fixtures/`.

## Two pack types

| | Cosmetic (`"type": "cosmetic"`) | Full (`"type": "full"`) |
|---|---|---|
| Names, colours, numbers, nationality labels, archetypes, bios, helmet patterns | Yes | Yes |
| `stats` (age, ratings, potential, traits, home market) | Not allowed: validation fails | Yes |
| Apply to the running career | Yes. The simulation never reads these fields, so results, seeds and saves are unchanged | No. Only its names and colours can be applied |
| Start a new career with it | Yes (display only, default stats) | Yes: its stats build the new career |

Full-pack stats enter the game in exactly one place, `createGameUniverse(definition, seed, {roster})`,
when a career is created. A season in progress is never re-rated.

## Slots

Packs never name internal IDs. Every entry has a `slot`, and slots map onto the fixed internal
IDs that saves, seeds and tests use (`src/game/roster/slots.ts`).

- `teams`: slots 1–11. Slot 6 is the player's organization in a new career.
- `drivers`: slots 1–22, race seats in team order. Slots 1–2 drive for team slot 1, 3–4 for team 2,
  and so on; slots 11–12 are the player's drivers.
- `freeAgents`: slots 1–21. Slots 1–10 are prospects, 11–21 reserves; slot 21 is the reserve shared
  by team slots 4 and 9.

Anything a pack leaves out, from a whole list down to a single colour, falls back to the default
pack. `{"format": …, "schemaVersion": 1, "id": "x-pack", "name": "X", "type": "cosmetic"}` is a
valid pack that changes nothing.

## Format (schema version 1)

```json
{
  "format": "formula-tycoon-roster-pack",
  "schemaVersion": 1,
  "id": "my-pack",
  "name": "My pack",
  "author": "Optional",
  "description": "Optional, up to 280 characters",
  "type": "cosmetic",
  "teams": [
    {"slot": 1, "name": "Brightwater Racing", "shortName": "Brightwater", "base": "Harbourtown",
     "identity": "Seaside outfit", "colors": {"primary": "#2A7FBA", "secondary": "#F5EFE6", "accent": "#E4572E"}}
  ],
  "drivers": [
    {"slot": 1, "name": "Orla Penhallow", "number": 71, "nationality": "IRL", "archetype": "Late braker",
     "bio": "One or two lines.", "helmetPattern": 5}
  ],
  "freeAgents": []
}
```

| Field | Rule |
|---|---|
| `format` | Exactly `formula-tycoon-roster-pack` |
| `schemaVersion` | `1`. A newer number tells the player to update the game |
| `id` | 2–48 lowercase letters, digits, hyphens |
| `name` / `author` / `description` | 1–60 / 1–60 / 1–280 characters |
| team `name`, `shortName`, `base`, `identity` | 2–32, 1–14, 1–40, 1–120 characters |
| `colors.primary/secondary/accent` | Six-digit hex, e.g. `#1D4E89` |
| driver `name` | 2–32 characters, unique across all 43 people |
| `number` | 1–99, unique among drivers that have one; `null` for none |
| `nationality` | 2–24 characters. A **display label** only |
| `archetype`, `bio` | 1–32 and 1–200 characters |
| `helmetPattern` | 0–7. Race teammates must differ |
| `stats` (full only) | Any subset of the keys below; missing keys keep the default |

Text may not contain line breaks or control characters. Unknown fields are errors, so typos are
caught. Files over 256 KB are refused. A UTF-8 byte-order mark is allowed.

### Stats (full packs)

| Key | Range | Simulation effect |
|---|---|---|
| `age` | 16–45, age at the start of 2026 | Career stage, experience, peak age |
| `homeMarket` | 2–24 characters | Commercial region (e.g. `"Mexican"` → Latin America) |
| `traits` | Up to 3 of the game's traits (listed in the schema) | Specialties |
| `talent`, `racecraft`, `adaptability`, `composure`, `feedback`, `marketability` | 0–100 | Starting ratings, shown in game as letter grades |
| `potential` | 0–100 | Hidden ceiling |

If a driver's merged stats equal the default exactly, the game keeps its built-in 2026 reference
ratings for that slot. If you change any stat, your numbers become that driver's starting ratings
directly. Contracts and salaries are not pack data and stay as authored.

## Merged-roster rules

After a pack is merged over the default roster, the validator also requires unique car numbers,
unique driver names, unique team names, and different helmet patterns for each pair of teammates.
Errors name the slot and the field path (for example `drivers[2].number`).

## Storage and compatibility

- The active pack is a display preference stored on the device (web: `localStorage` key
  `formula-tycoon.roster-pack`), outside the save. It is re-validated on every launch and
  dropped if it no longer passes.
- Saves are unchanged: no save-version bump. A save stores IDs and the simulation fields it
  always stored; the names it contains are only a fallback. Driver names and bios on screen come
  from the active pack by ID.
- **Reset to default roster** clears the stored pack.

## Rules for packs shipped with the game

Only the fictional default pack ships. Never put real driver or team names, real car numbers,
helmet designs or liveries in the code, tests, fixtures, docs or shipped packs. The game cannot
vet what players import and does not try to.

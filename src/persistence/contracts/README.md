# Released save content contracts

Captured from audited B/B.1 `6b7e894` (merged to main as `88ef974`). These are independent,
checked-in historical data, not imports or startup clones of the current game registries.
Each JSON object is detached and recursively frozen by `index.ts` before use.

- `v1.json`: released ten-team development/HQ content, roster, layout, parts, events and bounds;
  no canonical-team migration aliases existed in v1.
- `v2.json`: released 11-team B content and closed 42-driver/trait/bucket identity schema.
- `v3.json`: aligned pre-calendar content and closed 43-driver schema, including reserve support.
- `v3-initial.json`: frozen migration-target driver initialization and Caldera state. This is
  historical migration content, not a second mutable roster and not the live new-game source.
- `preCalendarValidation.ts` / `preCalendarDriverValidation.ts`: released v1/v2/v3 validation
  semantics. `preCalendarRules.ts` pins project-progress and contract-calendar semantics that
  otherwise would drift when live engine functions changed. Imports from current model files
  are type-only; no runtime live registry/engine dependency exists.

Legacy game-definition modules are compatibility aliases to v1/v2 snapshots. Actual current
new games still use the live default definition/driver factory. Save validation resolves known
released definition IDs to snapshots; an unknown definition needs an explicit registered
contract/validator rather than silently trusting arbitrary current arrays.

`assertHistoricalSave(input, version)` is the source validation boundary. V1/v2 transforms
produce the audited v3 target, preserving earned state. The current save version remains **3**.
When calendar state really enters the save, C must add v4 validation and a v3→v4 migration:
validate source with v3, transform detached data, then validate v4. Do not change the v3 contract
to make a new format pass. Preserve old schema types if live runtime types evolve incompatibly.
The matching v3 fixture contains mid-route HQ, week-16 pending projects/history, improved scouting
and an exercised option, not an empty new game.

Permanent rule: an old save version validates against the content contract that existed when
it was released. When persistent structure changes: bump version, freeze the prior contract,
retain its fixture, implement migration, and test it. Never rewrite historical fixtures or
contracts to match new current content. New versions get new files and explicit dispatch.

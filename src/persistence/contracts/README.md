# Released save content contracts

V1/V2/V3 were captured from audited B/B.1 `6b7e894` (merged as `88ef974`) and frozen by C0.
They are checked-in historical data, not imports or startup clones of current registries.
Each JSON object is detached and recursively frozen by `index.ts` before use.

- `v1.json`: released ten-team development/HQ content, roster, layout, parts, events and bounds;
  no canonical-team migration aliases existed in V1.
- `v2.json`: released 11-team B content and closed 42-driver/trait/bucket identity schema.
- `v3.json`: aligned pre-calendar content and closed 43-driver schema, including reserve support.
- `v3-initial.json`: frozen migration-target driver initialization and Caldera state. Historical
  migration content, not a second mutable roster or live new-game source.
- `preCalendarValidation.ts` / `preCalendarDriverValidation.ts`: released V1/V2/V3 validation
  semantics. `preCalendarRules.ts` pins project-progress/contract-calendar semantics. Runtime
  validation has no live registry/engine dependency. `preCalendarTypes.ts` preserves old shapes;
  only type imports changed when C0.1 removed live subsystem clocks.
- `v4.json`: C0.1 content snapshot with date-based definition identity. Root date and dated options
  are checked by `universeValidation.ts`, which creates an ephemeral historical-shaped projection
  to reuse frozen structural rules. It explicitly uses released `calendarPolicyV4.ts`, not an
  unspecified future live event-calendar policy. Keep this policy available unchanged to validate
  V4 if subsequent versions change championship phase/week interpretation.

The external current save version is **4**. `assertHistoricalSave(input, version)` validates raw
V1/V2/V3 source. V1/V2 transformations first reach frozen V3; V3 source is validated, then
`dateMigration.ts` produces detached V4 output; the public boundary validates that output with
V4 rules before returning it. The trusted internal checkpoint is independently version2 and is
not an external import API. Unknown released definition IDs require explicit registration.

Old `(seasonIndex, completedWeek)` maps to March2 of `2025 + seasonIndex` plus `7 * week` days,
not ISO week. Old option deadlines map identically to explicit inclusive decision dates.
The immutable V3 fixture contains mid-route HQ, week16 pending projects/history, improved
scouting and an exercised option. The corresponding V4 fixture maps to **2026-06-22** and retains
that meaningful state; V1/V2/V3 fixture bytes remain unchanged.

Permanent rule: old saves validate against their released content and validation semantics.
For persistent changes: bump version, freeze the previous contract, retain a meaningful fixture,
implement migration and test source/output/continuation. Never rewrite historical inputs to match
current content. New versions get new files and explicit dispatch. Preserve the V4 phase mapping
and explicit option dates when adding later calendars; do not silently reinterpret a career.

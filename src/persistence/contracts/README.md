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
  are checked by `datedValidationV4.ts`, which creates an ephemeral historical-shaped projection
  to reuse frozen structural rules. It explicitly uses released `calendarPolicyV4.ts`, not an
  unspecified future live event-calendar policy. Keep this policy available unchanged to validate
  V4 if subsequent versions change championship phase/week interpretation.

The external current save version is **5**. `assertHistoricalSave(input, version)` validates raw
V1/V2/V3/V4 source. V1/V2 transformations first reach frozen V3; V3 source is validated, then
`dateMigration.ts` produces detached V4 output; the public boundary validates that output with
V4 rules before calendar migration attaches the V5 identity. Final output validates with V5. The trusted internal checkpoint is independently version3 and is
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


C adds `v5.json`, pinning calendarId and the calendar-track definition. V4 JSON/fixture are
unchanged; `datedValidationV4.ts` preserves its former validation semantics and explicit released
calendarPolicyV4. Historical source dispatch supports4 with no live registry dependency.
V1/V2→V3→V4→V5 validates each source boundary; V4→V5 attaches only frozen calendarId/new definition.
Current validation checks the identity and delegates unchanged dated structure to released rules.
The readonly static calendar/profile registry is append-only under game/calendar; never silently
change an existing calendar ID. The externally verified owner handoff completes C research. New careers select v2 through a
frozen append-only ID registry; saved v1 careers and original migration targets keep v1.
Schema stays5: no persistent structure change. Both static profile revisions are retained;
current validation accepts the explicitly registered IDs without consulting a mutable default.


V6 (Weekly Development Loop V1) adds the per-career `developmentRules` identity and optional rules-2 project
decision fields, plus real-weekend submission identity:
- `v6.json` is the frozen content snapshot (v5 content with a new definition identity).
- `validationV5.ts` preserves the released V5 universe rules for V5 sources and for the structure V6 shares.
- `driver-world-v5.json` is the retained V5 fixture (hash-tested).
- V5 → V6 attaches rules 1 only, so released careers keep their cadence, kernel and history. New careers use rules 2.

V7 (Core Gameplay Feel V2) adds development rules 3 (rules 2 + passive seeded weekly variation):
- `v7.json` is v6 content with a new definition identity (`development-loop-2026-v7`, new careers on rules 3).
- `validationV6.ts` + `validateDevelopmentRulesV6` preserve released V6 semantics (rules 1/2 only), and
  `historicalV6Validation.ts` is the V6 envelope boundary. It is kept apart from V1–V5 source validation, which still
  cold-loads without live registries; V6 reads the append-only static calendar registry, as released.
- `driver-world-v6.json` is the retained V6 fixture (hash-tested, mid-season rules-2 career with a pending decision).
- V6 → V7 is identity only: a career keeps its rules, so no released career gains weekly variation.
  Rules-3 projects use only the existing rules-2 fields and vocabulary.

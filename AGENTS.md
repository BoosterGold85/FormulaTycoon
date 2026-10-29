# Formula Tycoon agent rules

Formula Tycoon is a long-term racing-management game. Preserve these rules in all future work:

1. Simulation/business logic must never live inside React components.
2. `src/simulation` must remain platform-agnostic and deterministic where practical.
3. Never use `Math.random()` for simulation outcomes; use the seeded RNG abstraction.
4. UI may visualize game state but must not invent authoritative game results.
5. Keep systems modular and files reasonably small.
6. Do not silently change game rules, progression curves, or save data.
7. Avoid adding dependencies when built-in React Native/Expo APIs are sufficient.
8. The initial art direction is a clean, miniature isometric motorsport HQ inspired by management/tycoon games, not a photorealistic F1 simulator.
9. Workers should have persistent assignments and readable states (walking, working, traveling, etc.).
10. Future race simulation must be runnable headlessly without rendering UI.

## REQUIRED PROJECT READING

Before significant gameplay or architecture work, every coding agent must read:

- `docs/DEVELOPMENT_GUARDRAILS.md`
- `docs/GAME_ARCHITECTURE.md`
- `docs/GAME_LOOP.md`
- `docs/SYSTEM_MAP.md`
- `docs/MILESTONES.md`
- `docs/DEV_STATUS.md`

DEVELOPMENT_GUARDRAILS.md contains permanent project rules. These guide development;
they are not authorization to unnecessarily rewrite functioning code.

## Milestone workflow

State the milestone objective and architecture being touched. Before implementing a major
feature, identify:

1. System owner.
2. Persistent state affected.
3. Connected systems and their interfaces.
4. Failure modes and edge cases.
5. Meaningful tests required to prove it works.

After completing a milestone:

1. Run relevant automated simulation/presentation tests.
2. Run TypeScript validation.
3. Run applicable build validation.
4. Verify existing systems were not unintentionally broken, including save/load where relevant.
5. Update DEV_STATUS.md with COMPLETED, IN PROGRESS, TESTED, NOT VERIFIED, KNOWN ISSUES,
   TECHNICAL DEBT / ARCHITECTURAL RISK and NEXT MILESTONE.
6. Update relevant architecture documentation when necessary.
7. Commit the stable milestone separately and provide a brief covering milestone, completed work,
   architecture changes, tests, limitations, unverified behavior, risks/debt and next recommendation.
8. STOP unless explicitly instructed to continue. Keep feature branches subject to normal review;
   do not interpret a completed milestone as permission to publish or merge.

During audits, document genuine violations under DEV_STATUS's TECHNICAL DEBT / ARCHITECTURAL
RISK. Correct immediately only if they break functionality, threaten save/data integrity,
cause test failures or create an immediate blocker; otherwise schedule deliberate remediation.
Do not invent gameplay rules or bundle unrelated refactoring/features into a milestone.

Keep one app-lifetime universe owner; do not create a separate game per screen.
Do not silently change RNG keys, content versions, saved formats or existing rules.

Facilities are a core pillar: every major upgrade must have both a simulation effect and
visible HQ evolution. Follow `docs/BRAND_IDENTITY.md`: canonical fictional IDs, original
brands, no silent legacy-grid rename/expansion. Save imports must go through the validated
envelope/repository boundary, never the older trusted-checkpoint API.

## Player documentation

Whenever a major player-facing gameplay system reaches Definition of Done, update
`docs/PLAYER_MANUAL.md` with the mechanics the player needs to understand. Keep it player-facing;
do not reveal hidden numerical formulas, and distinguish available mechanics from future plans.

## Released save contracts

An old save version must validate against the content contract that existed when it was released.
Use immutable, version-specific definitions and validation semantics, never mutable live content.
When persistent structure changes: increment the save version, freeze the previous contract,
retain its fixture, add a migration, test it, and validate both source and transformed output.
Never rewrite historical fixtures/contracts just to match current content. External saves now use
v4 with one authoritative root currentDate; historical v1/v2/v3 remain unchanged.

## Campaign time

GameUniverse.currentDate is the only authoritative current campaign time: a validated plain
Gregorian date. New 2026 careers begin 2026-03-02. Never use wall-clock/device timezone/locale
for gameplay. Drivers and persisted development state must not store their own current clocks.
Use CampaignTime helpers and the normal monotonic universe advancement path; process crossed
work/deadlines in order. HQ animation/New Day replay is independent. Calendar/phase policy
changes require an explicit content/save compatibility review; never reinterpret old dates.

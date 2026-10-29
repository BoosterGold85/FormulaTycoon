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

## Milestone workflow

Read `docs/DEV_STATUS.md`, `docs/GAME_ARCHITECTURE.md` and `docs/MILESTONES.md`
before major work. State the milestone and touched boundaries; implement only that slice.
Run relevant simulation/presentation checks and TypeScript validation. After every milestone,
update DEV_STATUS.md with COMPLETED, IN PROGRESS, TESTED, NOT VERIFIED, KNOWN ISSUES
and NEXT MILESTONE. Report limitations and stop before beginning the next milestone.
Keep one app-lifetime universe owner; do not create a separate game per screen.
Do not silently change RNG keys, content versions, saved formats or existing rules.

# Milestones and acceptance gates

Every milestone updates DEV_STATUS.md under COMPLETED, IN PROGRESS, TESTED, NOT VERIFIED,
KNOWN ISSUES, TECHNICAL DEBT / ARCHITECTURAL RISK and NEXT MILESTONE. Read
DEVELOPMENT_GUARDRAILS.md and GAME_ARCHITECTURE.md before changing ownership.
Use vertical slices; finish one gate before moving on. Test simulation separately from presentation.

| Milestone | Meaningful slice | Required evidence |
|---|---|---|
| A — foundation integration | HQ + development under one universe; versioned checkpoint contract; documentation | Existing tests, engine equivalence, resume/isolation tests, types, web build, HQ interaction smoke |
| A.1 — foundation hardening | Versioned serialized envelope, strict validation, migration boundary, memory repository; facility/brand contracts | Save round trips, rejection/adapter failure tests, deterministic continuation, existing tests/types/web build |
| B — fictional people and organization | Driver generation, canonical teams, contracts and imperfect scouting foundation | Seeded identities/curves, valid team references, hidden-vs-revealed information, contract dates/options, checkpoint evolution |
| B.1 — Canonical 2026 Driver Data Alignment | Exact source subskills and individualized terms, reserve support, player manual | Exact 23-row data tests, 11 teams/22 seats, no public overall/raw values, v1/v2→v3 migration, mobile profile/contract/HQ checks |
| C0 — calendar readiness | Immutable historical contracts/v3 fixture; driver/car-fit domain selector; clock inventory and migration plan | Live drift isolation, v1/v2 preservation, deterministic v3 continuation, fit parity, synchronized temporary clocks; owner time-model gate before C |
| C0.1 — single campaign clock | Root plain-date ownership, v4 migration, date deadlines and minimal day/date HUD | Immutable v1/v2/v3 inputs; timezone proof; preserved RNG/progress; no persisted mirrors; deadline and interval tests |
| C — calendar, tracks and car/track fit | Approved single campaign clock/calendar, track profiles and development-to-performance translation | Validated v3→v4/one persisted clock; multiple characteristic strengths, no universal race rating or circuit-name branches; track-specific comparisons |
| D — qualifying | Interactive tyre/run/traffic/weather-timing choices | Repeatable sessions, valid grids, meaningful timing tradeoffs, bounded variance and causal logs |
| E — race V1 | Headless race plus dots/timing/tyres/pit stops | Valid finishing order, no double pit/results, strategy impacts, readable mobile presentation |
| F — pit wall | Important decisions, weather, safety cars | Timing effects, forecasts vs actual weather, undercut/overcut/double-stack tests |
| G — championship/history | Season completion and durable historical records | Standings from actual results, archives survive transitions, validated storage + migrations + recovery |
| H — careers/offseason | Market, growth, decline, retirement, rookies | Ten-season headless fixtures, preserved IDs/history, valid roster and contract transitions |
| I-F — facilities and visible HQ evolution | Seven facility categories, PLANNED/construction/commissioning/ACTIVE, costs/time/upkeep/capacity/disruption | EVERY major upgrade has tested simulation AND visible HQ effects; canonical capability adapter, no double charges, lifecycle/migration/recovery tests |
| I — organization management | Ledger, budgets, sponsors, principals | One accounting owner, obligations and meaningful managerial effects; no duplicate development charges |
| J — world stories | News/media/social and decision-producing events | Causal and actionable stories, no UI-owned consequences or empty popup spam |
| K — long-run balance/UX | Decades of fictional racing and one-more-race flow | 100-season headless runs, bounded finances/performance, plausible upsets, hardware profiling |

A.1 implements a durable serialized FORMAT, validation and migration dispatch with a VOLATILE
memory adapter; it does not implement actual device storage. No future gameplay types are added. Before shipping persistent campaigns,
validated save imports, atomic storage/backups and migration fixtures must precede user dependence
on saves (no later than G). B must keep this debt visible and version changes explicitly.

Simulation gates: deterministic seed replay; isolated RNG namespaces; invariants; many-session
statistical tests only when the corresponding system exists. Presentation gates: mobile viewport,
taps/navigation/cards, text readability, animation and actual-device performance where available.
A browser build is not proof of native iPhone performance. Cloudflare deploy success is a separate
check from static export. Do not build all screens or implement B during A.

I-F is a major product milestone, not optional decoration. It depends on C's capability consumers
and I's minimal finance/obligation contract; split and sequence those slices deliberately rather
than building two half-systems simultaneously. Major upgrades evolve both the team and the HQ.

Before the working eleven-team grid replaces legacy data, introduce the canonical brand registry,
explicit old/new entity mapping, content/save migration and allowance/standings balance review.
Do not rename stable historical IDs or silently expand the roster in A.1. Original organization
personality and differentiated AI must be reflected in B–I; sponsors and other brands follow
BRAND_IDENTITY.md. Sponsor/brand generation remains later work.

## Current milestone gate

Audited B/B.1 reached main at `88ef974`; C0 `e6a479c` was pushed/merged to main at **`a057daf`**.
Merged main passed 220 tests, TypeScript and web export before C0.1. The graphics branch remains
separate and unmerged.

The owner approved actual calendar dates and the new-career start of **2026-03-02**. C0.1 is
complete on `feature/milestone-c01-single-clock`: root currentDate, clock-free subsystem states,
central Gregorian operations, ordered advancement, explicit decision dates and validated v4
migration. V1/v2/v3 historical inputs remain intact. See DEV_STATUS for verification.

**READY FOR MILESTONE C after C0.1 review/integration.** The clock prerequisite is resolved;
C itself is NOT STARTED. Its real event registry/phase definitions must explicitly replace the
provisional compatibility policy without silently reinterpreting saved dates or deadlines.
No full 2026 calendar, tracks, car/track fit, qualifying/racing or offseason engine was added.

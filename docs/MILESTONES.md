# Milestones and acceptance gates

Every milestone updates DEV_STATUS.md under COMPLETED, IN PROGRESS, TESTED, NOT VERIFIED,
KNOWN ISSUES and NEXT MILESTONE. Read GAME_ARCHITECTURE.md before changing ownership.
Use vertical slices; finish one gate before moving on. Test simulation separately from presentation.

| Milestone | Meaningful slice | Required evidence |
|---|---|---|
| A — foundation integration | HQ + development under one universe; versioned checkpoint contract; documentation | Existing tests, engine equivalence, resume/isolation tests, types, web build, HQ interaction smoke |
| A.1 — foundation hardening | Versioned serialized envelope, strict validation, migration boundary, memory repository; facility/brand contracts | Save round trips, rejection/adapter failure tests, deterministic continuation, existing tests/types/web build |
| B — fictional people and organization | Driver generation, canonical teams, contracts and imperfect scouting foundation | Seeded identities/curves, valid team references, hidden-vs-revealed information, contract dates/options, checkpoint evolution |
| C — track fit | Data-driven track profiles and development-to-performance translation | Multiple characteristic strengths, no universal race rating or circuit-name branches; track-specific comparisons |
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

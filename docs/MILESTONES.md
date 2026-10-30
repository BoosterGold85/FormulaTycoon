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
| C — calendar, tracks and car/track fit | Approved single campaign clock/calendar, track profiles and development-to-performance translation | Validated historical→v5/calendar identity; one persisted clock; researched circuit profiles; multiple characteristic strengths, no universal race rating or circuit-name branches; track-specific comparisons |
| D0 — race-weekend integration foundation | Canonical contextual technical result; suitability is disclosure; deterministic due-work pathway preserving released cadence | Daily/jump/kernel equivalence, real seeded fitting, same-date ordering, save/load continuation, package ownership, no new persistent shape or qualifying |
| UI / Visual Experience V1 | Shared visual system, progressive disclosure, roster/dossier, month calendar, team overview, selected HQ art | Mobile/desktop navigation, existing data/interaction boundaries, six review screenshots, no gameplay/save change; visual review before D |
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

C0.1 `b1b7dab` was pushed and merged/pushed into main at **36e7df0**. Merged main passed261 tests,
TypeScript and web export before `feature/milestone-c-track-performance` began. Graphics remain
separate at1cfb07d, unmerged.

C implementation provides the owner-approved23-round/six-Sprint registry, all23 initial circuit
profiles, domain technical translation/matching, RACE calendar/detail UI, real HQ next event and
save5 calendar identity with V1–V4 migration protection. Full tests/types/build/browser pass.

**C implementation, research gate and Post-C audit COMPLETE; merged and pushed to main.** The owner supplied
externally verified technical research after direct Codex access was blocked. Provenance and all23
reviews are in CIRCUIT-RESEARCH. Fourteen profiles stay numerically unchanged, seven have minor
adjustments and Madrid/Singapore have material corrections. New immutable calendar.2026.v2 is
selected for new games; existing careers and historical migration output stay pinned to v1.
No persistent shape change, schema remains5. Audit1290bb3 / documentation22f0a97 were merged
at **884459e50e3e29053d6e0e9e62c14659cdc9d3c8**. Merged main's tree equals the audited branch;
317 tests/14 suites, types, web export,390×844 browser and11 original historical hashes passed
before D0 began. Worker art remains separate/unmerged at1cfb07d.

**D0 COMPLETE — READY FOR QUALIFYING DESIGN.** Branch
`feature/milestone-d0-race-weekend-foundation` starts from validated merged main. C-M1/C-M2 now
have explicit implemented interface/pipeline and compatibility policy; C-L1/C-L2 protections and
C-L3 documentation are addressed. All341 tests/16 suites, types, web export and390×844 browser
pass; historical hashes remain unchanged. Schema stays v5. No qualifying, lap model, race result,
weather engine, new screen or advance button exists. The owner subsequently authorized D0's
integration into main: feature commit a446cfa merged at f915c9f. Main now includes C, its audit
and D0. Qualifying still requires a separate instruction. Graphics remain independent/unmerged.
See development-notes/MILESTONE-D0.md.

## Current priority: UI / Visual Experience V1

The owner paused feature expansion after merged/validated D0. Qualifying remains unstarted.
`feature/ui-visual-experience-v1` starts from stable main200f4d6, using selected worker art rather
than merging the old graphics branch. Visual review is the next gate. Read
development-notes/UI-VISUAL-EXPERIENCE-V1.md for scope, screenshots, evidence and limitations.

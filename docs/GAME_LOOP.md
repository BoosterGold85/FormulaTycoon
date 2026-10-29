# Player experience

## What can be played now

Open HQ -> watch eight staff arrive -> inspect workers/departments -> NEW DAY replays arrivals.
HQ cards and placeholder tabs work. HUD team/day/next-event values remain display placeholders.
Development can run headlessly, but there is no player development UI or campaign-time button.
Milestone A adds no new player-facing loop, travel, qualifying, drivers or racing.

## Target loop (not implemented)

Build a team -> develop people/car -> prepare -> practice -> qualify -> choose strategy ->
watch race / respond at important moments -> results and consequences -> develop again.
Decision -> uncertainty -> result -> consequence -> new decision is the product test.

- HQ: inspect needs, choose development risks and allocations, hire/scout/renew when systems exist.
- Preparation/practice: track fit and forecasts inform setup, tyres, reliability and preparation.
- Qualifying: send either driver, choose tyres/run count/timing, manage traffic/weather and save tyres.
  Pace, car-track fit, consistency and small seeded variance determine laps; a bad grid position
  creates alternative race strategies, not an unavoidable loss.
- Race: track map + colored dots + timing tower + event feed first. Give meaningful pit-now/stay-out,
  compound, undercut/overcut, push/conserve, double-stack and weather/safety-car decisions. No driving,
  compulsory lap-by-lap micromanagement or 3D requirement.
- Consequences: explain why a decision succeeded or failed through tyres, traffic, weather, errors,
  reliability, execution and pace. Update official standings, finances, morale and careers once.
- Return: a weakness or opportunity suggests the next development/management choice.
- Offseason: review/awards -> expiring deals/market -> staff/sponsor negotiations -> budgets ->
  concept/regulations -> rookies/retirements -> testing -> next season. Keep past seasons intact.

The fiction should accumulate memorable careers and rivalries across decades. Principal strengths
must affect decisions/system behavior, not one flat bonus. Sponsors have obligations and conflicts;
marketing/news should create meaningful decisions rather than busywork or meaningless popups.
Wet upsets and midfield wins must be plausible, explainable and repeatable under test, not dice
replacing racing rules. Optimize with incomplete information; never expose all hidden attributes.

Navigation stays HQ / TEAM / DRIVERS / RACE / HISTORY. A tab gets depth only when its simulation
slice exists. No empty UI-first screen rollout. See MILESTONES.md for the gates.

## Permanent pillars and HQ evolution (future)

Car Development; Staff & Leadership; Drivers; Finances & Commercial; Facilities;
Racing & Strategy; Team Legacy form the tycoon loop. Facility investment must be both a meaningful
capability decision and a visible change to the HQ: PLANNED, UNDER_CONSTRUCTION, COMMISSIONING,
then ACTIVE. Costs/time/upkeep and temporary disruption create tradeoffs, not cosmetic-only
purchases. Every major facility upgrade requires a simulation effect AND visible HQ effect.
No facility construction gameplay exists yet.

Teams must become original fictional organizations with distinct philosophies, risk appetite,
resources and histories, not identical AI with alternate colors. Use the canonical brand-policy
and working identities in BRAND_IDENTITY.md; do not copy real logos/liveries/commercial identities.
The new eleven-team proposals do not yet replace the ten-team development dataset.

Save-envelope serialization and a volatile in-memory repository exist after A.1. There is still
no save/load button or persistent browser/native save slot; closing the app still loses progress.
Do not imply that an autosave occurred. Real-device persistence and recovery are a later explicit
infrastructure step, before players can depend on a campaign.

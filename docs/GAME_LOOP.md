# Player experience

## What can be played now

Open HQ -> watch eight staff arrive -> inspect workers/departments -> NEW DAY replays arrivals.
HQ cards work. DRIVERS opens grid/details/prospects/reserves; TEAM compares the Wellington pairing.
RACE opens the calendar/circuit briefings; HISTORY remains a placeholder. The HQ HUD shows
the date-backed next event; its team-name placeholder is still display-only.
Development can run headlessly, but there is no player development UI or campaign-time button.
Milestone A adds no new player-facing loop, travel, qualifying, drivers or racing.

## Target loop (not implemented)

Build a team -> develop people/car -> prepare -> practice -> qualify -> choose strategy ->
watch race / respond at important moments -> results and consequences -> develop again.
Decision -> uncertainty -> result -> consequence -> new decision is the product test.

- HQ: inspect needs, choose development risks and allocations, hire/scout/renew when systems exist.
- Preparation/practice: track fit and forecasts inform setup, tyres, reliability and preparation.
- Qualifying: send either driver, choose tyres/run count/timing, manage traffic/weather and save tyres.
  Circuit-specific technical response, driver ability/comfort, consistency and small seeded variance
  determine laps; derived car-track fit is disclosure, never another bonus. A bad grid position
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
slice exists; B makes DRIVERS and the limited TEAM view functional. No empty UI-first screen rollout. See MILESTONES.md for the gates.

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
B adopts the eleven-team grid via an explicit content/save migration; the ten-team dataset is
retained for legacy validation and regression only.

Save-envelope serialization and a volatile in-memory repository exist after A.1. There is still
no save/load button or persistent browser/native save slot; closing the app still loses progress.
Do not imply that an autosave occurred. Real-device persistence and recovery are a later explicit
infrastructure step, before players can depend on a campaign.

## Milestone B player decisions

Open DRIVERS -> compare six letter buckets, traits, age, contract and reputation -> inspect
prospects whose grades/potential remain uncertain -> improve a team-owned report -> compare the
Wellington pairing in TEAM. Starting options appear only for drivers with supplied option terms;
only the owning team can exercise them. Wellington's starting pair has guaranteed-only deals. No overall rating.
Report review is free/instant prototype learning; salaries/bonuses are terms only, not payments.
Return to HQ without losing staff progress. Current save format v5 supports these systems, but no durable
save UI/device storage is introduced. No hiring UI, races, qualifying or full career growth yet.

## C0.1 calendar date (before the real event registry)

Career date begins Monday, March2,2026 and displays in the existing HQ HUD. HQ NEW DAY still
replays worker arrivals only; no daily-click career UX or calendar screen is added. Domain
commands may advance directly to a target date while processing crossed work/deadlines. The
full event/phase registry and smart event-selection UI belong to C and later slices.

Drivers/contracts/scouting consume the root date; observations/history retain their timestamps.
Team options display explicit decision dates. The prototype 24-event development fixture remains
an internal compatibility fixture, not the actual 2026 championship calendar. No race or track
performance behavior was introduced. External saves use v4; older careers migrate their progress.


## Milestone C preparation loop

HQ next-event/date -> RACE calendar -> select circuit -> inspect demands and your fitted car's
qualitative suitability/strengths/concerns -> compare a different circuit -> return to HQ/Drivers.
The same universe/session remains active. Sprint markers describe scheduled weekend format only.
COMPLETED is a passed date, not a result. No qualifying, race button or campaign-advance UI exists.

Track differences come from data-driven matching; no universal car overall or finishing-position
forecast is shown. Upgrade value varies by venue, but pending/reverted work creates no fitted
improvement. Driver/car comfort remains a separate Driver Detail concept. The circuit research
gate is complete through the accepted externally verified owner handoff. New careers use pinned
v2 profiles; existing careers retain their saved revision. Codex did not retrieve blocked source
pages, and authored game weights are not official measured ratings. See development-notes/CIRCUIT-RESEARCH.md.

## D0 integration rules (domain only)

The canonical technical result contains a configured fitted car and its derived suitability.
Future sessions must not stack the suitability label/score as an extra bonus or reapply packages
and static heat. Driver ability, comfort, form and future session/conditions decisions stay separate.
No Practice/Qualifying screen, lap times or new advance button is implemented by D0.

Any future advance-to-event command must use the existing campaign advancement owner: process
every due instruction in `(old date, target date]` in date/priority/ID order, then arrive. Development
precedes contract status checks on the same date. The released weekly fitting cadence remains
unchanged for both calendar revisions; advancing to a displayed weekend does not imply fitting
there or generate session results. See development-notes/MILESTONE-D0.md before designing qualifying.

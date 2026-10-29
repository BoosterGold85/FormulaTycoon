# Car development engine

Headless, seeded simulation of how teams develop their cars through a season.
Data lives in `src/game/development`, rules in `src/simulation/development`.

## The 8 upgrade areas

Taken from the FIA car presentation submissions (as shown on f1techmap.com):
front wing, nose, front suspension, floor, bodywork & cooling, rear wing,
rear suspension, diffuser & rear edge. Power unit and gearbox are homologated,
so each team's power unit is a fixed rating from its supplier.

## How a part is developed

1. **Research**: wind tunnel/CFD for aero parts, rigs for suspension. Aero time
   follows the real sliding scale (champions 70% of baseline, last place 115%).
2. **Design**: speed depends on the department's staff quality.
3. **Manufacturing**: speed depends on the factory.
4. **Ready**: fitted at the next Grand Prix and declared with an FIA reason:
   `PERFORMANCE`, `CIRCUIT_SPECIFIC` (low-drag rear wing, high-cooling bodywork)
   or `RELIABILITY`.

Budget is committed when a project starts and can never exceed the team's budget
or the development cap. Departments run a limited number of projects at once.
Noses (crash tests) and suspension (fixed pick-up points) are limited to 2 per season.

## What an upgrade delivers

- Predicted gain = part potential × ambition × staff quality × remaining headroom.
  Headroom shrinks linearly towards the regulation ceiling, so leaders find gains
  harder and the field tends to converge.
- Track result = prediction × noise. Poor correlation means bigger surprises and
  a higher chance the upgrade does not work and is **reverted** (money spent, no gain).
- New specs are less reliable and mature with running; weak parts trigger fixes.

## Rival AI (weekly)

1. Fix any part below the reliability alarm.
2. Build circuit packages needed in the next 10 weeks.
3. Start performance projects where departments have capacity, choosing the best
   lap-time value per dollar (with team focus and some randomness), paced so the
   budget lasts the season, and only if the part can still race this year.

## Season to season

`startNextSeason` resets budgets and homologation counts, re-allocates aero
testing time from the final standings, and optionally applies a regulation reset
that pulls every car back towards the pack.

## Entry points

- `createDevelopmentWorld(context, seed)`
- `advanceDevelopmentWeek(world, context)` / `runDevelopmentSeason(world, context)`
- `startProject(...)`: shared by the AI and, later, the player
- `computeCarProfile(team, profile, event?)`: characteristics, pace, reliability
- `buildEventDocument(world, context, season, eventId)`: the per-race FIA-style document

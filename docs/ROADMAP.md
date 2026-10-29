# Formula Tycoon — Roadmap

## Prototype 0 — Living HQ (done)
- Isometric factory floor
- Simulation/UI folder separation
- Seeded RNG foundation

## Living Headquarters v1 (done)
- Isometric HQ diorama: workshop with two car bays, aero, strategy, simulator, manufacturing, logistics
- Data-driven departments, stations (with capacity/slots) and navigation graph
- 8 workers with persistent assignments; IDLE → WALKING → WORKING
- Deterministic waypoint routing, headless clock (`advanceHeadquarters`)
- Tap workers and departments for info cards
- Placeholder HUD and bottom navigation
- Jest tests for the headquarters simulation

## Car development engine v1 (done)
- 8 FIA upgrade areas, research → design → manufacturing → race introduction
- Cost cap, aero testing sliding scale, homologation limits, correlation risk
- Rival team AI, circuit packages, reliability, per-race upgrade documents
- Headless and seeded; see docs/DEVELOPMENT_ENGINE.md

## Milestone 1 — Fictional racing universe
- 10 teams
- 20 generated drivers
- Driver attributes, traits, age, contracts

## Milestone 2 — Qualifying and race simulation
- Deterministic race engine
- Track profiles
- Controlled randomness
- Reliability, mistakes, weather and strategy events

## Milestone 3 — Season and history
- Driver/constructor standings
- Season archive
- Career records
- Aging, development and retirement

## Milestone 4 — Management
- Contracts
- Driver market
- Scouting
- Car development
- Budget

## Milestone 5 — HQ becomes functional
- Tap rooms to open systems
- Department upgrades
- More staff
- Persistent schedules
- Pack/load animation before race travel

## Milestone 6 — Race-weekend presentation
- Travel transition
- Paddock/garage scene
- Qualifying presentation
- Animated track/timing simulation

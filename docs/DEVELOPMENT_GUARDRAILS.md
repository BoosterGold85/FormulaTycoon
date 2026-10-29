# Formula Tycoon — Development Guardrails

# PURPOSE

Formula Tycoon is being developed with an AI-assisted / vibe-coding workflow.

That is intentional.

The goal is NOT to produce academically perfect code.

The goal is to produce a stable, maintainable, enjoyable game that can continue growing for years without becoming fragile.

The guiding philosophy is:

**IF THE GAME WORKS, IT WORKS — BUT “WORKS” MEANS IT REMAINS STABLE, TESTABLE, SAVE-SAFE, AND MAINTAINABLE AS THE GAME GROWS.**

AI agents are encouraged to move quickly.

They must not sacrifice the long-term health of the project simply to complete the immediate task.

---

# 1. GAME LOGIC MUST REMAIN SEPARATE FROM UI

The UI displays information and sends player actions into the game systems.

The UI must NOT become the game system itself.

Examples of proper ownership:

Race Engine
→ race simulation

Finance System
→ income, expenses, payroll, prize money

Facility System
→ construction, upgrades, effects, maintenance

Staff System
→ hiring, firing, contracts, attributes, development

Driver System
→ contracts, progression, morale, performance

Car Development System
→ research, design, manufacturing, upgrades

Championship System
→ standings, points, schedules, records

Sponsor System
→ contracts, objectives, payouts

Career State / Game Universe
→ authoritative persistent career state

Save System
→ serialization, validation, migration and restoration

A screen such as:

`FacilitiesScreen`
`FinanceScreen`
`DriverScreen`
`RaceScreen`

must not contain unique simulation logic that belongs in one of these systems.

RULE:

**SCREENS DISPLAY THE GAME. SYSTEMS RUN THE GAME.**

---

# 2. ONE AUTHORITATIVE GAME STATE

There must be one clearly defined authoritative source for career state.

Do not create competing copies of:

- team money
- staff
- drivers
- facilities
- car performance
- calendar state
- championship results
- contracts
- development progress
- sponsors
- reputation
- historical records

UI state may represent temporary interface behavior.

Permanent gameplay state must live in the Game Universe / career state.

RULE:

**IF TWO PARTS OF THE CODE CAN DISAGREE ABOUT THE SAME GAMEPLAY FACT, THE ARCHITECTURE IS WRONG.**

---

# 3. SAVE FILES ARE SACRED

A player's long-term career is one of the most valuable assets in Formula Tycoon.

Save infrastructure must therefore be treated as critical infrastructure.

The game should eventually support:

- save
- quit
- reload
- deterministic restoration where expected
- versioned save formats
- validation before loading
- safe migrations
- graceful handling of invalid/outdated data
- preservation of historical career records

Never casually change persistent structures without considering compatibility.

Required principle:

A saved career should reload into the same meaningful state it had before saving.

RULE:

**NEVER SACRIFICE A PLAYER'S 40-SEASON CAREER FOR DEVELOPMENT CONVENIENCE.**

---

# 4. STABLE ENTITY IDS

Persistent entities should use stable IDs.

Do not rely only on display strings.

Example:

GOOD:

`team.ferano`

NOT:

`Ferano Corse`

Names, branding and display information may change later.

Stable IDs allow saves and historical records to survive those changes.

This applies to future:

- teams
- drivers
- sponsors
- tracks
- facilities
- staff
- championships
- contracts
- commercial partners
- events

---

# 5. DO NOT PATCH AROUND BAD ARCHITECTURE

When a feature exposes an architectural problem, fix the underlying design when reasonable.

Avoid endless special cases such as:

- if screen A, do this
- except during offseason
- unless facility is upgrading
- unless the user arrived from this menu
- unless save version equals X
- unless race state equals Y

Some exceptions are legitimate.

An increasing number of exceptions usually indicates that ownership or architecture needs to be reconsidered.

RULE:

**DO NOT BUILD A PATCH ON TOP OF A PATCH ON TOP OF A PATCH JUST BECAUSE IT PASSES TODAY.**

---

# 6. IMPORTANT GAMEPLAY SYSTEMS REQUIRE TESTS

Tests should protect player expectations.

Do not write tests simply to increase the number of tests.

Examples:

FACILITIES

Test:

- money deducted once
- construction duration correct
- effects do not activate early
- requirements enforced
- maintenance applied correctly
- upgrades persist through save/load

FINANCES

Test:

- income added once
- expenses deducted once
- payroll not duplicated
- balances remain valid
- sponsor payouts trigger correctly

CONTRACTS

Test:

- start/end dates
- salaries
- team ownership
- renewals
- no duplicate active contracts

RACES

Test:

- every entrant receives a valid result/classification
- DNFs handled correctly
- points applied correctly
- championship updated once
- race cannot accidentally process twice

CALENDAR / SEASON

Test:

- time advances correctly
- events occur on schedule
- offseason transitions correctly
- new seasons initialize correctly
- previous history remains intact

SAVES

Test:

- save state
- restore state
- compare meaningful values
- verify equivalent career state

RULE:

**IF BREAKING A FEATURE WOULD SERIOUSLY DAMAGE A CAREER, THAT FEATURE NEEDS TEST COVERAGE.**

---

# 7. PREVENT DOUBLE PROCESSING

Tycoon games are especially vulnerable to events firing more than once.

Critical systems should protect against:

- salaries paid twice
- prize money awarded twice
- race results processed twice
- championship points duplicated
- development weeks advanced twice
- contracts expired twice
- sponsor objectives paid twice
- construction advanced twice
- offseason processed twice
- event rewards issued twice

Where appropriate, systems should be idempotent or explicitly track whether an event has already been processed.

---

# 8. SIMULATION MUST SURVIVE LONG CAREERS

Formula Tycoon cannot be considered stable based only on a single-season test.

As systems mature, periodically run automated career simulations.

Suggested checkpoints:

- 5 seasons
- 20 seasons
- 50 seasons
- 100 seasons where practical

Inspect for:

- runaway inflation
- impossible ratings
- ratings collapsing permanently
- empty driver/staff markets
- duplicate people
- teams permanently bankrupt
- invalid championships
- broken schedules
- negative/impossible values
- uncontrolled save growth
- performance degradation
- corrupt history
- repeated IDs
- teams unable to recover competitively

RULE:

**A TYCOON GAME IS NOT STABLE UNTIL TIME ITSELF FAILS TO BREAK IT.**

---

# 9. GAMEPLAY VALUES NEED EXPLICIT BOUNDS

Values involving progression and simulation need reasonable constraints.

Examples:

- driver attributes
- staff attributes
- morale
- reliability
- development potential
- facility levels
- team reputation
- sponsor values
- budgets
- car performance
- contract length
- age
- salary values
- probabilities

Do not allow accidental nonsense such as:

- 147-rated drivers
- -500% reliability
- infinite money
- negative race laps
- 300-year contracts
- probability values greater than 100%

unless intentionally designed.

---

# 10. KEEP SYSTEMS MODULAR

One system should own each rule.

Other systems should ask that system for the answer.

Example:

Facility System:

`getAeroDevelopmentModifier()`

Car Development System consumes the result.

The Car Development System should not independently recreate facility logic.

RULE:

**ONE SYSTEM OWNS EACH RULE. OTHER SYSTEMS ASK FOR THE RESULT.**

---

# 11. DUPLICATED GAMEPLAY LOGIC IS A WARNING SIGN

If the same gameplay calculation exists in multiple places, consolidate it.

Examples:

- salary calculation
- driver overall rating
- facility modifiers
- race points
- sponsor payout
- development times
- standings
- market value
- reputation effects

Displayed information should derive from the same underlying logic as simulation outcomes wherever practical.

---

# 12. DEPENDENCIES MUST BE JUSTIFIED

Do not add packages merely because they make one small task convenient.

Before adding a dependency, consider:

- can the project already do this simply?
- is it maintained?
- is it widely supported?
- does it introduce security risk?
- does it increase build size?
- could it become abandoned?
- is its license appropriate?

Avoid dependency sprawl.

RULE:

**DO NOT ADD A 50,000-LINE DEPENDENCY TO SOLVE A 20-LINE PROBLEM.**

---

# 13. COMMERCIAL LICENSING MATTERS

Any external:

- code
- images
- fonts
- icons
- audio
- music
- shaders
- asset packs
- datasets

must be appropriate for the project's intended distribution.

Do not assume something is safe because it is freely downloadable.

Retain attribution/license information when required.

---

# 14. FICTIONAL IP MUST REMAIN FICTIONAL

Formula Tycoon is inspired by real-world motorsport but should operate as its own fictional universe unless specific licenses are obtained.

Do not introduce real:

- team names
- team logos
- sponsor names/logos
- exact liveries
- driver likenesses
- championship branding
- trademarked commercial identities

without explicit project-owner approval.

Do not create lazy one-letter copies as the permanent identity.

Fictional organizations may evoke recognizable motorsport archetypes, but they must develop their own:

- names
- logos
- colors
- history
- sponsors
- personnel
- visual identity
- culture

All fictional entities should eventually use a central canonical registry rather than scattered hard-coded display strings.

---

# 15. FICTIONAL BRAND REGISTRY

Formula Tycoon should maintain central data for fictional commercial entities.

Eventually this may include:

- racing teams
- sponsors
- manufacturers
- media outlets
- suppliers
- tire brands
- technology partners
- financial brands
- beverage brands
- airlines
- logistics companies

Use stable IDs.

Example:

`team.ferano`

`team.vortex`

`sponsor.nexora`

`sponsor.summit_bank`

Do not scatter commercial names throughout simulation code.

---

# 16. MAJOR FACILITY UPGRADES MUST AFFECT BOTH SIMULATION AND HQ

Facilities are a central tycoon progression system.

Every major facility upgrade must have:

1. A simulation effect
2. A visible HQ/environment effect

Example:

Wind Tunnel Level 3 should not merely increase a hidden percentage.

The headquarters should visibly gain or upgrade its wind-tunnel facility.

RULE:

**THE PLAYER SHOULD BE ABLE TO SEE THEIR ORGANIZATION GROW.**

---

# 17. FACILITY EFFECTS SHOULD CREATE STRUCTURAL ADVANTAGES

Do not make all facilities simple percentage boosters.

Facilities may affect:

- maximum capability
- parallel project capacity
- build speed
- development accuracy
- reliability
- scouting information
- simulation quality
- staff recruitment
- morale
- shipping reliability
- race preparation
- emergency manufacturing
- operational efficiency

Facilities should interact with:

FACILITY QUALITY
×
STAFF QUALITY
×
LEADERSHIP
×
BUDGET
×
TIME

A world-class building without good people should not automatically dominate.

Great people working with weak facilities should face limitations.

---

# 18. PERFORMANCE SHOULD BE MEASURED, NOT ASSUMED

A feature working during one race or one season does not prove it works over decades.

Monitor:

- save size
- history growth
- render performance
- unnecessary calculations
- loops
- memory usage
- unnecessary state updates

Optimize when evidence indicates a problem.

Do not prematurely rewrite working systems solely because a theoretical optimization exists.

---

# 19. RANDOMNESS MUST BE CONTROLLED

Gameplay randomness should support seeded RNG wherever practical.

Benefits:

- deterministic tests
- reproducible bugs
- checkpoint restoration
- debugging unusual outcomes
- balance analysis

Where useful, separate RNG streams may exist for:

- weather
- race incidents
- mechanical failures
- driver errors
- pit stops
- development
- scouting
- world events

UI animation randomness should remain separate from gameplay randomness.

RULE:

**GAMEPLAY RANDOMNESS SHOULD BE REPRODUCIBLE WHEN DEBUGGING REQUIRES IT.**

---

# 20. RANDOMNESS SHOULD CREATE STORIES, NOT CHAOS

Randomness must alter probabilities rather than replace game logic.

Strong cars and strong drivers should usually perform better.

But:

- rain
- strategy
- qualifying
- reliability
- incidents
- track fit
- safety cars
- driver form

should allow believable outliers.

The player should normally be able to understand WHY an unexpected result occurred.

---

# 21. GIT IS THE SAFETY NET

Every stable milestone should be committed.

Examples:

- Game Universe Foundation
- Save Foundation
- Driver System
- Contracts
- Scouting
- Facilities
- Finance
- Race Simulation
- Championship
- Sponsor System
- Offseason
- Media/Event Systems

Do not allow large unrelated work to accumulate into one enormous commit.

Before risky architectural work, ensure the last stable state is committed.

RULE:

**NEVER DESTROY A WORKING GAME TO SAVE A BROKEN EXPERIMENT.**

---

# 22. DO NOT MIX REFACTORING AND FEATURES UNNECESSARILY

When possible:

Feature work changes gameplay.

Refactoring changes structure while preserving gameplay.

Keeping these separate makes regressions much easier to diagnose.

Do not turn every gameplay milestone into a repository-wide cleanup.

---

# 23. PERIODIC ARCHITECTURE AUDITS ARE REQUIRED

At major milestone boundaries, periodically stop adding features.

Inspect:

- duplicated gameplay logic
- unclear system ownership
- excessive coupling
- UI containing simulation rules
- dead code
- unnecessary dependencies
- fragile save behavior
- missing validation
- weak test coverage
- performance issues
- technical debt becoming structural debt

During an architecture audit:

DO NOT change gameplay unless required to correct an actual bug.

Refactor only where there is a clear long-term benefit.

---

# 24. MAINTAIN PERMANENT PROJECT DOCUMENTATION

The following documents must remain current:

- `GAME_ARCHITECTURE`
- `GAME_LOOP`
- `SYSTEM_MAP`
- `MILESTONES`
- `DEV_STATUS`
- `DEVELOPMENT_GUARDRAILS`
- `PLAYER_MANUAL` (player-facing mechanics, without hidden formulas)

When significant architecture changes occur, update relevant documentation.

Whenever a major player-facing gameplay system reaches Definition of Done, update
`docs/PLAYER_MANUAL.md` with the mechanics the player needs to understand. Do not expose hidden
numerical formulas. Clearly distinguish implemented behavior from planned effects.

A new coding agent should be able to enter the repository and understand the project without reverse-engineering every file or old conversation.

---

# 25. DEV_STATUS IS THE HANDOFF DOCUMENT

After each significant milestone, update:

`docs/DEV_STATUS.md`

It should include:

COMPLETED

IN PROGRESS

TESTED

NOT VERIFIED

KNOWN ISSUES

TECHNICAL DEBT

NEXT MILESTONE

The development brief returned to the user should also contain:

MILESTONE

COMPLETED

ARCHITECTURE CHANGES

TEST RESULTS

KNOWN LIMITATIONS

NOT VERIFIED

RISKS / TECH DEBT

NEXT RECOMMENDED MILESTONE

Do not silently continue into the next milestone.

---

# 26. EVERY MAJOR FEATURE MUST ANSWER FIVE QUESTIONS

Before significant implementation, answer:

## 1. WHO OWNS THIS SYSTEM?

Which module/system is authoritative?

## 2. WHAT STATE DOES IT MODIFY?

Identify persistent state.

## 3. WHAT OTHER SYSTEMS DOES IT INTERACT WITH?

Define clear boundaries/interfaces.

## 4. WHAT CAN GO WRONG?

Identify major edge cases and failure modes.

## 5. HOW WILL WE PROVE IT WORKS?

Define meaningful tests.

If these five questions cannot be answered, clarify the architecture before large implementation begins.

---

# 27. DEFINITION OF DONE

A feature is not complete simply because the happy-path screen looks correct.

A major feature is complete when:

- intended gameplay works
- reasonable edge cases are handled
- relevant tests pass
- TypeScript checks pass
- builds pass
- save/load behavior is verified where relevant
- no duplicate authoritative state is introduced
- architecture remains understandable
- documentation is updated when necessary
- limitations are documented
- existing gameplay is not unintentionally broken

---

# 28. WHEN AN AI AGENT IS UNSURE

Do not silently invent major gameplay rules.

Do not make sweeping architectural assumptions solely to finish a task.

For minor implementation decisions:

Use reasonable engineering judgment.

For decisions affecting:

- core gameplay
- economy
- progression
- player experience
- fictional universe
- major architecture
- destructive migrations
- long-term save compatibility

document the assumption clearly or escalate it for design review.

---

# 29. DO NOT OVERENGINEER

These guardrails exist to keep Formula Tycoon healthy.

They do NOT exist to turn the project into enterprise software.

Avoid unnecessary:

- microservices
- abstraction layers
- indirection
- elaborate design patterns
- infrastructure
- premature optimization
- giant frameworks

Use the simplest architecture that remains reliable and understandable.

RULE:

**SIMPLE IS GOOD. FRAGILE IS NOT.**

---

# 30. USER EXPERIENCE COMES FIRST

Technical quality exists to support the game.

Formula Tycoon should ultimately create:

DECISION
→ UNCERTAINTY
→ OUTCOME
→ CONSEQUENCE
→ NEW DECISION

The player should feel:

- ownership
- progression
- uncertainty
- anticipation
- optimization pressure
- attachment to drivers
- attachment to the organization
- consequences from decisions
- memorable unexpected stories

Architecture should protect those experiences rather than become an end unto itself.

---

# 31. FINAL DEVELOPMENT PHILOSOPHY

Formula Tycoon is allowed to be built quickly.

It is allowed to use AI heavily.

It is allowed to evolve while it is being designed.

It does not need perfect code.

It DOES need:

- trustworthy saves
- stable simulation
- understandable systems
- reproducible behavior
- automated protection around important rules
- clean ownership of gameplay logic
- recoverable development history
- periodic cleanup
- believable randomness
- long-term career stability

The player's experience is ultimately what matters.

If the game is fun, stable and maintainable, implementation has succeeded.

**WE ARE NOT TRYING TO PROVE THAT WE CAN WRITE PERFECT SOFTWARE.**

**WE ARE TRYING TO BUILD A GREAT TYCOON GAME THAT CAN SURVIVE YEARS OF DEVELOPMENT AND HUNDREDS OF PLAYER SEASONS.**

# WEEKLY DEVELOPMENT LOOP V1 — DESIGN AUDIT

Design and architecture only. No gameplay, simulation, save-format, RNG, D0 or presentation code
was changed. Audited `feature/ui-visual-experience-v1` at `19961ff0215b8d33cab763398430ea717b346143`
(base main `200f4d61ff860537a1f5be6de1843f4888333912`). Figures below were measured from the live
engine with a temporary headless probe, which was deleted afterwards. Required reading was completed: AGENTS, the guardrails,
the architecture, loop, system map, milestones, DEV_STATUS and Graphic Design Bible documents, `simulation/development`, the D0
`universe/index.ts` and `campaignEvents.ts`, `campaignTime`, `trackPerformance`, `managementViews`,
`TeamScreen`, `DevelopmentSummary`, the HQ data and screen, and `useGameUniverse`.

**Summary.** The engine already contains almost everything the loop needs: stages, progress, ambition, cost,
budget, department slots, facility and staff speed, aero testing allowance, seeded outcomes, reverts, reliability,
circuit packages and READY → fitted. The loop is missing three things:

1. **A player project command.** Wellington is `controlledBy: 'PLAYER'`, so the rival AI never plans for it, and
   no command exists for the player to start work. Its car never develops. On June 1, 2026 every rival has 3–5 projects
   and $10–25M spent, the field has fitted 33 upgrades, and Wellington has 0.
2. **A player-facing way to pass time.** `advanceCampaignTo` exists, but the UI never calls it.
3. **A player-facing summary layer**: points, ETA, outcomes and HQ activity.

Hiccups and breakthroughs with decisions are the one feature that genuinely needs new persisted state.

## CURRENT SYSTEM INVENTORY

| Area | Current implementation (authoritative) | Notes for the loop |
|---|---|---|
| Parts | 8 FIA areas (`game/development/parts.ts`): area AERO (6 parts) or VEHICLE_DYNAMICS (front/rear suspension), research method WIND_TUNNEL or RIG, base weeks per stage, cost, max gain, reliability risk, homologation limits (nose and suspensions 2 per season), circuit package (rear wing LOW_DRAG, bodywork HIGH_COOLING), description text per reason | Ready-made player catalogue |
| Project | `DevelopmentProject {id, partId, reason, stage, progress, ambition, expectedGain, cost, startedWeek, circuitPackage?}`. Stages RESEARCH → DESIGN → MANUFACTURING → READY | Exactly the stages the loop wants |
| Start | `startProject(team, profile, context, request)`: refuses BUSY, NO_SLOT, OVER_BUDGET or HOMOLOGATION_LIMIT; commits cost at start; deterministic ID `${teamId}-S${season}-${n}`. The comment says it is "used by the rival AI and, later, by the player" | Reusable unchanged |
| Work | `advanceProjects`: one real week per kernel step. Speed per stage: research = facilities (wind tunnel + CFD) × aero allowance, or rig; design = staff; manufacturing = factory. Leftover time flows into the next stage | Source of truth for "points" |
| Quality | `expectedGain` = max gain × ambition × headroom (diminishing returns) × staff. `resolvePerformanceGain` applies correlation noise and a fail-and-revert chance (seed key `'upgrade', project.id`) | Outcomes come from here |
| Fitting | `introduceReadyUpgrades` runs only on legacy 24-event fixture weeks. It applies the gain, reliability hit, spec+1 and homologation count, writes a submission (expected, actual, outcome, description, cost) and removes the project | Outcome history already persisted |
| Reliability | New specs lose reliability, then mature weekly. AI starts repair projects under 82 | Reliability objective exists |
| Rival AI | `planRivalWeek`: repairs, then circuit packages 10 weeks ahead, then performance projects by value, focus and pacing (`randomFor(seed,'plan',teamId,season,week)`) | Same mechanics; the player is skipped |
| Capacity | Department slots: aero 1 + ⌊(wind tunnel + CFD)/4⌋, vehicle dynamics 1 + ⌊rig/3⌋. Wellington: 2 aero, 1 vehicle dynamics. Budget $45M (cap $60M) | — |
| Time (D0) | Root `currentDate` is the only clock. `advanceTo` processes `(old, target]` day by day: development week (priority 10) or season reset, then contract check (priority 20), ties broken by stable ID. Development weeks are 7-day boundaries from March 2 (Mondays). `developmentView` is a temporary bridge | Weekly kernel, Monday boundaries |
| Track truth | `technicalPerformanceAtTrack` turns fitted parts into the 11-axis technical car and derived suitability (label, strengths, concerns). Suitability is disclosure, never a bonus | Drives "what should we build" |
| Read models | `selectTeamOverview` shows project name, stage and current-stage % only; there is no estimated completion date. `DevelopmentSummary` component; empty state says "Project management controls are not available yet" | Base for the Team hub |
| HQ | Visual simulation: 8 workers, 6 departments (Aero & Design, Strategy, Driver Simulator, Main Workshop, Parts & Manufacturing, Logistics), station activities (TYPING, CAR_SERVICE, FABRICATING, SIMULATOR, HAULING). Its time is milliseconds, never campaign time | Display-only connection point |
| Save | External v5, internal checkpoint v3. Development state persists teams, parts, projects, spend and submissions with no clock fields | Projects already serializable |
| UI commands | `useGameUniverse` exposes scout, option, NEW DAY (HQ replay) and an unused `advanceWeek`. No date-advance UI | Needs a time control |

Measured for a new Wellington career (facilities 3/3/2/3, aero staff 74, vehicle dynamics staff 68, aero allowance 1.05, correlation 72):

| Project | Ambition | Work R / D / M (avg-team weeks) | Speed R / D / M per week | ~Weeks to READY | Cost $M | Predicted gain (part rating) |
|---|---|---|---|---|---|---|
| Floor | 0.35 / 0.60 / 0.90 | 4.05/2.43/2.43 · 4.80/2.88/2.88 · 5.70/3.42/3.42 | 1.05 / 0.97 / 1.00 | 8.8 / 10.4 / 12.4 | 3.58 / 4.42 / 5.42 | 2.6 / 4.5 / 6.8 |
| Front wing | same | 2.43/1.62/1.62 · 2.88/1.92/1.92 · 3.42/2.28/2.28 | 1.05 / 0.97 / 1.00 | 5.6 / 6.7 / 7.9 | 1.49 / 1.84 / 2.26 | 1.8 / 3.1 / 4.7 |
| Rear suspension | same | as floor | 0.80 / 0.91 / 1.00 | 10.2 / 12.0 / 14.3 | 2.61 / 3.22 / 3.95 | 1.6 / 2.7 / 4.0 |

Compatibility fitting dates (2026, all Mondays) run May 11, May 25, Jun 8, Jun 15, Jun 29, Jul 6, Jul 20, Jul 27,
Aug 10, Aug 17, Aug 31, Sep 7, Sep 21, Oct 26, Nov 2, Nov 9, Nov 23, Nov 30, Dec 21, Dec 28, Jan 11, Jan 18,
Feb 1 and Feb 8, 2027. The playable calendar runs **Melbourne March 8 → Yas Marina December 6, 2026**.

## SYSTEMS WE CAN REUSE

- **Unchanged rules:** `startProject`, `advanceProjects`, `stageWork`, `stageSpeed`, `departmentSlots`,
  `spendingLimit`, `estimateWeeksToReady`, `expectedGain`, `projectCost`, `headroom`, `partImportance`,
  `resolvePerformanceGain`, `introduceReadyUpgrades`, `matureReliability`, `planRivalWeek` for rivals,
  `startNextSeason`, `computeCarProfile`, `technicalCar`, `technicalPerformanceAtTrack`, `evaluateCarAtTrack`, and
  the calendar selectors.
- **Unchanged pipeline:** D0 `advanceTo` and `dueCampaignEvents`. The player project lands in existing state
  and the next DEVELOPMENT_WEEK processes it with everyone else, in the same kernel order.
- **Persisted already:** projects, spend, spec, reliability and submissions. The outcome history needed for "what
  happened" is already in `submissions`.
- **Presentation:** `managementViews`, `DevelopmentSummary`, `WorkshopArt`, design-system cards, disclosures and
  actions, HQ department cards and selection, and the Bible's planned "aero/technical bubbles" language.

What genuinely needs adding:

1. A universe command `startPlayerDevelopmentProject` wrapping `startProject` for `playerTeamId` at the current
   date's development view.
2. A player time control using the existing `advanceCampaignTo`.
3. Pure derived read models: points, whole-project progress, ETA, fitting date, outcome labels, department
   activity and part-selector guidance.
4. Optionally, in V1b, a small persisted event model.

## PLAYER EXPERIENCE

The player is team principal: **pick what to build, how hard to push, react to the odd problem, see it fitted and
judged at the track.** One glance answers four questions: what we are building, how far along it is, when it will be
on the car, and whether anything is wrong.

The loop mapped to existing truth:

| Step | Truth |
|---|---|
| Choose focus | Part, objective (reason) and approach (ambition) → `startProject` |
| Team works | Weekly kernel work |
| Department progress appears | Weekly progress delta shown as points |
| Hiccups / breakthroughs | V1b events |
| Project completes | Stage reaches READY |
| Manufacture / fit | Manufacturing stage, then automatic fitting at the next compatibility date |
| Race weekend exposes the consequence | `technicalPerformanceAtTrack` on the next circuit, plus the outcome label |
| Learn, choose again | Weekly report, then the next decision |

No coefficients, sliders or raw gains are shown.

## WEEKLY FLOW

**Finding: development is a weekly kernel, processed on entering each Monday.** Tuesday to Sunday change only
contract status checks. Making Tuesday "generate Aero progress" authoritatively would mean a daily kernel, which
retimes released work and keyed RNG and so needs versioned compatibility review. V1 therefore treats the **week as
the turn** and the days as presentation.

**Monday: report and decide** (`currentDate` = a development boundary, just processed).

1. Weekly report card, for example:
   - "New Floor · Research → Design. +10 Research, +2 Aero this week.
     Ready in about 8 weeks (around Jun 8). Fits at the next introduction window after that."
   - Any fitted upgrade: "Front wing (spec 2): ON TARGET."
   - Any V1b event awaiting a decision.
2. Choices:
   - start a project if a department slot is free (part, then objective, then approach, then confirm with cost,
     duration and slot shown);
   - answer an event;
   - or simply continue.

**Tuesday–Friday: the team works.** The HQ shows departments busy on the CURRENT stage (derived from state). An
optional "Next day" advances one day through `advanceTo`, so the HUD date and contract checks stay honest, but the
development card says "This week's work is credited on Monday". Do not invent daily development numbers. A
"planned this week: +10 Research" figure may be shown as a forecast: the kernel's work is deterministic, so
speed × 1 week is derivable from state.

**Continue to Monday** (primary action) calls `advanceCampaignTo(next Monday)`. The pipeline processes the week
once, the new Monday report appears, and the HQ plays a short visual reaction for any stage change, fitting or event.

Not every week has news. Most Mondays show progress only. Events follow the budgets below, and fittings happen only on
compatibility dates.

## POINT / PROGRESS MODEL

**Points are a presentation of existing progress, not new currencies.** Nothing new is stored, and points never
accumulate outside a project.

- **Unit:** 1 "average-team week" of stage work = **10 points**, a fixed presentation constant in the read model.
  Floor at Balanced needs 48 Research, 29 Aero and 29 Manufacturing. Wellington produces about +10.5 Research,
  +9.7 Aero and +10.0 Manufacturing per week.
- **Category by stage and part area:**

| Stage | Category shown | Generated by (existing speed) |
|---|---|---|
| RESEARCH | **Research**, tinted Aero (wind tunnel/CFD parts) or Technical (rig parts) | Wind tunnel + CFD × aero allowance, or rig |
| DESIGN | **Aero** for the 6 AERO parts; **Technical** for front/rear suspension | Staff quality of that area |
| MANUFACTURING | **Manufacturing** | Factory level |
| READY | none ("Awaiting fitting") | — |

- **Stored or derived?** Derived.
  - Weekly points = 10 × (progress gained this week across stages). This is computed by the advance command
    (before vs after state) and handed to the UI as a transient report.
  - After a reload the current week's report is not reconstructed. The card falls back to "rate per week", which is
    derivable from `stageSpeed`.
  - Requirement and remaining points derive from `stageWork`. Whole-project % = Σ work done / Σ work.
- **Belongs to** a project, never a department pool.
- **Carry-forward:** within a project, leftover weekly work already flows into the next stage, so one week can
  show +3 Research and +7 Aero. Nothing carries between projects, and an idle department produces nothing.
- **Facilities and staff** act only through the existing `stageSpeed`, which is authoritative. A better wind tunnel
  shows as more Research per week.
- **Quality is not points.** Unlike Game Dev Tycoon, points measure progress only. Project quality remains
  `expectedGain` (staff × ambition × headroom) and the existing outcome draw. Whether points should influence quality is
  an owner question.

## PROJECT STAGES

The hypothesis is confirmed, and it is a 1:1 relabel of the existing stages, with no new stage machine:

- RESEARCH → Research points (Aero- or Technical-flavoured by research method).
- DESIGN → Aero or Technical points by part area.
- MANUFACTURING → Manufacturing points.
- READY → "Built — awaiting fitting window". The project stays in `projects` until a compatibility introduction date
  fits it. That date is derivable from the content calendar weeks through the frozen `legacyWeekDate` mapping.

Player-facing objective maps to the existing `reason`:

| Objective | `reason` | Notes |
|---|---|---|
| Performance | PERFORMANCE | Default |
| Reliability fix | RELIABILITY | Short and cheap; restores up to +14 reliability |
| Track package | CIRCUIT_SPECIFIC | Rear wing → Low-drag package; bodywork → High-cooling package |

Approach maps to the existing `ambition`: **Conservative 0.35 / Balanced 0.60 / Aggressive 0.90**. Three named
presets replace a slider. They change duration, cost, predicted gain, failure chance and reliability hit, all
through existing formulas.

## HICCUPS / BREAKTHROUGHS

Events are the only part that needs new state (see SAVE IMPACT), so they ship as **V1b**, after V1a proves the base loop.

**Model.** At most one event per project per stage. Whether an event happens and which one is drawn from a **new keyed
stream**: `randomFor(seed, 'development-event', projectId, stage)`. The draw happens when the project ENTERS a stage
(evaluated during the week that causes the transition), so it is reproducible across daily or jump advancement and
across reloads. The base chance is about 25% per stage transition, giving roughly 0–2 events per project. A global cap allows
one new event per team per week. A seeded stream is required. Never use `Math.random`, and never consume the existing
`'plan'` or `'upgrade'` streams; that would retime released outcomes.

**Effects use only existing project fields, plus one new modifier.** Each option is a deterministic, bounded delta
on `progress` (delay or gain), `cost` (within the budget limit, or the option is unavailable), `expectedGain`,
and a new per-project `correlationAdjustment`. That last field makes `resolvePerformanceGain` use
profile.correlation + adjustment, bounded to 0–100. This is the only rule change, and it is not a second outcome calculation.

V1b catalogue (6 events, 2–3 choices each):

| Event (stage) | Choices → consequence |
|---|---|
| Wind tunnel / CFD disagreement (RESEARCH, aero) | Investigate (+1 week of work, correlation +15 for this project) · Trust CFD (no delay, correlation −10) |
| Rig correlation doubt (RESEARCH, rig) | Retest (+0.8 week, correlation +15) · Proceed (correlation −10) |
| Design breakthrough (DESIGN) | Exploit (+15% expected gain, +0.5 week) · Bank time (+0.5 week of progress) |
| Simplification opportunity (DESIGN) | Simplify (−0.7 week, −10% expected gain) · Keep full concept |
| Prototype defect (MANUFACTURING) | Remake (+0.7 week, +10% cost) · Fit as is (reliability hit ×1.5 at fitting) |
| Material shortage (MANUFACTURING) | Expedite (+15% cost) · Wait (+1 week) |

**Decision → uncertainty → consequence.** Choices trade known time and money against hidden risk (correlation and
gain) that resolves at fitting. The outcome text cites the decision: "Floor: ABOVE EXPECTATION — your wind tunnel
investigation paid off".

Unanswered events default deterministically to the first listed choice at the next development boundary, so they never
block time or the AI. **Rivals:** see AI TEAM INTEGRATION.

## PROJECT OUTCOMES

These are presentation labels derived from the existing submission (`expectedGain`, `actualGain`, `outcome`) and the
resulting part reliability. There is no new calculation.

| Label | Derived from |
|---|---|
| ABOVE EXPECTATION | DELIVERED and actual ≥ 1.15 × expected |
| ON TARGET | DELIVERED, between 0.6 and 1.15 × expected |
| BELOW EXPECTATION | UNDERPERFORMED (actual < 0.6 × expected) |
| DIDN'T WORK — REVERTED | REVERTED (money spent, previous spec kept) |
| + RELIABILITY CONCERN (tag) | Part reliability after fitting < 82, the existing repair threshold |
| MANUFACTURING DELAY (V1b only) | An accepted delay event, from the event log |

Numbers stay hidden. "Predicted: Moderate gain" uses qualitative bands of `expectedGain × partImportance`. The actual
gain is shown only as the label and the visible effect on the next circuit briefing (strengths and concerns change).
The 1.15 threshold needs an owner sign-off. It is presentation only.

## HQ PRESENTATION

Before visual work, read and follow `docs/GRAPHIC_DESIGN_BIBLE.md`.

A derived selector `selectDepartmentActivity(universe, definition)` maps active player projects to HQ departments:

| Project state | Department shown active |
|---|---|
| RESEARCH, aero | Aero & Design (wind tunnel model) |
| RESEARCH, rig | Driver Simulator (rig) |
| DESIGN, aero | Aero & Design desks |
| DESIGN, vehicle dynamics | Main Workshop |
| MANUFACTURING | Parts & Manufacturing |
| READY | Logistics (crate staged for the transporter) |
| Fitting week | Car bays |

Display rules:

- Department signs gain a small status dot and an "Active: Floor · Research" line. Department cards show the project,
  stage and stage progress.
- On the first render after a Monday advance, small labelled bubbles ("+10 Research") rise from the relevant
  department, played once and timed by UI animation only. A stage change shows one sparkle; a REVERTED or defect event
  shows one restrained setback icon. Every effect is paired with a text label, never colour alone, and uses the shared
  icon and illustration language, with no new art language.
- Workers keep their HQ engine assignments and routes. Development state never moves a worker in V1, and animation
  never produces progress. Idle departments look calmer (fewer effects), not empty.
- Effects must not imply work that is not happening. With no project active, no bubbles are shown.

## TEAM SCREEN PRESENTATION

The Team screen becomes the development hub, following GLANCE → UNDERSTAND → TAP → INVESTIGATE → ACT.

- **Glance (overview card):** focus project name and stage chip; whole-project progress bar; "Ready ~Jun 8 · fits
  next window"; this week "+10 Research"; a risk badge if an event is waiting or reliability is a concern. Empty
  state: "Your factory is idle — Start a project" (action), replacing "not available yet".
- **Understand (development view):** one row per active project (up to the slots: Wellington 2 aero + 1 vehicle
  dynamics), slot availability, budget used and remaining, the latest outcomes from `submissions`, and the next fitting
  window date.
- **Tap / investigate (project detail):**
  - stage track (Research → Design → Manufacture → Ready) with points done and needed per stage, rate per week and
    ETA;
  - objective, approach and predicted band;
  - event history and decisions (V1b);
  - "Why this ETA" (facility and staff in words: "Wind tunnel and CFD: average · Aero staff: good"), with no numbers.
- **Act:** start a project, answer an event, open the next circuit's concerns.

Every value comes from read models over domain state, extending `selectTeamOverview`. No component calculates progress,
ETA or labels.

## PART SELECTION

A sheet with 8 cards, grouped into AERO (6) and CHASSIS (2). Each card shows:

| Field | Source (derived, qualitative) |
|---|---|
| Name and one-line role | Content text, e.g. "Floor — biggest source of downforce" |
| Helps | Top 2–3 technical axes the part feeds: part contributions → car attributes → the `technicalCar` mapping, ranked, shown as labels (e.g. Floor: High-speed aero · Medium-speed cornering) |
| Fit to next races | "Targets a concern at Monaco, Barcelona" when a helped axis appears in upcoming briefings' concerns |
| Typical duration | `estimateWeeksToReady` rounded ("about 10 weeks at Balanced") |
| Cost | `projectCost` in $M against the remaining development budget (an existing value, not a finance system) |
| Potential | Low / Medium / High band from expected gain × importance |
| Availability | Busy, no slot, over budget, or the homologation limit ("Nose: 1 of 2 changes left") |

Then **objective** (Performance, Reliability fix or Track package where valid), then **approach** (Conservative,
Balanced or Aggressive, each with "faster/cheaper/safer" versus "bigger/riskier" text), then **confirm**.

## TRACK STRATEGY

There are no named-track rules. The selector reads existing truth:

1. Take the upcoming events whose race date falls after the project's projected fitting date (derived).
2. Look up their briefings' `strengths` and `concerns` from `technicalPerformanceAtTrack` and their `demand` levels.
3. Rank parts by how many HIGH or VERY HIGH demand axes in that window they help, using the same part → attribute →
   axis mapping. This is a presentation ranking only and adds no performance.

Low-drag and high-cooling packages remain owned by `computeCarProfile`. The selector only recommends building them
before LOW-downforce or hot circuits.

Pressure is also honest about timing. A part that fits after the target race is shown as "won't be ready for Monaco".
Because compatibility fitting starts May 11, early-season pressure (Melbourne to Miami) cannot be met in 2026. That is
a direct consequence of the retained cadence (FITTING COMPATIBILITY).

## AI TEAM INTEGRATION

- **V1a:** rivals keep `planRivalWeek` unchanged. The player uses the same `startProject`, stage, speed, outcome,
  fitting, reliability and budget rules. Released AI behaviour and determinism are untouched. One small asymmetry is
  disclosed: AI plans at the boundary and receives that boundary's week of work immediately, while a player project
  started mid-week first receives work at the next boundary.
- **V1b events: same mechanics for everyone.** Rivals get the same seeded events, resolved by policy: aggression >
  0.55 picks the riskier fast option, cautious teams investigate. This changes rival outcomes for all future weeks, so
  it must ship behind a new development-rules version (definition version and save v6). Existing careers either stay
  on rules v1 (events for the player only, or none) or migrate explicitly. This is an owner decision.
- No fake or simplified rival model. The circuit-package and reliability AI logic remains the reference for "sensible" choices.

## D0 / CAMPAIGN TIME INTEGRATION

- **No new clock.** The player command reads `developmentView(state, currentDate)` for season and week (the same
  bridge), calls `startProject`, and writes back `developmentState`. Validation requires `startedWeek ≤ week`,
  which holds.
- **Advancement:** "Continue to Monday" and "Next day" call `advanceCampaignTo`, so every due instruction in
  `(old, target]` is processed once, in date → priority → ID order. A jump is equivalent to daily stepping.
- **V1b event instruction:** if events need their own timing, they are evaluated INSIDE the existing
  DEVELOPMENT_WEEK handler (during project advancement), not as a new instruction kind. That keeps priority 10 order
  and existing semantics. Default-resolving unanswered events happens in the same handler at the next boundary, before
  AI planning, a position the owner must approve.
- **Season boundary:** normal advancement cannot cross March 2, 2027, because `startUniverseSeason` requires supplied
  standings and no results exist yet. V1 is a **one-season loop**. The advance control must stop at week 52 with an
  honest "Season review not available yet" state. `startNextSeason` also drops unfinished projects (existing rule),
  which must be disclosed.
- D0 semantics are unchanged. No queue, ledger or watermark is added.

## FITTING COMPATIBILITY

The retained cadence fits READY projects only on the 24 legacy fixture weeks (first **May 11, 2026**, last
**February 8, 2027**). It is not the playable calendar (March 8 to December 6). V1 keeps it:

- The UI must show the real derived fitting date: "Fits Mon May 11 (next introduction window)". It must never say "at
  Melbourne".
- Fitting stays automatic. There is no "hold" or "fit now" choice in V1, because that needs persisted fit intent.

**FUTURE VERSIONED DESIGN DEBT: real-weekend fitting.** Fitting at the next playable race weekend, plus a player
fit/hold choice, would complete the loop's "race weekend exposes the consequence" beat. Without it, the first four
rounds can never receive upgrades, upgrades keep landing for two months after the final race, and the race the
outcome is judged at is not the one the upgrade was fitted for. It requires:

- a new calendar cadence policy and development-rules version;
- migration of pending READY and in-flight work;
- re-validation of submission chronology (week ↔ event);
- deterministic replay review of the `'upgrade'` keys (unchanged keys, different timing);
- a rival balance review.

It must not be changed silently inside the loop milestone. Recommendation: schedule it as a separate versioned slice
before or with V1b.

## SAVE IMPACT

| Data | Needs persistence? | Decision |
|---|---|---|
| Player projects (part, reason, ambition, progress, cost) | Yes | **Already persisted** in the existing shape. V1a needs no schema change |
| Weekly points / department contributions | No | Derived (transient report from the advance command, or a rate derived from state) |
| Whole-project %, ETA, fitting date, part guidance | No | Derived |
| Outcome history | Yes | **Already persisted** in `submissions`. Labels are derived |
| Unresolved events + chosen decisions + applied deltas | **Yes** | V1b. Pending decisions must survive save/reload, and the outcome explanation must cite them |
| `correlationAdjustment` per project | Yes (V1b) | An additive optional field |
| Development-rules version (events on or off) | Yes (V1b) | Distinguishes released kernel behaviour from the new rules |
| Fit/hold intent | Future | Belongs to the real-weekend fitting slice |

**V1a: no save change.** Player-started projects are already valid v5 data, because AI projects use the same shape.
A temporary probe (deleted) confirmed this:
- `startProject` was run for `team.wellington` (Floor, Balanced) through the `developmentView` bridge. It produced
  `team.wellington-S1-1`.
- The envelope validated, and the project progressed 1.05 per week through D0 (2.10 after two Mondays).
- Save → reload → advance was identical to advancing directly.
**V1b: save v6 required.** It would add, per project:

- `events: Array<{eventId, stage, choice | null, defaulted}>`;
- `correlationAdjustment: number`;

plus a rules-version identity. The migration is additive: v5 projects get empty events and 0 adjustment, and keep
rules v1. It needs a frozen v5 contract and fixture, v5 → v6 tests, validation (bounded deltas, at most one event per
stage, choice IDs from the catalogue) and unchanged historical hashes. The version was **not** bumped in this audit.

## RNG IMPACT

- V1a adds **no RNG**. Player projects use the existing `'upgrade', project.id` key at fitting, deterministic because
  project IDs are deterministic.
- V1b adds exactly one new namespace: `'development-event', projectId, stage`, with draws for occurrence, then event
  type, then nothing else. Choices are player or policy input, not random.
- Existing keys `'plan'` and `'upgrade'` are never renamed or reordered, and no extra draws are taken from them.
- No `Math.random`. HQ effect timing is UI animation, separate from gameplay.

## V1 SCOPE

**V1a — "Choose, build, see it fitted" (no save change, proves fun):**

1. A universe command to start a player project (part, objective, approach) through the existing `startProject`;
   refusals surfaced in player words.
2. Time control: "Continue to Monday" (primary) and "Next day", through `advanceCampaignTo`; stop at week 52.
3. Read models: weekly report, points by category, whole-project %, ETA, fitting date, outcome labels, department
   activity and part-selector guidance (track pressure included).
4. The Team development hub (overview card, project list, project detail, start flow) and the part selector sheet.
5. HQ: department status plus one-shot Monday bubbles and stage, fitting and setback reactions.
6. Player Manual section for development, with no formulas.

**V1b — "Hiccups and breakthroughs" (save v6):** the 6-event catalogue, decisions, default resolution, the
`correlationAdjustment` hook, AI policy choices behind a rules version, and outcome text citing the decision.

## NON-GOALS

Staff hiring or ratings UI, finances or ledger, sponsors, facility upgrades and construction, qualifying, races, weather,
dynamic engineering teams, many events, resource markets, real-weekend fitting (separate versioned slice), multi-season
progression or season review, project cancellation or refunds, daily development kernel, new points currencies, any change
to cadence, development balance, rival AI or the D0 pipeline in V1a.

## FAILURE MODES

| Risk | Guard |
|---|---|
| A second progress system (UI accumulating points) | Points derived from project progress only; the UI never stores them |
| Double processing of a week | Only `advanceTo`; same-target no-op; tests |
| UI computes ETA or labels | All derived in `simulation` read models; source-boundary test |
| Player project bypasses rules | Must go through `startProject`; refusals tested |
| Mid-week start exploit or confusion | Disclosed; equivalence tests for start-on-Monday versus mid-week |
| Fitting date misleads (calendar mismatch) | Always show the derived compatibility date, never a race name |
| Season-boundary dead end | Stop control at week 52 with an honest message |
| Unfinished work lost at season reset | Disclosed now; future carry-over decision |
| Events spam or block | Per-stage cap, per-team weekly cap, default resolution |
| Event RNG shifts released outcomes | New namespace only; existing-key snapshot tests |
| Rules change silently affects old careers | Rules version plus save v6 for V1b |
| Hidden numbers leak | Qualitative bands; DTO boundary tests |
| HQ animation treated as truth | Selector-only effects; workers untouched |

## TEST PLAN

Behavioural tests, defined before implementation:

**Determinism and time**
- Same seed and same decisions give an identical project, outcome and submission (player and rival).
- Daily stepping equals one jump to the same date equals the existing kernel (extends the D0 equivalence tests with a
  player project).
- Save and reload mid-project (each stage, the day before a boundary, the day before fitting), then continue: identical.
- No duplicate weekly progress: repeat the same target (no-op); progress grows by exactly one week's speed per boundary.
- V1b: no duplicate event per project and stage; deterministic across jump, daily and reload; default resolution exactly once.

**Rules parity**
- Player and rival projects use the same `startProject`, `stageSpeed`, `expectedGain` and outcome. A rival profile
  forced through the player command matches the AI result for identical parameters.
- Facility and staff changes alter points per week exactly as `stageSpeed` does. There is no independent multiplier.
- Refusals: BUSY, NO_SLOT, OVER_BUDGET, HOMOLOGATION_LIMIT and non-player teams.

**Lifecycle**
- Pending, READY and fitted distinctions: READY gives no car change until the fitting date; fitting applies once;
  the project is removed; the submission is written; a completed project never reappears.
- Reverted: no rating change, cost retained, label correct.
- The circuit package affects only matching circuits, through `computeCarProfile`.

**Read models**
- Points: per-category sums equal 10 × the progress delta; requirements equal 10 × `stageWork`; whole-project % lies
  in 0–100 and is monotonic; ETA equals `estimateWeeksToReady` remaining; the fitting date equals the next compatibility week.
- Outcome labels derive from submissions only.
- Track guidance uses existing briefings, with no track-ID branches.
- Department activity follows the stage mapping, and workers are unchanged.
- Source-boundary and lint tests: no `Math.random` in `src/simulation`; no development math in `src/ui`.

**Long career**
- Run a full season with the player starting projects whenever a slot is free (headless policy): budget never exceeded,
  ratings bounded, homologation respected, submissions chronological.
- Week 52 stop behaves correctly.
- V1b: a v5 → v6 fixture migration and multi-season runs once a season review exists.

**Presentation** (390 × 844 and 1440 × 1000, both themes)
- Start-project flow, weekly report, Monday bubbles, empty and busy states, no overflow, labels not colour-only.

## ARCHITECTURE RISKS

1. **Cadence mismatch** undermines the core beat (fitting is not tied to real weekends). Highest product risk.
   It is versioned debt, not fixable silently.
2. **Weekly granularity** versus the desired daily feel. Daily authoritative work needs kernel retiming.
3. **Rules divergence** if V1b events reach only the player. Needs a deliberate parity decision.
4. **Season-boundary dead end** until standings and season review exist; the loop is single-season.
5. **Unfinished work dropped at season reset** (existing `startNextSeason`).
6. **Mid-week start asymmetry** relative to the AI.
7. **Budget presentation** ($M development spend) may read as finances before a ledger exists.

## OPEN DESIGN QUESTIONS FOR OWNER

1. **Turn unit:** accept a weekly turn (Monday report, days as presentation and forecast), or require authoritative
   daily progress (kernel retiming; versioned)? *Recommendation: weekly turn for V1.*
2. **Fitting:** keep the compatibility cadence for V1 (May 11 → Feb 8, auto-fit), or schedule real-weekend fitting
   plus fit/hold as a versioned slice first? *Recommendation: V1a on the current cadence, with the real-weekend slice
   before V1b.*
3. **Events and save v6:** approve V1b's persisted events and rules version? Should rivals receive the same events
   (recommended, behind a rules version) or the player only?
4. **Points and quality:** progress only (recommended), or should points affect upgrade quality as in Game Dev Tycoon?
5. **Concurrency:** expose all existing slots (Wellington 2 aero + 1 vehicle dynamics), or one focus project in V1
   while keeping the rules intact?
6. **Money:** show $M cost and remaining development budget (existing values), or qualitative cost only until finances exist?
7. **Season end:** accept a single-season V1 with the week-52 stop and the dropped-projects disclosure?
8. **Thresholds:** approve the outcome label cut (ABOVE ≥ 1.15 × expected) and approach presets 0.35 / 0.60 / 0.90.

## RECOMMENDED IMPLEMENTATION SEQUENCE

1. Owner decisions 1, 2, 5, 6 and 7 (needed for V1a); 3, 4 and 8 can follow.
2. V1a-1 domain: `startPlayerDevelopmentProject` command and the derived read models (points, progress, ETA,
   fitting date, labels, activity, guidance), with tests.
3. V1a-2 time control in `useGameUniverse` and the UI (Continue to Monday / Next day / week-52 stop), with equivalence tests.
4. V1a-3 Team hub and part selector, following the Graphic Design Bible.
5. V1a-4 HQ department status and Monday effects; browser checks in both themes; Player Manual.
6. Real-weekend fitting as a versioned slice (if approved).
7. V1b events: frozen v5 contract and fixture, v6 migration, event stream, `correlationAdjustment`, AI policy behind
   the rules version, then tests.

NEEDS OWNER DESIGN DECISIONS FIRST

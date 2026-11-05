# Weekly Development Loop V1: implementation

Implements the owner-approved design in [WEEKLY-DEVELOPMENT-LOOP-V1-DESIGN](WEEKLY-DEVELOPMENT-LOOP-V1-DESIGN.md),
following the "OWNER DECISIONS" section. Branch `feature/weekly-development-loop-v1`, based on the visual branch head
`19961ff` plus the design commits. Qualifying and races were NOT started.

## Five questions

| Question | Answer |
|---|---|
| Owner | `simulation/developmentLoop`: rules-2 week step, FP1 fitting, events, commands, turn target, read models. The existing development kernel still owns work, outcomes and AI planning. D0 `advanceTo` owns time |
| Persistent state | Save **v6**: root `developmentRules` (1 or 2) and optional per-project `events`, `bonusPoints`, `correlationAdjustment`, `delayWeeks`, `hold`. Rules-2 submissions carry real calendar event IDs |
| Connections | D0 pipeline (new `DEVELOPMENT_FITTING` instruction at priority 15), existing `startProject`, `introduceReadyUpgrades` (optional hooks), `advanceDevelopmentWeek` (optional fitting/planning inputs), trackPerformance, calendar, HQ display |
| Failure modes | Retiming old careers; double fitting or progress; unseeded randomness; negative progress breaking frozen v5 rules (found and fixed with `delayWeeks`); UI-owned rules; layout regressions |
| Proof | 21 new behavioural tests; the 354 existing tests (rules-1 equivalence pinned explicitly); browser loop at 390 × 844 and 1440 × 1000; existing UI and theme suites |

## What the player can do

- **Start a project:** TEAM → Development → Start a project, then choose a part, objective and approach.
  - Objective: Performance, Reliability fix or Track package.
  - Approach: Conservative 0.35, Balanced 0.60 or Aggressive 0.90.
  - The same `startProject` rules as rivals apply: department slots, budget, homologation.
- **Read the guidance:** each part shows the technical axes it helps, measured on the current car through
  `technicalCar`. It also lists reachable upcoming weekends with strong demand on those axes, plus duration,
  $M cost and a predicted gain band.
- **Take turns:** "Continue" goes to the next development Monday or an earlier FP1, whichever comes first. Phones
  show it in the HUD; desktop also offers "+1 day". The control stops at the end of the development season.
- **Read the turn report:** points by category (10 points = 1 average-team week of stage work), stage changes,
  upgrades fitted (with labels derived from the submission), decisions needed, and rival upgrade counts. The HQ
  department signs show the active project and a one-shot points bubble.
- **Manage projects:**
  - **Events:** six events (two per stage), on PERFORMANCE projects only, 25% chance per stage. Unanswered
    events take the first option at the next Monday.
  - **Refine:** once, in DESIGN: +10 bonus points, one week, 10% of cost.
  - **Hold:** keeps a project back from the next weekend.
  - Bonus points raise the fitting prediction by 1% each, capped at ±25%.

## Rules versions

- **Rules 1** (every migrated v1–v5 career): the unchanged kernel, the 24-event compatibility fitting cadence
  and no events. The D0 equivalence tests stay pinned to rules 1.
- **Rules 2** (new careers): the kernel runs with legacy fitting disabled, and rival planning reads the career's
  real weekends.
  - READY work fits when entering each event's `weekendStartDate`.
  - Events use the new keyed stream `'development-event', projectId, stage`.
  - Rivals receive the same events and resolve them by aggression; aggressive rivals also refine when the
    budget allows.
  - `'plan'` and `'upgrade'` stream keys are unchanged.

## Save

- **v6:** `contracts/v6.json` is the frozen content snapshot (v5 content with the new identity).
  `contracts/validationV5.ts` freezes the released V5 universe rules.
- **v5 → v6:** `developmentRulesMigration.ts` validates V5, then attaches rules 1 only.
- **v6 validation:** `developmentRulesValidation.ts` validates the v6-only facts against a frozen
  vocabulary, then delegates the shared structure to the V5 rules.
- **Fixture:** `driver-world-v5.json` is a meaningful V5 career (July 15, 2026: 59 submissions, a player-started
  fitted front wing, scouting, an exercised option, mid-route HQ). Its SHA-256 is tested.

## Limitations (honest)

- Single season: the development season ends at week 52 (March 1, 2027). Season review and standings do not exist,
  and the existing reset still drops unfinished projects.
- Weekly granularity: development work is credited on Mondays, and days are presentation only.
- No sessions or results at FP1. The race weekend only fits upgrades and shows suitability elsewhere.
- Balance: event probabilities and option deltas are first-pass values. Rules-2 AI spends budget against the
  real calendar (last race in early December), so rival pacing differs from rules 1.
- The turn report is UI session state; after a reload, the hub shows current state instead.
- Native iPhone, live Cloudflare preview behaviour and long multi-season balance are NOT verified.

## Play-test pass 1 ("it didn't feel like it was doing much")

The owner's first play-test found the loop working but flat. Four changes followed, with no save-shape change.
The v6 event vocabulary was extended while v6 is still unreleased (preview branch only, no durable saves).

1. **Watch the week:** after Continue, the turn report and HQ department bubbles replay the week's real result
   over about 3 seconds: points counting up, project bars filling, a Monday → Friday ticker, and "Skip" to jump
   ahead. It is presentation of an already processed turn (`usePlayback`); it never produces progress.
   Reduced motion shows the final values immediately.
2. **What changed:** reports where parts were fitted list the technical characteristics that rose or fell
   (the existing `technicalCar` before vs after the turn) and that weekend's circuit suitability label, using
   the existing `technicalPerformanceAtTrack`. Qualitative only: no scores or rankings. The temporary
   reliability dip of a new spec is labelled as such.
3. **Paddock news:** up to three notable rival changes per turn ("Moravia Motorsport brought a new floor", "… went
   back to the old one"). Only observable facts are shown; hidden rival gains stay hidden.
4. **More decisions:** the event chance rises from 0.25 to 0.5 per stage, and three events are added: Extra
   simulation time (research), Rival concept spotted (design), Lighter material offered (manufacturing).
   An engaged player now sees roughly one decision every two to three weeks (tested: 9–20 in 30 weeks).
   Every event keeps a no-cost first option, which is also the default.

Tests: 380/380 (5 new). The UI and theme browser suites pass at 390 × 844 and 1440 × 1000 in both themes. The
playback, fitting report and paddock news were checked in the browser.

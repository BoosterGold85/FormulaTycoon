# Qualifying V1: design note

Status: **APPROVED (A–C) AND BUILT. Ready for owner play-test.** See "As built" at the end.
Base: main `a204428`, which includes Watch the Week and save v7.

## Owner decisions

| Topic | Decision |
|---|---|
| Format | Q1/Q2/Q3 knockout: 22 → 16 → 10. |
| Control | A pre-session plan, plus at most one mid-session call per segment. |
| Weather | In V1, as simple seeded weather. Forecast quality depends on the Research work (bubbles) the team has produced up to this point. |
| Sprints | The 6 sprint rounds run normal Saturday qualifying. Sprint qualifying and sprint races come later. |
| PR #2 | Merged first. Qualifying builds on main as save v8, with v7 frozen. |

## 1. Session format

- **Saturday** = `weekendStartDate + 1`. FP1 is the Friday. All dates are campaign dates; no wall clock is used.
- Each segment is a fixed number of whole-minute slots:

  | Segment | Minutes | Cars | Knocked out | Positions decided |
  |---|---|---|---|---|
  | Q1 | 18 | 22 | 6 | P17–P22 |
  | Q2 | 15 | 16 | 6 | P11–P16 |
  | Q3 | 12 | 10 | — | P1–P10 |

- A **run** is an out-lap, then a flying lap, then an in-lap, and occupies about 3 slots.
  - Only the flying lap is timed.
  - A car can make 1 or 2 runs per segment, if the tyres and time allow it.
- **Ties** are broken by who set the time first, then by the seeded stream. Every car is classified.
  - A car with no time, because of a crash or because it never left the garage, is placed last in its segment by the
    tie rules.
- **Track evolution:** the circuit's `trackEvolution` makes later laps faster within each segment. This is why "go late"
  is tempting, and why traffic tends to build up at the end.

## 2. Player choices (per driver)

**Pre-session plan**, set on the plan screen and locked before the session:

1. **Tyres per segment:**
   - new soft;
   - used soft;
   - medium, the Q1 "banker" (if it's enough, you save a soft set);
   - intermediate or wet, offered only when the conditions call for them.
2. **Runs per segment:** 1 run, or 2 runs.
   - 2 runs means more chances, but uses more tyre sets and spends more time in traffic.
3. **Exit timing:** early, middle or late.
   - Early means a clean track but less grip, and it's safe if rain is coming.
   - Late means peak grip but busy traffic and weather risk.
4. **Traffic approach:**
   - "Find space": lose a few slots to find a gap, which risks running out of time.
   - "Push through": a higher chance of a compromised lap.

**Tyre allocation:** a simple qualifying allowance of 4 new soft sets plus 1 medium set.

- Spending sets in Q1 and Q2 leaves fewer new sets for Q3. This is the main trade-off.
- The race-tyre consequences come later, with the race itself.

**Mid-session call:** at most one per segment. The replay pauses after the first runs and asks:

- Go now?
- Wait for the final minutes?
- Stay in the garage (for example, when you're safely through)?

When the weather changes, you also get "switch to inters". You answer once for each of your drivers.

The headless default is the AI policy's answer, the same pattern as the existing development decision defaults.

**Rivals:** an AI policy decides each rival's plan and calls.

- The policy reads the team's car level, its risk profile and its own forecast.
- It uses the team's own seeded stream, so your choices never change a rival's luck. Real traffic between cars is
  still shared.

## 3. How lap time is built (high level)

Each flying lap's time is a reference time minus a performance term, plus these session factors:

- **Car fit** (the dominant factor): the fitted car at this track, read through the existing
  `technicalPerformanceAtTrack` boundary after Friday's fitting. A newly fitted floor shows up on Saturday.
  - No track-specific or team-specific branches.
- **Driver:**
  - talent and composure;
  - the Qualifying Specialist and Wet Weather Specialist traits;
  - form, confidence and comfort with the car (kept separate from car/track fit).
- **Session execution:**
  - track evolution at that minute;
  - tyre compound and age;
  - a traffic penalty from cars on track in the same slots;
  - weather grip.
- **Seeded noise and mistakes:** a small spread on every lap, plus a lap-ruining mistake that becomes more likely with
  "Push through", wet conditions and low composure.
  - Stream key: `randomFor(seed, 'qualifying', calendarId, eventId, teamId, driverId, segment, run)`.

**Calibration targets** (provisional game weights, checked by tests rather than claimed as real-world fact):

- The car spread dominates.
- Driver and execution can swing about 3–5 positions.
- A fast car only rarely goes out in Q1.

The exact weights stay hidden from the player.

## 4. Weather and forecast

**Actual weather** is seeded per round, using the circuit's `rainTendency`.

- The states are dry, drying, rain arriving, and wet.
- There is at most one change in V1, at a seeded minute.

**Forecast:** each team (player and rivals) sees a forecast, issued at FP1, on the plan screen.

- The forecast is the actual timeline with error added: the time of the change, and whether it happens at all.
- The error shrinks as the team's accumulated Research points grow. These are the same authoritative points the week
  replay shows as Research bubbles.
- The player sees forecast confidence as Low, Medium or High, and the Player Manual explains that research work
  improves it. The formula is not shown.
- Research has diminishing returns: a well-researched team is better informed, never certain.

**New persistent state:** a per-team `researchPoints` total for the season.

- The existing weekly development step adds to it. This is bookkeeping only; no development outcome changes.
- **Open point A:** for migrated v7 saves, I recommend seeding it from the research work already done on current
  projects. That is deterministic and documented as an estimate. The alternative is to start at 0.

## 5. Campaign flow

1. **CONTINUE TO FP1:** Friday, unchanged. Fitting happens, and the forecast is visible.
2. **CONTINUE TO QUALIFYING:** the turn target becomes Saturday.
   - The plan screen opens.
   - Continue is gated by a new reason, `QUALIFYING_PLAN_REQUIRED`, like `DECISION_REQUIRED`.
3. **Lock plan:**
   - A new `QUALIFYING` campaign event, with an explicit priority after `DEVELOPMENT_FITTING`, resolves Q1 up to its
     call.
   - The replay plays, pauses at the call, then resolves the rest of the segment.
   - This repeats for Q2 and Q3.
4. **Report Card:** then the grid appears on the Race tab.
   - Sunday shows "Race not simulated yet".
   - Continue goes to the next Monday.

Headless and non-player paths run the whole session at once with policy defaults. No UI is needed.

## 6. Storage and no double processing

There is a new root map, `universe.qualifying: Record<eventId, QualifyingRecord>`. Each record holds:

- `status`: PLAN, then Q1, Q2, Q3 (each waiting for its call), then COMPLETE;
- `rules: 1`, pinned per career so later tuning never reinterprets saved sessions;
- the actual weather;
- each team's forecast as issued;
- the locked plans and the calls made;
- for each segment, every car's laps, best time and causal tags;
- the final grid: 22 entries with position, driver, team, best time, the segment where the car went out, and the
  reasons.

The size is about 24 rounds × 22 cars, which is small.

Guarantees:

- Each segment is written once, and a completed segment is never recomputed.
- Processing an event whose record is COMPLETE does nothing, and validation rejects a duplicate grid or one that isn't
  22 cars.
- Reload resumes at the exact status. A pending call stays pending, and its outcome doesn't change, because all inputs
  and RNG keys are fixed.
- Grids for rounds before a v7 save was migrated are not backfilled. Those rounds show "Not held: qualifying not yet
  introduced".

## 7. The "why"

Each driver gets 1–3 reasons, chosen from causal tags in the stored laps. Examples:

- "Traffic cost about 0.3 s on the final run."
- "Rain arrived at 9′; the early run banked the time."
- "Car fit: strong in high-speed corners", reusing the existing strengths and concerns.
- "Out in Q2 by 0.04 s."
- "Saved a new soft for Q3."

Reasons are stored with the result, so the UI never invents them.

## 8. Save v8

- Freeze the v7 contract and its fixture.
- Add a v7 → v8 migration: an empty `qualifying` map, `researchPoints` per Open point A, and the qualifying rules pin.
- Validate both the source and the migrated output, and test the migration.
- v1–v7 stay unchanged.
- Imports go through the existing validated envelope and repository.

## 9. Screens (step 4, following the Graphic Design Bible)

- **Plan:**
  - two driver columns with the tyre, runs, timing and traffic pickers;
  - the forecast card with its confidence;
  - a car/track fit summary.
- **Live replay:**
  - a timing tower with the session clock and a weather strip;
  - your two cars highlighted;
  - the pause card for the call;
  - 1×, 2× and Skip, the same as the week replay.
- **Report Card:**
  - grid positions, the gap to the cutoff and to pole, the reasons, and your teammate comparison.
- **Race tab:** the 22-car grid.

All four screens are checked at 390×844 and 1440×1000, in both themes.

## 10. Tests (step 2)

- Valid 22-car grid every round, with all entrants classified.
- No double processing, and repeated advancing does nothing once the session is complete.
- Same seed and same choices give an identical grid; changing one choice changes my result.
- Choices matter measurably: over many seeds, a good weather call or good tyre management gains positions on average.
- Over 500 seeds, a better car or better fit qualifies ahead more often, but not always.
- Spread stays within the calibration bounds.
- Forecast error shrinks as Research points grow.
- Rival streams are independent of the player's choices.
- Save/reload at every status, v7 → v8 migration, and historical fixtures.
- Headless run of a full season of qualifying.
- A guard that no race result is produced.

## Open points for approval

- **A:** the migrated `researchPoints` seed. Recommended: estimate from current research work.
- **B:** the tyre allowance: 4 new softs and 1 medium.
- **C:** the segment lengths and the 3-slot run.

## As built

Where the build differs from, or adds to, the note above:

- **No full wet tyres.** Wetness peaks below full-wet levels, so intermediates are the only wet tyre. They are
  not rationed.
- **Times are gaps only.** Laps are stored against a nominal reference lap, so no circuit lap time is invented.
  The UI shows gaps ("+0.234", "+0.734 in Q1").
- **The call sees only finished laps.** Cars still on a flying lap at the checkpoint are unknown to everyone,
  player and AI alike. The pit wall counts a place as "safe" only once at least as many cars as go through have
  set a time. (Play-test fix: the first version told a P7 car to stay in while half the field had no time.)
- **A late single run never waits for space.** Waiting would make it miss the flag, so the AI and the
  recommended plan use "push through" for it. The player can still choose to wait.
- **The briefing is lazy.** The session record is created when the player first locks a plan, or on Saturday.
  Its inputs are fixed from FP1 onward, so the result is identical either way. This also covers v7 saves made on
  an FP1 Friday.
- **Research totals reset each season** at the explicit season transition.
- **Replay speed (play-test 2, owner: "too jumpy"):** the replay moves in sector beats, three per session minute.
  A beat where a sector or lap completes holds about 1.1 s at 1×; a quiet beat about 0.35 s. 2× halves both, and
  Skip jumps to the next call or the flag. Q1 reaches its call in about 21 s.
- **Sectors (play-test 2):** each stored lap now carries three sector times that sum to the lap. The three noise
  draws are the sectors' own; traffic and a mistake each land in one sector. The new draws come after every
  earlier draw, so every lap time and grid is unchanged (verified against the earlier measurements). A lost lap
  stops at the sector where it went off. Shown colours are current: purple = fastest so far, green = the driver's
  own best, yellow = slower. Sectors are shown as gaps to the fastest sector, never as absolute times. Save v8 was
  unreleased, so its lap shape gained `sectors` with no version bump.

Measured over 25–40 seeds at Melbourne (automated tests):

| Check | Result |
|---|---|
| Rain at 10 minutes: early run vs waiting | Q1 position 9.8 vs 20.7 |
| New soft vs medium | 0.55 s quicker |
| Traffic loss per lap: find space vs push through | 0.024 s vs 0.049 s |
| Car with +6 part rating | Average P13.7 → P9.3, but not ahead in every seed |
| Fastest car vs the next fastest | Ahead in 33 of 40 seeds |
| Fastest car vs the slowest | Ahead in 39 of 40 seeds |
| Dry pole-to-last spread | About 2.4 s |

### Play-test 3 (presentation and session flow only)

- **Breaks:** new statuses `Q1_BREAK` and `Q2_BREAK`. After a part ends, the next part's first phase is NOT resolved
  until the player continues (`continueQualifying`), optionally re-planning the next part for their cars still
  running. The two-phase rule is unchanged. Headless and close paths continue on their own. The UI also stops at a
  break when none of the player's cars is in the next part (a presentation stop with no decision).
- **Results unchanged:** golden hashes of a headless season (seed 11) and of five recommended player sessions were
  recorded before this pass and are asserted in tests.
- **Live view:**
  - Inactive cars are dimmed, and the player's rows are loudest.
  - The drop zone is its own divider row, and rivals around it pulse while flying (off with reduced motion).
  - Rows slide on position changes; Focus mode; 4×.
  - "On pace for" uses only completed sectors, plus the driver's own best lap (else the fastest sectors plus this
    lap's average deficit) for the rest. It never peeks at the stored result.
- **Commentary and radio:** derived from stored laps at each beat; a test checks that nothing is said before it
  happens, and that radio only ever addresses the player's cars.
- **Pace:** active beats ~2.3 s and quiet beats ~0.75 s at 1×. Q1 reaches its call in about 44 s (measured in the
  browser).
- **Not built: event-driven calls (yellow/red flags, condition-change calls).** Making them real decisions would
  change results for the sessions where events happen, which conflicts with "results unchanged". Deferred pending
  the owner's call.

### Event-driven calls (owner-approved: conditions changes and yellow flags; red flags deferred)

- **Events** are rolled at the briefing from the new stream `qualifying-events` and stored in `session.events`. A
  part has at most one event, and that event becomes the part's one call, so the two-phase rule holds:
  - **RAIN/DRYING:** the call comes at the weather change minute, when it falls inside a part and leaves room for
    runs before and after.
  - **YELLOW:** otherwise a part may roll a yellow flag, with chance 0.06 + 0.15 × the circuit's safety-car tendency
    (provisional game weight; halved from 0.12 + 0.3 after the owner found yellows too frequent). The flag is out for one minute in one sector. The call comes one minute earlier, and
    the cars leaving then fly into it.
  - **No event:** the fallback checkpoint call.
- **Yellow outcomes**, from the new stream `qualifying-yellow`:
  - **Abort:** the lap ends in the flag's sector (`flag: 'ABORTED'`). The driver gets one more run two minutes
    later if the flag allows it and no other run is that close.
  - **Push through:** a 0.25–0.6 s lift in that sector (`YELLOW_LIFT`), with a 15% chance the lap is deleted
    (`DELETED`: time null, sectors kept).
  - **AI and recommendation:** a car with a safe time aborts; otherwise teams with aggression ≥ 0.55 push.
- **Results rule:** a session with no event is byte-identical to before. This is proven against 77 recorded
  per-session fingerprints (`fixtures/qualifying-pre-events.json`). Sessions with an event may differ.
- **Presentation:** the call card says why the call is now, and offers abort-or-push for affected cars. A yellow
  banner shows while the flag is out. Commentary and radio cover each event.
- **Red flags:** not built. Deferred to their own milestone.


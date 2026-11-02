# Core Gameplay Feel V2: Watch the Week

Playability pass on the existing Weekly Development Loop. No new development system, no qualifying.
Principle: **the player makes the decision, the team does the work, the player watches it succeed,
struggle or surprise them.** HQ = PLAY. Development hub = MANAGE.

## System owner and boundaries

| Concern | Owner | Notes |
|---|---|---|
| Weekly variation (normal / setback / breakthrough) | `simulation/developmentLoop/variation.ts` + `rules3Week` in `step.ts` | Runs inside the unchanged D0 `DEVELOPMENT_WEEK` instruction |
| Week story, completion, weekend handoff | `developmentLoop/weekStory.ts` (`summarizeWeek`) | Read model over before/after universes |
| Replay timeline | `developmentLoop/playback.ts` (`buildWeekTimeline`, `playbackFrame`) | Pure. Splits whole points across MON–FRI |
| HQ card | `developmentLoop/hqCard.ts` (`selectHqDevelopment`) | Read model |
| Presentation clock | `ui/hooks/useWeekPlayback.ts` | Reads the timeline only. Never touches the universe |
| Save contract | `persistence/*` v7 | v6 frozen, identity migration |

Simulate first, present second. Continue calls `advanceCampaignTo` once. The report and timeline are
then derived from the two universes, and the HQ replays them. Speed and Skip only scale presentation
time. `GameUniverse.currentDate` stays the only clock; MON–FRI is a presentation label for the week the
kernel credited at the Monday boundary.

## HQ DEVELOPMENT CARD

The HQ screen has a docked card (phone: full width above the nav; desktop: centred, 440px). It has four states:

- **IN DEVELOPMENT:** part, stage chip, overall progress bar, expected-ready date, expected fitting weekend, quality chip when not "as planned", next race, VIEW PROJECT.
- **ENGINEERING DECISION REQUIRED:** the pending domain event title and text, then REVIEW, which opens the hub.
- **PART READY:** the weekend it fits at, or "held back".
- **FACTORY IDLE:** "No active development project", then START PROJECT.

Decision outranks active work, and active work outranks ready parts.

## CONTINUE WEEK FLOW

The HUD action reads **CONTINUE WEEK** (to the next Monday) or **CONTINUE TO FP1** (when a weekend comes
first). Pressing it from any tab returns to HQ. While a replay runs, the button reads WORKING… and is
disabled, so a turn can't be processed twice by a double tap.

## WEEK PLAYBACK

- **1×:** 1.6 s per workday, so a five-day week takes 8 s (measured 8.1–8.6 s in the browser).
- **2×:** 0.85 s per workday, 4.25 s per week.
- **SKIP:** jumps straight to the summary.

Progress is tracked in 1× time, so switching speed mid-week continues from the same moment. With reduced
motion enabled the replay is skipped. The card shows the highlighted day, "Week of Mar 16 · results already
decided, now replaying", live bars, live ready/fit estimates and category counters.

## DEVELOPMENT BUBBLES

Each day's pieces rise from the department doing the work. They then travel and fade into the card's
position, and the card's counters and bar update at about 60% of the day.

Departments:

- **Aero & Design:** wind-tunnel research and aero design.
- **Simulator:** rig research.
- **Workshop:** chassis design.
- **Manufacturing:** manufacturing.

Categories are presentation names (RESEARCH / AERO / TECHNICAL / MANUFACTURING) for existing stage work,
where 10 points equal one average-team week. They are not currencies. Each stage segment is rounded to
whole points once, and the category totals and every bubble are built from those integers, so the pieces
always sum exactly to the authoritative result.

## NORMAL WEEK

Roughly even pieces in a gently varying daily rhythm. Most weeks have no popup. The summary stays quiet:
part name, points, "Progress 12% → 22%".

## SETBACKS / STALLS

| Kind | Odds (weak → strong department) | Work that week |
|---|---|---|
| SETBACK | 16% → 9% | 25–45% |
| STALL | 7% → 3% | 0 |

- **Setbacks:** the pieces shrink from the event day and an amber callout appears over the department
  (for example CORRELATION ISSUE).
- **Stalls:** no bubbles for that project, the bar stays still, and a warning such as CORRELATION PROBLEM,
  RIG FAILURE, DESIGN REWORK or PROTOTYPE FAILURE stays up for the rest of the week.
- **Quality hit:** a stall in Design or Manufacturing has a 40% chance of costing 4 quality points
  ("compromised").
- **Effect is real:** the time loss is a scale on that week's kernel stage work, so the expected-ready date
  and target weekend genuinely move.

## BREAKTHROUGHS

| Kind | Odds (weak → strong department) | Effect |
|---|---|---|
| BREAKTHROUGH | 6% → 11% | Either speed (work ×1.5–2.0, scaled by department quality) or, for research/design on a Performance project, quality (+4 points at a near-normal pace) |
| MAJOR | 1.5% → 3.5% | Work ×2.2–2.6 plus +6 quality in research/design |

- **Speed breakthroughs:** larger, gold-bordered bubbles from the event day.
- **Quality breakthroughs:** one accented bubble and the callout EXTRA PERFORMANCE FOUND.
- **Manufacturing breakthroughs:** speed only ("Production running ahead").

## QUALITY / PERFORMANCE IMPACT

Quality changes only touch the EXISTING `bonusPoints` field. The existing fitting path
(`expectedGain × (1 + effectiveBonus%)`, capped at ±25%) and the existing correlation outcome model
decide the real result. Weekly variation never pushes bonus points past the existing ±25 effective cap
(decisions still can), so every rules-3 project stays inside the frozen rules-2 bounds.

There is no presentation-side modifier, and a test scans the UI to prove it never writes a performance
field. The player sees words only: Promising / Better than expected / As planned / Compromised.

## STAFF / FACILITY EFFECT

Odds and breakthrough size use existing profile data only:

- **Research:** wind tunnel and CFD (or rig) facility level.
- **Design:** aero or vehicle-dynamics staff rating.
- **Manufacturing:** manufacturing facility level.

Stronger departments have fewer stalls and setbacks, more and larger breakthroughs, and less downside
variation. Normal speed differences between teams remain the existing `stageSpeed`. No individual worker
ratings were invented.

## PROJECT ETA CHANGES

The ready date is the existing read model (normal-rate projection from the authoritative state). The
replay switches from the old to the new estimate on the setback or breakthrough day, or at week end
otherwise. The summary states "Ready estimate May 18 → May 25 · now fits Monaco (was Montreal)".

## STAGE TRANSITIONS

When a day's work crosses a stage boundary, the piece splits across both departments. A green callout
such as RESEARCH COMPLETE · DESIGN STARTED appears over the department, and the card's stage label
changes. READY projects produce no work bubbles.

## DEVELOPMENT EVENTS

The existing nine decision events, refine and hold are unchanged; their vocabulary is frozen. New
decisions appear after the replay as ENGINEERING DECISION REQUIRED, with REVIEW as the primary action,
and the HQ card shows them too. Passive variation is never a modal decision.

## WEEK SUMMARY

WEEK COMPLETE · date, then per project:

- points chips (or NO PROGRESS);
- "Progress a% → b%";
- for a swing: SETBACK / BREAKTHROUGH · title, the reason and "Expected about +10, delivered +4", plus a
  quality sentence;
- an ETA/fit change line.

Completed parts, ready-and-waiting parts, decisions and at most a little paddock news follow, then CONTINUE.

## PART COMPLETION

"FLOOR COMPLETE":

- Expected: large improvement.
- Development quality: promising.
- A reason ("Strong research and design weeks").
- "The real result is only known once the part runs on the car."
- Fits at Monaco.

At the fitting weekend the existing outcome label is shown with an honest reason. A miss despite
promising factory work reads "the numbers did not fully carry over to the car", because the existing
model's misses come from correlation.

## RACE-WEEK TRANSITION

CONTINUE TO FP1 shows:

- RACE WEEKEND · MELBOURNE;
- car suitability (existing track-fit label);
- latest development (fitted parts and outcome labels, plus what changed on the car);
- ENTER WEEKEND.

The card also says "Practice, qualifying and the race are not simulated yet. This week's factory work is
reported on Monday." D0 credits a week at its Monday boundary, so a Monday → FP1 turn has no new work to
replay. Nothing about practice or qualifying was implemented.

Rival news stays restrained. At most one extra line about a rival's dramatic week appears, and only for
floors and wings in Design or Manufacturing, only on weeks without other paddock news.

## PLAY-TEST RESULTS

The play-test was run in the browser at 390×844 on a clean career, seed 1: one Balanced Floor, 20 turns.

| Turn | What happened |
|---|---|
| Mar 6 | Melbourne weekend handoff; no work yet |
| Mar 9 | Quality breakthrough: +12 research (expected +11), "the part should be better than first predicted" |
| Mar 16 | Quiet normal week, +11 |
| Mar 23 | CORRELATION ISSUE setback: expected +10, delivered +4 (bubbles dried up from Thursday, amber callout over Aero) |
| Apr 6 | Research complete → design started mid-week (bubble split Research/Aero) |
| Apr 27 | Design → Manufacture |
| May 11 | PRODUCTION PROBLEMS: +4 of 10. Ready estimate May 18 → May 25, **now fits Monaco (was Montreal)** |
| May 25 | FLOOR COMPLETE: large expected improvement, quality promising, fits at Monaco |
| Monaco | Fitted: BELOW EXPECTATION (correlation), with the car-change list |
| Next | Factory idle |

Answers to the ten questions (developer judgement in a browser, not the owner's):

1. Can I tell what we are building? Yes: the HQ card and Aero sign.
2. Can I tell who is working on it? Yes: bubbles originate per department.
3. Do the bubbles make productivity understandable? Mostly. Points per day are small (2–3); the counters help.
4. Does a normal week feel satisfying? It is pleasant but calm, by design.
5. Does a stalled week disappoint? Yes: an empty week and a static bar.
6. Does a breakthrough feel exciting? Moderately. Gold pieces and a callout, deliberately restrained.
7. Can a delay threaten a targeted race? Yes: Montreal was lost to Monaco.
8. Can a breakthrough improve more than the schedule? Yes: quality breakthroughs raise the existing bonus.
9. Can I understand why the part over- or underperformed? Yes, in words.
10. Do I want to press Continue again? The owner must answer this.

The first Continue of a career goes to Melbourne FP1 without work, which is a structural consequence of
Monday crediting.

## SAVE / VERSION IMPACT

Passive variation changes released outcomes, so it is **development rules 3** and **save v7**.

- `contracts/v7.json` is v6 content with a new identity.
- The v6 validation semantics are frozen in `validationV6.ts` and `validateDevelopmentRulesV6`.
- `driver-world-v6.json` is the retained v6 fixture (hash-tested).
- v6 → v7 changes the identity only. **Careers keep their rules (1 or 2)**, so released careers never gain
  variation retroactively. A golden continuation hash recorded on the released build proves an imported
  v6 rules-2 career plays out identically.
- Variation persists nothing new: it writes `progress` and the existing `bonusPoints`.
- The new RNG namespace is `development-week`; no existing stream was renamed or consumed.
- Older V1–V5 source validation still cold-loads without live registries.

## TEST RESULTS

- 397 tests in 21 suites, including 16 new in `watchTheWeek.test.ts`, covering:
  - Continue processes exactly one development week, and presentation never mutates it;
  - 1×, 2× and Skip give an identical final frame;
  - bubbles sum to the authoritative points;
  - a stall gives zero progress with a warning, and its ETA moves later;
  - speed-breakthrough display;
  - a quality breakthrough feeding the existing fitting path;
  - no UI performance writes;
  - stage transitions match the actual stages, and READY projects produce no bubbles;
  - pending events match the domain;
  - reload does not duplicate work, and the same seed with the same decisions is deterministic;
  - FP1 stop and weekend handoff;
  - odds and department-quality ordering;
  - the rules-2 kernel is untouched;
  - the v6 fixture and golden continuation;
  - v7 boundaries;
  - honest culmination reasons.
- TypeScript and the web export pass.
- The existing UI suite passes in light and dark, and the theme suite passes (390×844 and 1440×1000).

## SCREENSHOTS

Browser captures are in the session scratchpad (not committed): HQ idle/active, replay frames (Monday,
setback day, mid-week), summaries, weekend handoff, at 390×844 and 1440×1000, light and dark.

## OWNER PLAY-TEST CHANGES

- **Progress visibility:** pops come from the department's desks, one per point. Desks show "working" markers and
  signs show weekly tallies. Reduce Motion keeps the replay and drops only the movement.
- **Layout:** on wide screens the development card and the **REPORT CARD** summary dock top-right.
- **Decision stops:** a decision raised this week pauses the replay on the day the stage began (or Wednesday) and
  prompts with the existing options. The choice is the existing domain command. "Decide later" resumes; Skip stops at
  the decision.

## DEVELOPMENT DECISION INTERRUPT PASS

**Semantics checked:**
- Events are raised once per project stage, after that week's work.
- Rivals answer immediately by AI policy.
- Player events persist as pending (`choice: null`).
- The released rules default a pending event (first affordable option, `defaulted: true`) at the start of the next
  development week.
- `decideProjectEvent` answers exactly once.

**Design:**
- Gating the player's advancement through `continuePlayerTurn` / `advancePlayerDay` needs no persistent or rule
  change.
- The kernel default stays for headless or non-player paths.
- A choice cannot affect work inside the already-processed week without new event timing. That would need a
  versioned development-rule design and was NOT done. The replay pauses at the discovery point and says so honestly.

## KNOWN LIMITATIONS

- The first turn of a career (and any Monday → FP1 turn) has no replay, because work is credited at the
  Monday boundary.
- Bubble values are small (2–3 points per day); the owner may want fewer, larger pieces.
- Odds and magnitudes are a first pass. They are neutral on average (mean work multiplier ≈ 1.02), but
  multi-season balance has not been checked.
- Weekly swings are not stored, so history only shows their effects. The summary recomputes them from the
  same seeded draw.
- Browser review only: no native iPhone, FPS or accessibility audit.
- Rival news about rival swings is rumour-style and limited to headline parts.

## RECOMMENDATION

READY FOR OWNER PLAY-TEST

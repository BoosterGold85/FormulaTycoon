# Development status

## Milestone

**C0.1 — Single authoritative campaign clock: COMPLETE on `feature/milestone-c01-single-clock`.**
C0 `e6a479c` is pushed and merged/pushed to main at **`a057daf`**. Merged main passed 220 tests,
TypeScript and web export before C0.1 began. C0.1 is a separate local commit; not merged/pushed.
Owner approved actual calendar dates with new-career start Monday, March 2, 2026.

Audited B/B.1 `6b7e894` remains integrated through `88ef974`. Separate graphics branch
`feature/hq-worker-art-polish` / `1cfb07d` is preserved, unmerged and excluded. No dependencies
installed, PR opened or deployment performed. **Milestone C remains NOT STARTED.**

## POST-MILESTONE B AUDIT

Authoritative report: [POST-B-AUDIT](development-notes/POST-B-AUDIT.md), audit commit `6b7e894`.
The report remains unedited. H1/M4 were addressed by C0; C0.1 resolves M2 and only the necessary
option-deadline portion of M5. Canonical driver data, authored contract terms, grades, 11 teams,
22 starting seats and 43 people remain unchanged.

## COMPLETED

- One persisted current clock: `GameUniverse.currentDate`, a branded, validated plain Gregorian
  date. New careers start **2026-03-02**. Pure parsing/arithmetic/comparison/weekday/format/deadline
  helpers do not use device time, timezone or locale APIs.
- Persistent development and DriverWorld no longer store current season/week. Unchanged balanced
  development kernel receives ephemeral date-derived context; historical result/scouting dates,
  contract seasons and explicit option decision dates remain facts, not current-time owners.
- Safe monotonic date advancement processes every crossed day, weekly work and deadlines in
  order. Future scheduler joins this path; no event scheduler or player advance UX added.
- Exact old completed-week mapping: March 2 of `(2025 + seasonIndex)` plus `7 * week` days.
  Annual March 2 is a provisional compatibility phase, not the future race calendar/offseason.
  January/February still belong to the previous championship lifecycle. Week52 and next week0
  remain distinct; crossing the boundary requires the existing explicit standings/reset command.
- Explicit four canonical option deadlines: Ortez/Bearford **2026-12-07**; Harlton/Botten
  **2027-12-07**. Deadline inclusive; lapse the following date. All old weekly observations retain
  their behavior. One shared date helper handles status refresh, decisions and validation.
- External save schema **4**: validated V1/V2→frozen V3→V4, or validated V3→V4; V4 strict roundtrip.
  Earned development, pending work/history, HQ routes, IDs, contracts/options and scouting survive.
  Frozen V1/V2/V3 contracts and fixtures are byte-identical. Meaningful V4 fixture added.
- V4 content snapshot and explicit version-specific calendar policy are checked in. Persistence
  imports that policy explicitly; later live phase changes must not reinterpret released dates.
  Old incompatible TypeScript shapes are preserved in historical types. Trusted internal checkpoint
  is version2, distinct from the external validated import API.
- Existing HQ animation/New Day morning replay leaves career date/development untouched.
  HUD shows derived weekday/date in the existing layout. Driver queries use the root date.
- Required architecture/guardrail/system/loop/milestone docs and player manual updated.
  [C0.1 notes](development-notes/MILESTONE-C01.md) give semantics, commands, evidence and manifest.

## IN PROGRESS

No further implementation at handoff. Review/integrate C0.1 before beginning Milestone C.
Do not merge the graphics branch, invent a calendar registry or continue gameplay work here.

## TESTED

- Merged main `a057daf`: `npm test -- --runInBand` **PASS220/eight suites**;
  `npm run typecheck` PASS; `EXPO_NO_TELEMETRY=1 npm run build:web` PASS; main pushed.
- C0.1: `npm test -- --runInBand` **PASS261/ten suites**; `npm run typecheck` PASS;
  `EXPO_NO_TELEMETRY=1 npm run build:web` PASS. No failed/skipped cases in final suites.
- Date syntax/invalid dates, Gregorian/leap arithmetic, comparison, elapsed days, inclusive
  deadlines, weekday/format and subprocess timezone checks (Chicago, London, Tokyo, Sydney,
  Turkish locale); root-only serialization, backward rejection and same-date identity.
- Daily versus jumped advancement equality, unchanged development kernel parity, distinct
  week52/next-week0, explicit rollover and contract expiry; HQ frame/reset separation.
- Frozen V1/V2/V3→V4 source/metadata/state preservation; meaningful V4 fixture reload, remaining
  season and next-season 12-week deterministic continuation versus frozen pre-calendar oracle;
  malformed/skewed old clocks and future version5 rejected. Historical hash checks PASS.
- All four options before/on/after their dates, exercise retention, foreign ownership and future
  booking conflict; existing canonical contracts/scouting/grades/car-fit/HQ/save regressions pass.
- Chromium **390×844** via `node scripts/check-milestone-c01.cjs`: HQ/card/department/New Day,
  Monday/Mar2 display and date unchanged after replay, Drivers22, Prospects10, reserves11, TEAM2,
  details/six grades/options/deals, scouting retention/navigation. Zero page errors or horizontal
  overflow. Logs and ten screenshots under `/workspace/artifacts/milestone-c01/`.
- `git diff --check` PASS. Existing color-variable/npm notices are nonblocking. No installs.

## NOT VERIFIED

- Native iPhone/Expo Go/Safari, hardware FPS/memory/battery and safe areas.
- Live Cloudflare deployment; local browser/export is not remote runtime proof.
- Durable device saves/restart recovery: memory adapter remains volatile; no save/import UI.
- Full 2026 event calendar, smart advancement controls, actual championship phase/offseason,
  tracks/races, multi-decade balance/performance: deliberately outside C0.1.
- Owner-controlled option button in live Wellington UI: starting pair has no option. Domain
  decisions are tested; browser verifies foreign option terms/actions and displays.

## KNOWN ISSUES

- Annual March2 phase policy is provisional. Future real calendar/phase semantics require explicit
  content/save compatibility review. 2027 week40 is Tuesday December7 under this non-ISO mapping.
- Source omits option deadline/pay: prototype timing/equal salary preserved as explicit dates;
  existing $0.35M starter bonus remains not source-supplied. No payroll/bonus payouts.
- Imported B careers keep earned abilities/generic deals/decisions; canonical terms apply to
  new games. Source snapshots are historical references, not lifetime frozen abilities.
- Fixed cohorts, free immediate scouting, no offseason recruitment, vacancies after expiry and
  no growth/retirement/race effects remain. Car fit is a qualitative proxy; reserves can show an
  affiliated car (L9), without claiming a race seat/effect.
- Next-event HUD is still a placeholder. HQ NEW DAY is a replay, not the future campaign command.

## TECHNICAL DEBT / ARCHITECTURAL RISK

| Finding | Status and due gate |
|---|---|
| H1 | Addressed by C0: frozen content/rules/migration payloads and V3 fixture; V4 adds its own snapshot/policy/fixture |
| M1 | Deferred: seeded imperfect scouting estimator before scouting expansion |
| M2 | Addressed by C0.1: root date, clock-free subsystem state, validated V4 migration |
| M3 | Deferred: derive team control from playerTeamId before chooser/career setup |
| M4 | Addressed by C0: domain driver/car-fit selector and dead fit removal |
| M5 | Date deadline helper consolidated; broader overlap/contract duplication deferred until contracts/offseason expansion |
| M6 | Deferred: current contract-role grouping before multi-season/offseason |
| M7 | Deferred: measure/archive history (~41KB/season in audit) by Championship/History G |
| M8 | Deferred: originality/source rights review before public/commercial release; identities/data unchanged |

L1–L10 remain scheduled low-priority work. Durable storage/backups/recovery, closed fixed driver
schema, balancing and real-device profiling remain debt. Do not regenerate historical contracts
from live data. Calendar content must replace provisional policy deliberately, preserve historical
validation/mapping and retain explicit option dates. Daily interval processing is intentionally
simple; measure before optimizing for multi-decade/event-heavy careers.

## NEXT MILESTONE

**READY FOR MILESTONE C after review/integration of C0.1.** Clock/migration blocker is resolved.
C should introduce owner-approved event-calendar/phase content through the existing root date,
then its planned track work. Calendar source verification is a C content task; no full race
calendar, tracks, races or offseason engine were implemented or verified here. **STOP.**

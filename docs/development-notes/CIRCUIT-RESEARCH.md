# Circuit profile research ledger — Milestone C

## Status and provenance

**BLOCKED / NOT COMPLETE.** The owner supplied the exact playable revised schedule and several
technical design identities. Those requirements were used. This is not independent verification
of the current official calendar, the claimed Sepang replacement or each technical profile.

On October 29, 2026, the actual HTTPS request to
`https://www.formula1.com/en/racing/2026` was denied by the managed cloud proxy (CONNECT403).
The active network policy permits GitHub/package hosts, not the requested research sites.
A network-only draft adding Formula1/FIA/Pirelli/Madrid/Sepang domains was successfully saved;
the environment needs review/save/publication before research can proceed. No bypass was used.
The request/error is recorded under `/workspace/artifacts/milestone-c/research-access.log`.

**No external technical page has been read in this pass.** The links below are research targets,
not citations supporting completed research. Do not present them as accessed evidence. Before
merge, read authoritative material for every venue, record actual URLs/access results and adjust
any unsupported assumptions. Madrid particularly needs its published layout/specification checked.

## Facts versus Formula Tycoon design values

- Calendar dates, six Sprint markers and venue inclusion are exact **owner-approved game content**.
  They have not been certified against live FIA/Formula1 publications here.
- Circuit names/countries/layout categories are initial geographic descriptions. Approximate
  Mexico City altitude **2200m** is an unverified working estimate, not measured simulation data.
  Other altitudes are null (unknown), never fabricated sea-level measurements.
- All eleven demand numbers are normalized **Formula Tycoon game weights**, not official ratings,
  telemetry, copied game tables or measured physical quantities.
- Future metadata (overtaking, qualifying, safety-car tendency, tyre/kerb severity, evolution and
  rain tendency) is broad game-design preparation. Numbers are not calibrated probabilities.
  Nothing currently rolls weather/incidents or applies altitude physics.
- New Madrid uses conservative balanced demands and explicit PROVISIONAL status; no detailed
  layout statistics or precisely modeled corner speeds are asserted.

## Per-circuit rationale and verification queue

For each geographic Formula1 page below, verify the live circuit information and follow technical
features rather than copying branded race names, graphics or another game's ratings. Supplement
with FIA circuit documentation, Pirelli technical previews and official circuit material.

| Circuit | Major current game demands / rationale | Basis in this pass | Candidate geographic reference (not accessed) |
|---|---|---|---|
| Melbourne | Balanced aero and fast direction changes, traction from slower exits | Initial design assumption | https://www.formula1.com/en/racing/2026/australia |
| Shanghai | Long-straight/braking contrast with loaded turns and traction | Initial design assumption | https://www.formula1.com/en/racing/2026/china |
| Suzuka | Very high high-speed aero/efficiency, medium-speed and tyre relevance | Owner brief | https://www.formula1.com/en/racing/2026/japan |
| Miami | Straights, tight sections, braking/traction, cooling | Initial design assumption | https://www.formula1.com/en/racing/2026/miami |
| Montreal | Stop-start chicanes, braking/traction and kerb compliance | Initial design assumption | https://www.formula1.com/en/racing/2026/canada |
| Monaco | Low speed, mechanical grip/traction and qualifying; low straight-line demand | Owner brief | https://www.formula1.com/en/racing/2026/monaco |
| Barcelona-Catalunya | Loaded corners, medium/high-speed aero, tyre preservation | Initial design assumption | https://www.formula1.com/en/racing/2026/barcelona-catalunya |
| Spielberg | Heavy stops, power-on exits, efficient straight-line performance | Initial design assumption | https://www.formula1.com/en/racing/2026/austria |
| Silverstone | Very high fast-aero/efficiency and loaded-tyre demand | Owner brief | https://www.formula1.com/en/racing/2026/great-britain |
| Spa-Francorchamps | Straight-line plus high-speed aero, efficiency tradeoff | Owner brief | https://www.formula1.com/en/racing/2026/belgium |
| Budapest | Low/medium-speed grip, traction and cooling | Owner brief / initial design | https://www.formula1.com/en/racing/2026/hungary |
| Zandvoort | Linked/banked corners, aero and tyre loading | Initial design assumption | https://www.formula1.com/en/racing/2026/netherlands |
| Monza | Extremely high straight-line/low-drag and braking; less sustained aero demand | Owner brief | https://www.formula1.com/en/racing/2026/italy |
| Madrid | Balanced conservative demands pending actual layout/specification review | Explicit uncertainty in owner brief | https://www.madring.com/ |
| Baku | Very high straight-line demand combined with slow technical corners/heavy stops | Owner brief | https://www.formula1.com/en/racing/2026/azerbaijan |
| Sepang | Medium/high-speed aero, traction, tyres and tropical cooling/rain metadata | Owner brief | https://www.sepangcircuit.com/ |
| Singapore | Slow/medium-speed, braking, traction, mechanical grip, cooling | Owner brief | https://www.formula1.com/en/racing/2026/singapore |
| Austin | Fast direction changes plus slower exits and long straight | Initial design assumption | https://www.formula1.com/en/racing/2026/united-states |
| Mexico City | Altitude metadata, straight/slow-stadium contrast, cooling | Owner brief / unverified altitude estimate | https://www.formula1.com/en/racing/2026/mexico |
| São Paulo | Uphill acceleration and technical middle sector, balanced efficiency | Initial design assumption | https://www.formula1.com/en/racing/2026/brazil |
| Las Vegas | Very high straight-line/braking, traction; little sustained high-speed aero | Owner brief | https://www.formula1.com/en/racing/2026/las-vegas |
| Lusail | Repeated fast corners, aero/tyres and cooling | Owner brief / initial design | https://www.formula1.com/en/racing/2026/qatar |
| Yas Marina | Long straights, braking zones, traction and mixed-speed corners | Initial design assumption | https://www.formula1.com/en/racing/2026/abu-dhabi |

Cross-circuit technical-source targets: https://press.pirelli.com/ and https://www.fia.com/.
URLs/layout details must be verified when access becomes available; these targets may redirect
or have changed paths. Reconcile real-world facts with the owner's explicit fictional playable
schedule; do not silently substitute a different calendar.

## Release gate

Implementation/tests can be reviewed now. Research remains a **merge blocker** for declaring
Milestone C complete, since the task explicitly requires reliable technical references for all23
venues. Do not start qualifying while this remains unresolved. No source-access success or
research completion is implied by passing game-data tests.

# Formula Tycoon — Graphic Design Bible

Permanent canonical visual source of truth, established October 30, 2026.
This governs presentation only. It authorizes no gameplay, balance, simulation, persistence,
economy or campaign-time changes. Read alongside [Brand Identity](BRAND_IDENTITY.md) and
[Development Guardrails](DEVELOPMENT_GUARDRAILS.md). Owner-approved changes to permanent visual
rules must update this document in the same change; individual milestones cannot override it.

## Core direction

A clean, slightly playful miniature tycoon/management game. The HQ is the strongest implemented
benchmark. **GAME WORLD + INFORMATION**, with readable silhouettes, restrained information density,
strong fictional identities and reusable scalable 2D/component artwork. Not photorealism, a
corporate SaaS dashboard or a spreadsheet with racing decoration.

Use broad shapes, limited detail, restrained shading and consistent upper-left lighting with
lower-right grounding shadows. Small artwork must read by silhouette before detail. The supplied
orange/white/charcoal car reference supports this miniature, broad-color, gently faceted language;
it is a direction reference, not a production livery to reproduce. The current car motif remains
symbolic; it is not claimed to match that reference's fidelity. Do not introduce heavy 3D rendering.

Avoid giant stat panels, nested rounded cards, tiny text, excessive sponsor detail, visual noise,
one-off art languages, elaborate gradients and duplicate baked assets when recoloring suffices.

## Default theme: dark racing shell, warm light canvas

Owner-approved permanent direction, October 30, 2026:
**DARK RACING SHELL + WARM LIGHT CONTENT CANVAS + STRONG ACCENT COLORS.**

Light is the default when no valid local preference exists. Keep dark navy top navigation and
wide-screen side navigation, Formula Tycoon branding and strong red primary interactions.
Mobile uses the same dark shell with bottom navigation. Main management content uses warm cream /
off-white canvas, soft cream cards, dark navy text, subtle neutral borders and soft shadows.
Avoid stark white everywhere and generic business-software styling. The supplied Drivers/Race
concept establishes this surface/shell direction; it does not authorize unimplemented navigation,
new gameplay or an art-production milestone.

One shared theme contract lives in `ui/design/tokens.ts`; `ui/theme.tsx` owns presentation selection.
Semantic tokens include background, surface, surfaceElevated, textPrimary, textSecondary, border,
accent, accentMuted, success, warning, danger, navBackground, navText and shadow. Existing short
names alias these values rather than authoring a second palette. Components consume runtime tokens
through shared hooks/style factories. No duplicated LightScreen/DarkScreen implementations and
no screen-specific cream/red/navy palette tables.

This applies to Drivers/dossier, Race/calendar/event detail, Team/car/development/organization,
History and all future Staff, Standings, Finances, Settings, facility and race-weekend management
surfaces. Future systems remain unimplemented; do not create fake screens to demonstrate a theme.
HQ retains its physical illustrated world and environmental materials. Navigation and overlays
follow the active theme; never flatten the world into a light dashboard.

Dark mode is a real alternate palette of the SAME layout, hierarchy, artwork and interactions.
The top-right DARK/LIGHT action changes presentation without remounting the campaign. Web stores
only the appearance preference under `formula-tycoon.theme`, outside gameplay saves. Valid local
dark selection wins over the default; invalid or denied storage falls back safely to light.
When storage is denied, selection still works for the mounted session. Native persistent preference
storage is not implemented; native uses light by default and session-local selection.

Canonical team palettes remain identical in both themes. Portrait backing/grounding may use
neutral theme art tokens; do not surround every illustration with a dark rectangle. A text-only
contrast correction may move team-colored labels toward the active theme's readable text color,
without changing canonical palettes, helmets, suits, cars or team IDs. Intrinsic materials such
as dark tyres, visor charcoal, workshop hardware and trophy gold are independent of UI status ink.

Validate both themes at390×844 and1440×1000: text, grades, form/status, contracts, scouting ranges,
car fit, Sprint/weekend markers, navigation selection, buttons/disclosures and artwork. Semantic
text/button/status pairs and team labels target at least4.5:1 contrast on their rendered surfaces.
Contrast checks and browser screenshots do not establish native accessibility/performance compliance.

## Interaction and information hierarchy

**GLANCE → UNDERSTAND → TAP → INVESTIGATE → ACT.**
First level: decision information. Second level: management detail. Deeper: analytical detail.
Artwork helps a player identify a person, object or action; it does not compete with the decision.
Preserve uncertainty, reachable disclosures, meaningful labels and minimum 44px action targets.
Do not add fake money, ratings, progress, projects or results to fill a composition.

## One fictional world

Use stable canonical team IDs and original brands. No real logos, sponsors, exact real liveries,
driver likenesses, championship branding or trademarked visual identities. Inspiration is not
permission to copy. Do not bake team names/sponsor marks into neutral art templates. Color alone
must not carry essential meaning: pair it with readable names, labels and silhouettes.

## Shared rendering language

- UI: existing shared tokens/components under `src/ui/design`; open typography/dividers, focused
  hero objects and purposeful emphasis. Default to a dark racing shell surrounding warm light
  management surfaces; dark mode uses the same components with alternate semantic tokens.
- People: miniature workers in the HQ; anonymous helmeted shoulders-up portraits in personnel UI.
  Roles use poses, silhouette, restrained accessories and readable articulated limbs. No detailed anatomy.
- Cars: original open-wheel silhouette, broad livery regions, dark tyres/visor and restrained highlights.
  Reuse team palettes; no real sponsor or exact livery layouts. Detail must survive phone scale.
- Facilities: clean isometric volumes, consistent scene projection, lighting and scale with the HQ.
  Future facility upgrades must follow the separate simulation-and-visible-evolution guardrail.
- Icons: the shared icon language, clear labels and consistent stroke/weight; avoid mixed emoji/real logos.
- Animation: communicate actual worker/action state; preserve routes, timing and assignment owners.
  No decoration that implies unimplemented work. Future aero/technical bubbles, manufacturing/research
  effects, parts and department animations must follow this language, not establish another one.
- Race presentation: readable stylized circuit/vehicle graphics; illustrations are not surveyed maps
  or performance data. Qualifying/race presentation requires its own approved gameplay milestone.

## Permanent driver portrait architecture

**ART TEMPLATE + TEAM PALETTE = DRIVER CARD IMAGE.** Never one unique image per driver.
One shoulders-up anonymous helmeted driver template serves roster and dossier, scaled at render time.
For V1, all drivers share the same geometry. Do not build a portrait-generation/variant system now.
Any future cheap variants must retain exactly the same color-token interface.

Implementation: `src/ui/art/DriverPortrait.tsx`, a resolution-independent React Native View-shape
component using only existing React/React Native. This is the native-compatible vector equivalent;
no DOM-only SVG, new graphics dependency, runtime PNG/JPEG generation or per-transfer asset baking.
Broad helmet, dark visor, collar and separated shoulder panels read at 80–120px card widths; the
same template scales to the dossier. No face, initials, tiny graphics, fine pinstripes or sponsor marks.

Named independently colored regions:

| Region | Input |
| --- | --- |
| Helmet Primary | primary |
| Helmet Secondary | secondary |
| Helmet Accent | accent |
| Visor | fixed `#20222A` |
| Suit Primary | primary |
| Suit Secondary | secondary |
| Suit Accent | accent |
| Background | neutral presentation background |

Keep restrained upper-left highlights/lower-right shade separate from the base color regions.
The generic `DriverPortrait` receives colors only, never team IDs, driver state or simulation data.

## Authoritative team visual palette

`src/game/brandRegistry.ts` owns `team.colors = {primary, secondary, accent}` for the eleven
fictional organizations. Existing `team.color` is a compatibility alias of `colors.primary`, not
an independently authored color. Do not scatter team-specific palette tables around screens.
Do not persist palette copies, `driver.helmetColor` or `driver.suitColor`.

Actual flow: current employment contract → existing `driverView(...).teamId` → canonical brand
colors → presentation fallback → portrait. The world has no authoritative `driver.teamId` field;
use the current employment read model, not familiarity, affiliations or historical team records.
`TeamDriverPortrait` is the stateless adapter shared by roster, dossier and compact Team entries.
Transfers/re-signing update current employment; the next render resolves the new palette without
an asset replacement, migration, cache invalidation or manually rewriting colors.
Unassigned/expired drivers use one neutral presentation palette, not a former team's colors.

## Deterministic contrast fallbacks

`src/ui/art/portraitPalette.ts` resolves presentation only. Missing accent uses white (`#FFFFFF`).
For six-digit registry RGB colors, calculate WCAG relative luminance and contrast. If primary and
secondary have contrast below 1.8:1, use whichever of white or visor charcoal (`#20222A`) gives
higher contrast against primary. The threshold separates broad art regions; it is not a text
accessibility certification. Canonical colors are never changed by this fallback. Fixed charcoal
visor has a thin neutral edge so it remains visible against dark shells. Background is independently
neutral. Do not generate elaborate color schemes or pretend all accent combinations pass text contrast.

## Acceptance and evidence

Test identical geometry with orange/black/white, red/black/white and silver/teal/black palettes.
Verify each helmet/suit primary, secondary and accent region, fixed visor and unchanged structure.
Test the same mounted portrait after current employment changes teams; no stale color or persisted
art state. Cover unassigned drivers, absent accent, near-identical dark/light secondary colors.
Review actual 80/100/120px renders plus roster/dossier at 390×844, then existing desktop/mobile
navigation/HQ checks, full tests, typecheck and web export. Browser review does not prove native
fonts, accessibility, FPS or performance; record those limits honestly.

## Required future milestone prompt

Every milestone materially touching presentation, including primarily gameplay milestones, must
explicitly contain this instruction:

> Before making visual changes, read and follow `docs/GRAPHIC_DESIGN_BIBLE.md`. It is the canonical visual source of truth. Preserve its reusable-art, palette, fictional-brand and mobile-readability rules unless the project owner explicitly changes them.

**ONE GAME. ONE VISUAL LANGUAGE.**

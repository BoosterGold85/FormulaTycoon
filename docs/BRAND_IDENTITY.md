# Fictional brand and identity policy

Permanent product policy, added during foundation hardening A.1. This is content architecture,
not new team/sponsor gameplay or a legal clearance of proposed names.

Formula Tycoon operates in its own fictional motorsport universe. Default content must not use
real team or sponsor names, logos, exact liveries, commercial marks, championship branding or
manufacturer identities. Simple one-letter substitutions are not the primary naming method.
Working names below are user-supplied proposals; review originality before finalizing release
content. Create original logos, typography, uniforms, liveries and histories; never reproduce the
inspiration's crest, wordmark, sponsor layout or car graphics.

## Canonical registry contract

The canonical team registry is now `src/game/brandRegistry.ts` (equivalent to
`src/data/brandRegistry` under the existing plain-data convention). Teams, sponsors, power-unit
and tyre manufacturers, media, broadcasters, equipment suppliers, series, awards and commercial
partners reference its stable IDs. Resolve display names/art from it in selectors/presentation,
not by scattering name strings through simulation. History and saves retain entity IDs, not
only display names, so rebranding never changes historical identity.

The runtime registry was not introduced in A.1; B now implements the canonical eleven-team grid. The legacy ten-team definition remains frozen for validation/regression. B explicitly maps its IDs,
preserves earned development state, initializes Meridian, extends allowances to eleven entries and
adds schema v1 -> v2 migration. See development-notes/MILESTONE-B.md for mapping/assumptions. Do not infer a one-to-one mapping from colors or inspiration.
Archived upgrade descriptions/names are historical snapshots, not canonical foreign keys.

## Canonical grid and the roster pack

Display branding (team and driver names, colours, car numbers, nationality labels, archetypes,
bios and helmet patterns) lives in one data file, the default roster pack
`src/game/roster/defaultRoster.json`, documented in `docs/ROSTER_PACKS.md`. Players may import
their own packs; packs map onto the stable IDs below by grid slot. The stable IDs are opaque
tokens kept for save and seed compatibility: several are historical working names and must never
be shown as display names. Organization traits (prestige, patience, preferences, risk) remain
simulation content in `brandRegistry.ts`, not pack data.

| Slot | Stable ID | Default display name | Base | Identity | Primary / secondary / accent |
|---|---|---|---|---|---|
| 1 | `team.mclarin` | Halcyon Works | Gothenburg, SWE | Engineering-led front-runner, cold and precise | `#5FB3D9` / `#2B2F36` / `#FFFFFF` |
| 2 | `team.ferano` | Solenne Racing | Lyon, FRA | Old money, elegant, under pressure to win | `#6B2D5C` / `#E8D9B0` / `#111111` |
| 3 | `team.mercurion` | Kestrel GP | Silverstone, GBR | Privateer giant-killer, sharp strategy | `#0F6B5A` / `#EDE6D6` / `#C7773B` |
| 4 | `team.vortex` | Moravia Motorsport | Brno, CZE | Factory squad, huge budget, slow politics | `#14213D` / `#F2A900` / `#FFFFFF` |
| 5 | `team.arden` | Taranis Racing | Turin area, ITA | Tech-start-up energy, aero risks | `#5A6470` / `#B6E23A` / `#0B0B0B` |
| 6 | `team.wellington` | Ardent Dynamics | Austin, USA | New American entrant, flashy, building up | `#0A0F1F` / `#FF5A5F` / `#C9CED6` |
| 7 | `team.alpinor` | Nordhavn Racing | Copenhagen, DEN | Steady midfielder, driver academy | `#1D4E89` / `#D9C7A1` / `#D7263D` |
| 8 | `team.hartman` | Corvo Racing | Valencia, ESP | Scrappy, loud, punches above budget | `#1A1A1A` / `#FFD23F` / `#8A8D91` |
| 9 | `team.veloce` | Altair Engineering | Munich area, GER | Customer engines, technical partner team | `#F4F4F2` / `#6A4CC4` / `#333333` |
| 10 | `team.auden` | Pacifica Racing | Auckland, NZL | Underfunded backmarker, loyal fanbase | `#00594F` / `#9FD3E6` / `#FFFFFF` |
| 11 | `team.caldera` | Meridian Speed | Dubai, UAE | Rich new owners, impatient for results | `#C97B84` / `#8C6A3F` / `#F6EFE2` |

Slot 6 (Ardent Dynamics) is the player's organization in a new career. Never pair a name with a
real team's full livery pattern (stripes, logos, wing shapes). Packs shipped with the game must be
original and fictional; the game cannot vet imported packs and does not try to.

These organizations must grow their own histories, reputation, finances, facilities, development
and driver philosophies, commercial strength, risk tolerance, fan bases and personalities. AI
policy should read organization characteristics, not branch on a team name or award a flat bonus.
Inspiration is a briefing aid, not in-game branding. Driver generation remains unimplemented.

## Fictional sponsors

All default commercial partners are fictional. Do not populate the game with real beverage,
energy, technology, banking, luxury, airline, telecom or cloud/software brands.
Candidate pools (not approved/implemented registry entries):

| Industry | Candidate names |
|---|---|
| Energy drink | VOLT, RUSH ENERGY, APEX FUEL, IGNITION |
| Oil/energy | PETRION, SOLARA ENERGY, NORTHSTAR FUELS, VELOCITY LUBRICANTS |
| Technology | NEXORA, QUANTIX, ORBITAL SYSTEMS, ZENITH COMPUTING |
| Finance | SUMMIT BANK, NEXUS FINANCIAL, CROWN CAPITAL, MERIDIAN PAY |
| Watches/luxury | VALMONT, CHRONARA, ASTERON, MONARCH TIME |
| Airlines | SKYCREST, AEROVA, GLOBALJET, ALTITUDE AIR |
| Beer/beverage | HARBOUR BREWING, NORTHLINE, CROWN LAGER, GRANDSTAND BREW CO. |
| Telecom | VECTOR MOBILE, NEXCOM, PULSE NETWORKS, ORBIT TELECOM |
| Cloud/software | STRATUS CLOUD, NEXUS SYSTEMS, QUANTUMSTACK, VANTA DIGITAL |

Future sponsor definitions/state need ID/name/industry/brand tier, reputation/budget, preferred
markets, performance expectations, team prestige requirement, driver-popularity preference,
contract length/base payment/bonuses, activation requirements, risk tolerance and personality.
Separate brand definition, changing company resources and signed deal obligations. Later seeded
brand generation combines industry + personality + market + budget tier, with duplicate/near-copy
review. Do not implement sponsor deals, generation, finances or marketing in A.1.

## Tracks and locations

Geography is separate from commercial event identity. Las Vegas, Nevada can be a location and
track-profile ID with high speed/braking importance, low downforce and low rain probability,
without official championship/event branding. Track profiles remain data-driven. A rename or
commercial agreement must not require a race-engine rewrite or change saved circuit IDs.

The product should make players recognize an original racing organization, not merely recognize
an altered real-world wordmark. Exact fictional grid and candidate brands can evolve deliberately.

## Permanent visual presentation

[GRAPHIC_DESIGN_BIBLE.md](GRAPHIC_DESIGN_BIBLE.md) is the canonical visual source of truth.
The existing canonical registry now exposes `colors.primary`, `colors.secondary`, `colors.accent`.
All existing primary colors and organization/gameplay characteristics are unchanged; `color` remains
an alias of the authored primary for existing consumers. Secondary/accent tokens are presentation
metadata, not saved driver attributes. No competing team-palette database is introduced.
Current employment resolves portraits through the existing grade-only driver read model, including
reserve and unassigned cases. One anonymous shoulders-up template serves roster/dossier/Team.

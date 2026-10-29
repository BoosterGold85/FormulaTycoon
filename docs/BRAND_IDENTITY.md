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

The single future content registry belongs at `src/game/brandRegistry` (equivalent to
`src/data/brandRegistry` under the existing plain-data convention). Teams, sponsors, power-unit
and tyre manufacturers, media, broadcasters, equipment suppliers, series, awards and commercial
partners reference its stable IDs. Resolve display names/art from it in selectors/presentation,
not by scattering name strings through simulation. History and saves retain entity IDs, not
only display names, so rebranding never changes historical identity.

The runtime registry is NOT introduced in A.1. Existing ten-team development IDs and ratings
remain unchanged. The eleven-team working grid is a later content release requiring an explicit
legacy-ID mapping, added-team initialization, aero-allowance/standings review, definition-version
change and save migration fixtures. Do not infer a one-to-one mapping from colors or inspiration.
Archived upgrade descriptions/names are historical snapshots, not canonical foreign keys.

## Working grid (proposed identities, not the current runtime roster)

| Proposed stable ID | Display name | Organization/archetype | Visual direction |
|---|---|---|---|
| `team.mclarin` | MCLARIN RACING | Modern British engineering; innovation and commercial strength | Bright warm/orange |
| `team.ferano` | FERANO CORSE | Historic Italian powerhouse; oldest/prestigious, very high expectations | Original red identity |
| `team.mercurion` | MERCURION GP | Large technical organization; excellent infrastructure and resources | Silver/charcoal |
| `team.vortex` | VORTEX RACING | Aggressive performance culture; driver pipeline, high risk | Dark navy |
| `team.arden` | ARDEN MOTORSPORT | British luxury/performance; strong financial backing | Deep green |
| `team.wellington` | WELLINGTON RACING | Historic British independent; former dynasty rebuilding | Original blue identity |
| `team.alpinor` | ALPINOR GP | French manufacturer-style; engineering strength, inconsistent execution | Distinct blue identity |
| `team.hartman` | HARTMAN RACING | American independent; practical, cost-conscious efficiency | Original workmanlike identity |
| `team.veloce` | VELOCE RACING | Energetic young-driver organization; scouting and prospect focus | Original energetic identity |
| `team.auden` | AUDEN MOTORSPORT | European manufacturer entrant; modern facilities, long-term investment | Original modern identity |
| `team.caldera` | CALDERA RACING | American manufacturer entrant; commercially ambitious, marketing resources | Original commercial identity |

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

# Drop-in art

The Team screen looks for these files. Add a file with the right name and it appears; no code change.
Until a file exists, its slot shows a dashed placeholder describing the image needed and naming the file it
expects. The game draws no stand-in art.

| Folder | File name | Size | Notes |
|---|---|---|---|
| `cars/` | `car-<team short name>.png` | 1600 × 1000 | Transparent background, no floor or shadow. |
| `helmets/` | `helmet-<first>-<last>.png` | 1024 × 1024 | Square. No race number (the game adds the badge). |
| `factory/` | `factory-idle.png`, optional `factory-active.png` | 512 × 512 | Transparent. |
| `tracks/` | `track-<circuit>.svg` | 600 × 400 | White line on transparent. |

Names are lowercase with accents dropped and spaces as hyphens:

- **Cars** use the team's short name from the active roster pack: `car-halcyon.png`, `car-solenne.png`,
  `car-kestrel.png`, `car-moravia.png`, `car-taranis.png`, `car-ardent.png`, `car-nordhavn.png`, `car-corvo.png`,
  `car-altair.png`, `car-pacifica.png`, `car-meridian.png`.
- **Helmets** use the driver's shown name, e.g. `helmet-freya-halvorsen.png`, `helmet-elodie-marchetti.png`.
  If a roster pack renames a driver, the expected file name follows the new name.
- **Tracks** use the circuit ID: `track-melbourne.svg`, `track-shanghai.svg`, `track-suzuka.svg`, `track-miami.svg`,
  `track-montreal.svg`, `track-monaco.svg`, `track-barcelona.svg`, `track-spielberg.svg`, `track-silverstone.svg`,
  `track-spa.svg`, `track-budapest.svg`, `track-zandvoort.svg`, `track-monza.svg`, `track-madrid.svg`,
  `track-baku.svg`, `track-sepang.svg`, `track-singapore.svg`, `track-austin.svg`, `track-mexico-city.svg`,
  `track-sao-paulo.svg`, `track-las-vegas.svg`, `track-lusail.svg`, `track-yas-marina.svg`.

Web builds serve this folder at `/assets/`. Native builds do not yet load dropped-in files (they show the
placeholders); that needs a generated asset list.

No real team or driver names, logos, sponsor marks, helmet designs or liveries in any file.

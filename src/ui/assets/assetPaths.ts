/**
 * Drop-in art: the game looks for these files under public/assets/ (served at /assets/ on web).
 * Names are predictable so artwork can be added with no code change. See public/assets/README.md.
 * Each slot carries a description of the commissioned image, shown in its placeholder until the file exists.
 * The game draws no stand-in art of its own.
 */
export const slug = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const ASSET_ROOT = '/assets';
/** short: a few words for small slots; description: the full brief (also in the accessibility label). */
export type AssetSpec = {src: string; file: string; title: string; short: string; description: string; size: string};
type Colors = {primary: string; secondary: string; accent: string};
const spec = (folder: string, file: string, title: string, short: string, description: string, size: string): AssetSpec =>
  ({src: `${ASSET_ROOT}/${folder}/${file}`, file: `${folder}/${file}`, title, short, description, size});
const palette = (c: Colors) => `${c.primary} / ${c.secondary} / ${c.accent}`;

/** Team car from the team's short name in the active roster pack, e.g. car-ardent.png. */
export const carAsset = (team: {name: string; shortName: string; colors: Colors}) => spec('cars', `car-${slug(team.shortName)}.png`,
  `${team.name} car`, 'Isometric car, transparent', `Isometric three-quarter view from above, ${team.name} livery (${palette(team.colors)}), bold diagonal sweep. Transparent background, no floor or shadow.`, '1600 × 1000');
/** Helmet portrait from the driver's shown name, accents dropped, e.g. helmet-elodie-marchetti.png. */
export const helmetAsset = (driver: string, team: {name: string; colors: Colors}) => spec('helmets', `helmet-${slug(driver)}.png`,
  'Helmet portrait', `3/4 helmet + shoulders, ${team.name} colours, own stripes`, `Three-quarter helmet and shoulders in ${team.name} colours (${palette(team.colors)}) with ${driver}'s own stripe pattern. No race number.`, '1024 × 1024');
export const factoryAsset = (active: boolean) => spec('factory', `factory-${active ? 'active' : 'idle'}.png`,
  'Factory icon', active ? 'Workshop, lights on, people working' : 'Workshop: car on a stand under lights', active ? 'Workshop scene with lights on, sparks and people working. Transparent background.'
    : 'Small workshop scene: a car on a stand under lights, neutral colours. Transparent background.', '512 × 512');
/** Track outline from the stable circuit ID (not its display name), e.g. track.mexico_city -> track-mexico-city.svg. */
export const trackAsset = (trackId: string, venue: string) => spec('tracks', `track-${slug(trackId.replace(/^track\./, ''))}.svg`,
  'Track outline', `${venue}, white line, start/finish`, `Single-colour ${venue} circuit outline, thick rounded white line, start/finish marked. Transparent.`, '600 × 400');

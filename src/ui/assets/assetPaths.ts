/**
 * Drop-in art: the game looks for these files under public/assets/ (served at /assets/ on web).
 * Names are predictable so artwork can be added with no code change. See public/assets/README.md.
 */
export const slug = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export type AssetKind = 'car' | 'helmet' | 'factory' | 'track';
export const ASSET_ROOT = '/assets';
/** Team car from the team's short name in the active roster pack, e.g. car-ardent.png. */
export const carAsset = (teamShortName: string) => `${ASSET_ROOT}/cars/car-${slug(teamShortName)}.png`;
/** Helmet portrait from the driver's shown name, accents dropped, e.g. helmet-elodie-marchetti.png. */
export const helmetAsset = (driverName: string) => `${ASSET_ROOT}/helmets/helmet-${slug(driverName)}.png`;
export const factoryAsset = (active: boolean) => `${ASSET_ROOT}/factory/factory-${active ? 'active' : 'idle'}.png`;
/** Track outline from the stable circuit ID (not its display name), e.g. track.mexico_city -> track-mexico-city.svg. */
export const trackAsset = (trackId: string) => `${ASSET_ROOT}/tracks/track-${slug(trackId.replace(/^track\./, ''))}.svg`;

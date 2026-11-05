/**
 * Grid slots map pack entries onto the unchanged internal IDs that saves, seeds and tests use.
 * IDs are opaque tokens: some are historical working names, never display names.
 * Never reorder or edit these lists; a new slot needs an explicit content and save review.
 */
export const TEAM_SLOT_IDS = [
  'team.mclarin', 'team.ferano', 'team.mercurion', 'team.vortex', 'team.arden', 'team.wellington',
  'team.alpinor', 'team.hartman', 'team.veloce', 'team.auden', 'team.caldera'
] as const;
/** Race-seat slots in team order: slots 1-2 drive for team slot 1, and so on. */
export const GRID_SLOT_IDS = [
  'ronnis', 'piastra', 'leclair', 'harlton', 'roussel', 'antonello', 'verhoeven', 'hadrian', 'alvarro', 'sterling', 'sainor',
  'alburn', 'gasson', 'colavita', 'ortez', 'bearford', 'larsen', 'lindholm', 'hollenberg', 'bortelli', 'peralta', 'botten'
].map(token => `driver.${token}`);
/** Free-agent slots 1-10 are prospects, 11-21 reserves (slot 21 is the shared reserve). */
export const FREE_AGENT_SLOT_IDS = [
  'cordeiro', 'stoyanov', 'dunley', 'minaro', 'bergman', 'leones', 'stenmark', 'durand', 'mainor', 'van-hoven', 'vale',
  'okada', 'moreau', 'duarte', 'mensah', 'zheng', 'varga', 'bellini', 'sayed', 'navarro', 'takase'
].map(token => `driver.${token}`);
export const gridTeamSlot = (driverSlot: number) => Math.ceil(driverSlot / 2);

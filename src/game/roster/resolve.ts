import defaultPackJson from './defaultRoster.json';
import {FREE_AGENT_SLOT_IDS, GRID_SLOT_IDS, TEAM_SLOT_IDS} from './slots';
import type {DriverGroup, DriverStats, PackDriver, ResolvedDriver, ResolvedRoster, ResolvedTeam, RosterPack} from './types';

/** The shipped fictional roster. Complete: every slot and every field is present. */
export const DEFAULT_PACK = defaultPackJson as unknown as RosterPack;
export const STAT_KEYS = ['age', 'homeMarket', 'traits', 'talent', 'racecraft', 'adaptability', 'composure', 'feedback',
  'marketability', 'potential'] as const satisfies ReadonlyArray<keyof DriverStats>;

const bySlot = <T extends {slot: number}>(list: T[] | undefined, slot: number) => list?.find(entry => entry.slot === slot);
const sameStats = (a: DriverStats, b: DriverStats) => STAT_KEYS.every(key =>
  key === 'traits' ? a.traits.length === b.traits.length && a.traits.every((t, i) => t === b.traits[i]) : a[key] === b[key]);

function resolveDrivers(pack: RosterPack, group: DriverGroup, ids: string[]): ResolvedDriver[] {
  const own = group === 'grid' ? pack.drivers : pack.freeAgents;
  const base = group === 'grid' ? DEFAULT_PACK.drivers! : DEFAULT_PACK.freeAgents!;
  return ids.map((id, index) => {
    const slot = index + 1, d = bySlot(base, slot)! as Required<PackDriver>, entry = bySlot(own, slot);
    const defaultStats = d.stats as DriverStats;
    // Cosmetic packs never carry stats; validation refuses them, and they are ignored here too.
    const stats: DriverStats = pack.type === 'full' && entry?.stats
      ? {...defaultStats, ...entry.stats, traits: [...(entry.stats.traits ?? defaultStats.traits)]}
      : {...defaultStats, traits: [...defaultStats.traits]};
    return {slot, group, id, fromPack: !!entry, statsChanged: !sameStats(stats, defaultStats),
      name: entry?.name ?? d.name, number: entry?.number !== undefined ? entry.number : (d.number ?? null),
      nationality: entry?.nationality ?? d.nationality, archetype: entry?.archetype ?? d.archetype,
      bio: entry?.bio ?? d.bio, helmetPattern: entry?.helmetPattern ?? d.helmetPattern, stats};
  });
}

/** Merge a pack over the default roster by grid slot. Assumes the pack already passed validation. */
export function resolveRoster(pack: RosterPack): ResolvedRoster {
  const teams: ResolvedTeam[] = TEAM_SLOT_IDS.map((id, index) => {
    const slot = index + 1, t = bySlot(DEFAULT_PACK.teams, slot)!, entry = bySlot(pack.teams, slot);
    return {slot, id, fromPack: !!entry, name: entry?.name ?? t.name!, shortName: entry?.shortName ?? t.shortName!,
      base: entry?.base ?? t.base!, identity: entry?.identity ?? t.identity!,
      colors: {primary: entry?.colors?.primary ?? t.colors!.primary!, secondary: entry?.colors?.secondary ?? t.colors!.secondary!,
        accent: entry?.colors?.accent ?? t.colors!.accent!}};
  });
  const drivers = [...resolveDrivers(pack, 'grid', GRID_SLOT_IDS), ...resolveDrivers(pack, 'freeAgent', FREE_AGENT_SLOT_IDS)];
  const statOverrides = pack.type === 'full'
    ? Object.fromEntries(drivers.filter(d => d.statsChanged).map(d => [d.id, d.stats])) : {};
  return {packId: pack.id, packName: pack.name, author: pack.author ?? null, description: pack.description ?? null,
    type: pack.type, isDefault: pack.id === DEFAULT_PACK.id && Object.keys(statOverrides).length === 0 && sameDisplay(pack),
    teams, drivers, statOverrides};
}
function sameDisplay(pack: RosterPack) { return JSON.stringify(withoutStats(pack)) === JSON.stringify(withoutStats(DEFAULT_PACK)); }
const withoutStats = (pack: RosterPack) => ({teams: pack.teams, drivers: pack.drivers?.map(({stats: _s, ...rest}) => rest),
  freeAgents: pack.freeAgents?.map(({stats: _s, ...rest}) => rest)});

/** Keep a pack's names, colours, numbers and helmets but drop everything the simulation reads. */
export function cosmeticOnly(roster: ResolvedRoster): ResolvedRoster {
  const defaults = new Map(DEFAULT_ROSTER.drivers.map(d => [d.id, d.stats]));
  return {...roster, type: 'cosmetic', statOverrides: {},
    drivers: roster.drivers.map(d => ({...d, stats: defaults.get(d.id)!, statsChanged: false}))};
}

/** The pack as a cosmetic pack: same identity fields, no stats. */
export function toCosmeticPack(pack: RosterPack): RosterPack {
  const strip = (list: PackDriver[] | undefined) => list?.map(({stats: _s, ...rest}) => rest);
  return {...pack, type: 'cosmetic', ...(pack.drivers ? {drivers: strip(pack.drivers)} : {}), ...(pack.freeAgents ? {freeAgents: strip(pack.freeAgents)} : {})};
}

export const DEFAULT_ROSTER: ResolvedRoster = resolveRoster(DEFAULT_PACK);

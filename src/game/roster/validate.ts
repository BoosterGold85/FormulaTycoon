import {TRAITS} from '../drivers/types';
import {resolveRoster} from './resolve';
import {FREE_AGENT_SLOT_IDS, GRID_SLOT_IDS, TEAM_SLOT_IDS} from './slots';
import {HELMET_PATTERNS, PACK_FORMAT, PACK_MAX_BYTES, PACK_SCHEMA_VERSION, type ResolvedRoster, type RosterPack} from './types';

export type PackError = {path: string; where: string; message: string};
export type PackResult = {ok: true; pack: RosterPack; roster: ResolvedRoster} | {ok: false; errors: PackError[]};

const ROOT_KEYS = ['format', 'schemaVersion', 'id', 'name', 'author', 'description', 'type', 'teams', 'drivers', 'freeAgents'];
const TEAM_KEYS = ['slot', 'name', 'shortName', 'base', 'identity', 'colors'];
const COLOR_KEYS = ['primary', 'secondary', 'accent'];
const DRIVER_KEYS = ['slot', 'name', 'number', 'nationality', 'archetype', 'bio', 'helmetPattern', 'stats'];
const RATING_KEYS = ['talent', 'racecraft', 'adaptability', 'composure', 'feedback', 'marketability', 'potential'];
const STATS_KEYS = ['age', 'homeMarket', 'traits', ...RATING_KEYS];
/** Exported so the JSON Schema test can prove both describe the same format. */
export const PACK_KEYS = {root: ROOT_KEYS, team: TEAM_KEYS, colors: COLOR_KEYS, driver: DRIVER_KEYS, stats: STATS_KEYS};

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const CONTROL = /[\u0000-\u001F\u007F]/;
const HEX = /^#[0-9A-Fa-f]{6}$/;

/** Validates a parsed pack and its merge with the default roster. Every problem is reported, not just the first. */
export function validateRosterPack(input: unknown): PackResult {
  const errors: PackError[] = [];
  const add = (path: string, where: string, message: string) => errors.push({path, where, message});
  if (!isObject(input)) return {ok: false, errors: [{path: '', where: 'Pack', message: 'The file must contain one JSON object.'}]};
  const unknownKeys = (obj: Record<string, unknown>, allowed: string[], path: string, where: string) => {
    for (const key of Object.keys(obj)) if (!allowed.includes(key)) add(`${path}${path ? '.' : ''}${key}`, where, `Unknown field "${key}". Check the spelling against the format guide.`);
  };
  const text = (value: unknown, path: string, where: string, label: string, min: number, max: number, required = false) => {
    if (value === undefined) { if (required) add(path, where, `${label} is required.`); return; }
    if (typeof value !== 'string') { add(path, where, `${label} must be text.`); return; }
    const length = value.trim().length;
    if (length < min || value.length > max) add(path, where, `${label} must be ${min} to ${max} characters.`);
    else if (CONTROL.test(value)) add(path, where, `${label} contains a line break or control character.`);
  };
  const int = (value: unknown, path: string, where: string, label: string, min: number, max: number) => {
    if (value === undefined) return;
    if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) add(path, where, `${label} must be a whole number from ${min} to ${max}.`);
  };

  unknownKeys(input, ROOT_KEYS, '', 'Pack');
  if (input.format !== PACK_FORMAT) add('format', 'Pack', `"format" must be "${PACK_FORMAT}". This does not look like a Formula Tycoon roster pack.`);
  if (input.schemaVersion !== PACK_SCHEMA_VERSION) add('schemaVersion', 'Pack', typeof input.schemaVersion === 'number' && input.schemaVersion > PACK_SCHEMA_VERSION
    ? `This pack uses format version ${input.schemaVersion}; this game reads version ${PACK_SCHEMA_VERSION}. Update the game or re-export the pack.`
    : `"schemaVersion" must be ${PACK_SCHEMA_VERSION}.`);
  if (typeof input.id !== 'string' || !/^[a-z0-9][a-z0-9-]{1,47}$/.test(input.id)) add('id', 'Pack', 'Pack id must be 2 to 48 lowercase letters, digits or hyphens.');
  text(input.name, 'name', 'Pack', 'Pack name', 1, 60, true);
  text(input.author, 'author', 'Pack', 'Author', 1, 60);
  text(input.description, 'description', 'Pack', 'Description', 1, 280);
  const full = input.type === 'full';
  if (input.type !== 'cosmetic' && !full) add('type', 'Pack', 'Pack type must be "cosmetic" or "full".');

  const list = (key: 'teams' | 'drivers' | 'freeAgents', max: number, noun: string, check: (entry: Record<string, unknown>, path: string, where: string) => void) => {
    const value = input[key];
    if (value === undefined) return;
    if (!Array.isArray(value)) { add(key, 'Pack', `"${key}" must be a list.`); return; }
    const seen = new Set<number>();
    value.forEach((entry, i) => {
      const path = `${key}[${i}]`;
      if (!isObject(entry)) { add(path, `${noun} entry ${i + 1}`, 'Each entry must be an object.'); return; }
      const slot = entry.slot;
      const validSlot = typeof slot === 'number' && Number.isInteger(slot) && slot >= 1 && slot <= max;
      const where = validSlot ? `${noun} slot ${slot}` : `${noun} entry ${i + 1}`;
      if (!validSlot) add(`${path}.slot`, where, `Slot must be a whole number from 1 to ${max}.`);
      else if (seen.has(slot)) add(`${path}.slot`, where, `Slot ${slot} appears more than once.`);
      else seen.add(slot);
      check(entry, path, where);
    });
  };
  list('teams', TEAM_SLOT_IDS.length, 'Team', (t, path, where) => {
    unknownKeys(t, TEAM_KEYS, path, where);
    text(t.name, `${path}.name`, where, 'Team name', 2, 32);
    text(t.shortName, `${path}.shortName`, where, 'Short name', 1, 14);
    text(t.base, `${path}.base`, where, 'Base', 1, 40);
    text(t.identity, `${path}.identity`, where, 'Identity', 1, 120);
    if (t.colors === undefined) return;
    if (!isObject(t.colors)) { add(`${path}.colors`, where, 'Colours must be an object with primary, secondary and accent.'); return; }
    unknownKeys(t.colors, COLOR_KEYS, `${path}.colors`, where);
    for (const key of COLOR_KEYS) {
      const c = t.colors[key];
      if (c !== undefined && (typeof c !== 'string' || !HEX.test(c))) add(`${path}.colors.${key}`, where, `Colour "${key}" must be a six-digit hex colour like #1D4E89.`);
    }
  });
  const driver = (d: Record<string, unknown>, path: string, where: string) => {
    unknownKeys(d, DRIVER_KEYS, path, where);
    text(d.name, `${path}.name`, where, 'Driver name', 2, 32);
    if (d.number !== null) int(d.number, `${path}.number`, where, 'Car number', 1, 99);
    text(d.nationality, `${path}.nationality`, where, 'Nationality', 2, 24);
    text(d.archetype, `${path}.archetype`, where, 'Archetype', 1, 32);
    text(d.bio, `${path}.bio`, where, 'Bio', 1, 200);
    int(d.helmetPattern, `${path}.helmetPattern`, where, 'Helmet pattern', 0, HELMET_PATTERNS - 1);
    if (d.stats === undefined) return;
    if (!full) { add(`${path}.stats`, where, 'Stats are only allowed in full packs. Remove "stats" or set the pack type to "full".'); return; }
    if (!isObject(d.stats)) { add(`${path}.stats`, where, '"stats" must be an object.'); return; }
    const s = d.stats, sp = `${path}.stats`;
    unknownKeys(s, STATS_KEYS, sp, where);
    int(s.age, `${sp}.age`, where, 'Age', 16, 45);
    text(s.homeMarket, `${sp}.homeMarket`, where, 'Home market', 2, 24);
    for (const key of RATING_KEYS) {
      const v = s[key];
      if (v !== undefined && (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 100)) add(`${sp}.${key}`, where, `"${key}" must be a number from 0 to 100.`);
    }
    const traits = s.traits;
    if (traits !== undefined) {
      if (!Array.isArray(traits) || traits.length > 3) add(`${sp}.traits`, where, 'Traits must be a list of up to 3 traits.');
      else traits.forEach((trait: unknown, i: number) => {
        if (!(TRAITS as readonly unknown[]).includes(trait)) add(`${sp}.traits[${i}]`, where, `Unknown trait "${String(trait)}". Allowed: ${TRAITS.join(', ')}.`);
        else if (traits.indexOf(trait) !== i) add(`${sp}.traits[${i}]`, where, `Trait "${String(trait)}" is listed twice.`);
      });
    }
  };
  list('drivers', GRID_SLOT_IDS.length, 'Driver', driver);
  list('freeAgents', FREE_AGENT_SLOT_IDS.length, 'Free agent', driver);
  if (errors.length) return {ok: false, errors};

  // The merged roster must still make sense: missing fields come from the default pack.
  const pack = input as unknown as RosterPack, roster = resolveRoster(pack);
  const pathFor = (group: 'drivers' | 'freeAgents', slot: number, field: string) => {
    const i = (group === 'drivers' ? pack.drivers : pack.freeAgents)?.findIndex(d => d.slot === slot) ?? -1;
    return i >= 0 ? `${group}[${i}].${field}` : `${group} (default slot ${slot}).${field}`;
  };
  const label = (d: ResolvedRoster['drivers'][number]) => `${d.group === 'grid' ? 'Driver' : 'Free agent'} slot ${d.slot}`;
  const numbers = new Map<number, string>(), names = new Map<string, string>();
  for (const d of roster.drivers) {
    const group = d.group === 'grid' ? 'drivers' : 'freeAgents';
    if (d.number !== null) {
      const other = numbers.get(d.number);
      if (other) add(pathFor(group, d.slot, 'number'), label(d), `Car number ${d.number} is also used by ${other}.`);
      else numbers.set(d.number, `${d.name} (${label(d).toLowerCase()})`);
    }
    const key = d.name.trim().toLowerCase(), other = names.get(key);
    if (other) add(pathFor(group, d.slot, 'name'), label(d), `The name "${d.name}" is also used by ${other}.`);
    else names.set(key, label(d).toLowerCase());
  }
  for (const d of roster.drivers.filter(x => x.group === 'grid' && x.slot % 2 === 0)) {
    const mate = roster.drivers.find(x => x.group === 'grid' && x.slot === d.slot - 1)!;
    if (mate.helmetPattern === d.helmetPattern) add(pathFor('drivers', d.slot, 'helmetPattern'), label(d),
      `Teammates must not share a helmet design: ${mate.name} (driver slot ${mate.slot}) also uses pattern ${d.helmetPattern}.`);
  }
  const teamNames = new Map<string, number>();
  for (const t of roster.teams) {
    const other = teamNames.get(t.name.trim().toLowerCase());
    if (other) add(`teams (slot ${t.slot}).name`, `Team slot ${t.slot}`, `The team name "${t.name}" is also used by team slot ${other}.`);
    else teamNames.set(t.name.trim().toLowerCase(), t.slot);
  }
  return errors.length ? {ok: false, errors} : {ok: true, pack, roster};
}

/** Parse and validate pack file text, with readable JSON syntax errors. */
export function parseRosterPack(source: string): PackResult {
  if (new TextEncoder().encode(source).length > PACK_MAX_BYTES) return {ok: false, errors: [{path: '', where: 'File',
    message: `The file is larger than ${PACK_MAX_BYTES / 1024} KB. Roster packs are small text files; check you picked the right file.`}]};
  if (!source.trim()) return {ok: false, errors: [{path: '', where: 'File', message: 'The file is empty.'}]};
  let parsed: unknown;
  try { parsed = JSON.parse(source.replace(/^﻿/, '')); }
  catch (e) { return {ok: false, errors: [{path: '', where: 'File', message: `This is not valid JSON: ${(e as Error).message}`}]}; }
  return validateRosterPack(parsed);
}


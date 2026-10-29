import { describe, expect, it } from '@jest/globals';
import {
  DEFAULT_DEVELOPMENT_CONTEXT as context,
  GRAND_PRIX_CALENDAR,
  type DevelopmentContext,
  type TeamDevelopmentProfile
} from '../../game/development';
import {
  advanceDevelopmentWeek,
  buildEventDocument,
  computeCarProfile,
  createDevelopmentWorld,
  expectedGain,
  getProfile,
  introduceReadyUpgrades,
  rankTeamsByPace,
  resolvePerformanceGain,
  runDevelopmentSeason,
  spendingLimit,
  stageSpeed,
  startNextSeason,
  startProject,
  type DevelopmentProject,
  type DevelopmentWorld
} from '../development';
import { randomFor } from '../development/random';

const raceWeeks = new Set(GRAND_PRIX_CALENDAR.map(event => event.week));

function paceOf(world: DevelopmentWorld, teamId: string, ctx: DevelopmentContext = context) {
  return computeCarProfile(world.teams[teamId]!, getProfile(ctx, teamId)).pace;
}

function spread(world: DevelopmentWorld) {
  const paces = context.teams.map(team => paceOf(world, team.id));
  return Math.max(...paces) - Math.min(...paces);
}

describe('development world', () => {
  it('uses the 8 FIA upgrade areas', () => {
    expect(context.parts.map(part => part.name)).toEqual([
      'Front wing',
      'Nose',
      'Front suspension',
      'Floor',
      'Bodywork & cooling',
      'Rear wing',
      'Rear suspension',
      'Diffuser & rear edge'
    ]);
  });

  it('is deterministic for a seed and varies between seeds', () => {
    const a = runDevelopmentSeason(createDevelopmentWorld(context, 7), context);
    const b = runDevelopmentSeason(createDevelopmentWorld(context, 7), context);
    const c = runDevelopmentSeason(createDevelopmentWorld(context, 8), context);
    expect(a).toEqual(b);
    expect(a.submissions).not.toEqual(c.submissions);
  });

  it('gives the championship leaders the least aero testing time', () => {
    const world = createDevelopmentWorld(context, 1);
    expect(world.teams.aurora!.aeroAllowance).toBe(0.7);
    expect(world.teams.kestrel!.aeroAllowance).toBe(1.15);
  });
});

describe('a season of development', () => {
  const seeds = [1, 2, 3, 4, 5];
  const seasons = seeds.map(seed => ({
    start: createDevelopmentWorld(context, seed),
    end: runDevelopmentSeason(createDevelopmentWorld(context, seed), context)
  }));

  it('never lets a team exceed its budget or the cost cap', () => {
    for (const { end } of seasons) {
      for (const profile of context.teams) {
        expect(end.teams[profile.id]!.spent).toBeLessThanOrEqual(spendingLimit(profile, context) + 1e-9);
        expect(spendingLimit(profile, context)).toBeLessThanOrEqual(context.regulations.developmentCap);
      }
    }
  });

  it('only fits upgrades on race weekends and only one per part per event', () => {
    for (const { end } of seasons) {
      const keys = new Set<string>();
      for (const submission of end.submissions) {
        expect(raceWeeks.has(submission.week)).toBe(true);
        const key = `${submission.eventId}:${submission.teamId}:${submission.partId}`;
        expect(keys.has(key)).toBe(false);
        keys.add(key);
      }
    }
  });

  it('respects homologation limits on noses and suspension', () => {
    for (const { end } of seasons) {
      for (const team of Object.values(end.teams)) {
        expect(team.parts.NOSE.upgradesThisSeason).toBeLessThanOrEqual(2);
        expect(team.parts.FRONT_SUSPENSION.upgradesThisSeason).toBeLessThanOrEqual(2);
        expect(team.parts.REAR_SUSPENSION.upgradesThisSeason).toBeLessThanOrEqual(2);
      }
    }
  });

  it('develops every car, with the richest teams gaining most on average', () => {
    const gain = (teamId: string) =>
      seasons.reduce((sum, { start, end }) => sum + paceOf(end, teamId) - paceOf(start, teamId), 0) /
      seasons.length;
    for (const profile of context.teams) expect(gain(profile.id)).toBeGreaterThan(0.5);
    expect(gain('aurora')).toBeGreaterThan(gain('kestrel'));
  });

  it('keeps the field within a realistic spread', () => {
    for (const { start, end } of seasons) {
      expect(spread(end)).toBeLessThan(spread(start) + 6);
      for (const team of Object.values(end.teams)) {
        for (const part of Object.values(team.parts)) {
          expect(part.rating).toBeGreaterThanOrEqual(context.regulations.ratingFloor);
          expect(part.rating).toBeLessThanOrEqual(context.regulations.ratingCeiling);
          expect(part.reliability).toBeGreaterThanOrEqual(40);
          expect(part.reliability).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('produces all three FIA reasons and some upgrades that do not work', () => {
    const all = seasons.flatMap(({ end }) => end.submissions);
    const reasons = new Set(all.map(submission => submission.reason));
    expect(reasons).toEqual(new Set(['PERFORMANCE', 'CIRCUIT_SPECIFIC', 'RELIABILITY']));
    expect(all.some(submission => submission.outcome === 'REVERTED')).toBe(true);
    expect(all.some(submission => submission.outcome === 'DELIVERED')).toBe(true);
  });

  it('builds a per-race document with every team and part', () => {
    const { end } = seasons[0]!;
    const document = buildEventDocument(end, context, 1, 'USA');
    expect(document.eventName).toBe('United States GP');
    expect(document.teams).toHaveLength(10);
    for (const team of document.teams) {
      expect(team.entries.map(entry => entry.partName)).toHaveLength(8);
    }
    const listed = document.teams.flatMap(team => team.entries.filter(entry => entry.submission));
    expect(listed).toHaveLength(end.submissions.filter(item => item.eventId === 'USA').length);
  });

  it('does not let the field run away over several seasons', () => {
    const initial = spread(seasons[0]!.start);
    let world = seasons[0]!.end;
    for (let season = 2; season <= 5; season += 1) {
      world = startNextSeason(world, context, rankTeamsByPace(world, context));
      world = runDevelopmentSeason(world, context);
    }
    expect(world.season).toBe(5);
    expect(spread(world)).toBeLessThan(initial + 4);
  });
});

describe('development rules', () => {
  const aurora = getProfile(context, 'aurora');
  const world = createDevelopmentWorld(context, 1);

  it('has diminishing returns near the regulation ceiling', () => {
    const team = world.teams.aurora!;
    const low = { ...team, parts: { ...team.parts, FLOOR: { ...team.parts.FLOOR, rating: 60 } } };
    const high = { ...team, parts: { ...team.parts, FLOOR: { ...team.parts.FLOOR, rating: 95 } } };
    expect(expectedGain(aurora, low, context, 'FLOOR', 1)).toBeGreaterThan(
      expectedGain(aurora, high, context, 'FLOOR', 1) * 2
    );
  });

  it('lets a backmarker research aero faster than the champions with equal facilities', () => {
    const part = context.parts.find(item => item.id === 'FLOOR')!;
    const leader = { ...world.teams.aurora!, aeroAllowance: 0.7 };
    const backmarker = { ...world.teams.aurora!, aeroAllowance: 1.15 };
    expect(stageSpeed(aurora, backmarker, part, 'RESEARCH')).toBeGreaterThan(
      stageSpeed(aurora, leader, part, 'RESEARCH')
    );
  });

  it('refuses projects that break the budget, slot or homologation rules', () => {
    const request = { partId: 'FLOOR' as const, reason: 'PERFORMANCE' as const, ambition: 1, week: 1, season: 1 };
    const broke = { ...world.teams.aurora!, spent: spendingLimit(aurora, context) };
    expect(startProject(broke, aurora, context, request)).toEqual({ ok: false, reason: 'OVER_BUDGET' });

    const first = startProject(world.teams.aurora!, aurora, context, request);
    if (!first.ok) throw new Error(first.reason);
    expect(startProject(first.team, aurora, context, request)).toEqual({ ok: false, reason: 'BUSY' });

    const capped = {
      ...world.teams.aurora!,
      parts: { ...world.teams.aurora!.parts, NOSE: { ...world.teams.aurora!.parts.NOSE, upgradesThisSeason: 2 } }
    };
    expect(startProject(capped, aurora, context, { ...request, partId: 'NOSE' })).toEqual({
      ok: false,
      reason: 'HOMOLOGATION_LIMIT'
    });

    const tiny: TeamDevelopmentProfile = {
      ...aurora,
      facilities: { windTunnel: 1, cfd: 1, rig: 1, manufacturing: 1 }
    };
    const one = startProject(world.teams.aurora!, tiny, context, request);
    if (!one.ok) throw new Error(one.reason);
    expect(startProject(one.team, tiny, context, { ...request, partId: 'REAR_WING' })).toEqual({
      ok: false,
      reason: 'NO_SLOT'
    });
  });

  it('leaves the car unchanged when an upgrade is reverted', () => {
    const project: DevelopmentProject = {
      id: 'aurora-S1-test',
      partId: 'FLOOR',
      reason: 'PERFORMANCE',
      stage: 'READY',
      progress: 0,
      ambition: 1,
      expectedGain: 2,
      cost: 5,
      startedWeek: 1
    };
    const poor: TeamDevelopmentProfile = { ...aurora, correlation: 0 };
    // Find a seed where this poorly correlated team's upgrade fails.
    let seed = 0;
    while (resolvePerformanceGain(project, poor, randomFor(seed, 'upgrade', project.id)).outcome !== 'REVERTED') {
      seed += 1;
    }
    const team = { ...world.teams.aurora!, projects: [project] };
    const result = introduceReadyUpgrades(team, poor, context, seed, 1, GRAND_PRIX_CALENDAR[0]!);
    expect(result.submissions[0]!.outcome).toBe('REVERTED');
    expect(result.team.parts.FLOOR).toEqual(team.parts.FLOOR);
    expect(result.team.projects).toEqual([]);
  });

  it('rewards circuit packages only at matching circuits', () => {
    const team = { ...world.teams.azure!, circuitPackages: ['LOW_DRAG' as const] };
    const profile = getProfile(context, 'azure');
    const monza = GRAND_PRIX_CALENDAR.find(event => event.id === 'ITA')!;
    const monaco = GRAND_PRIX_CALENDAR.find(event => event.id === 'MON')!;
    const without = world.teams.azure!;
    expect(computeCarProfile(team, profile, monza).pace).toBeGreaterThan(
      computeCarProfile(without, profile, monza).pace
    );
    expect(computeCarProfile(team, profile, monaco).pace).toBe(
      computeCarProfile(without, profile, monaco).pace
    );
  });

  it('skips player-controlled teams in the rival AI', () => {
    const playerContext: DevelopmentContext = {
      ...context,
      teams: context.teams.map(team => (team.id === 'kestrel' ? { ...team, controlledBy: 'PLAYER' } : team))
    };
    let state = createDevelopmentWorld(playerContext, 3);
    for (let week = 0; week < 30; week += 1) state = advanceDevelopmentWeek(state, playerContext);
    expect(state.teams.kestrel!.projects).toEqual([]);
    expect(state.submissions.some(submission => submission.teamId === 'kestrel')).toBe(false);
  });

  it('pulls the field together after a regulation reset', () => {
    const end = runDevelopmentSeason(createDevelopmentWorld(context, 4), context);
    const reset = startNextSeason(end, context, rankTeamsByPace(end, context), { regulationReset: true });
    expect(spread(reset)).toBeLessThan(spread(end));
    expect(reset.teams.aurora!.spent).toBe(0);
    expect(reset.teams.aurora!.aeroAllowance).toBe(0.7);
  });
});

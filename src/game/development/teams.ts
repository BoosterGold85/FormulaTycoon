import type { TeamDevelopmentProfile } from './types';

const POWER_UNITS = {
  vortex: { supplier: 'Vortex Power', rating: 84 },
  helix: { supplier: 'Helix Motori', rating: 81 },
  kanto: { supplier: 'Kanto Dynamics', rating: 79 },
  stratus: { supplier: 'Stratus Engines', rating: 76 }
} as const;

/** Fictional rival teams with distinct resources and development habits. */
export const RIVAL_TEAMS: TeamDevelopmentProfile[] = [
  {
    id: 'aurora',
    name: 'Aurora Racing',
    controlledBy: 'AI',
    developmentBudget: 60,
    facilities: { windTunnel: 5, cfd: 5, rig: 4, manufacturing: 5 },
    staff: { aero: 92, vehicleDynamics: 86 },
    correlation: 88,
    aggression: 0.55,
    focus: { AERO: 1.1, VEHICLE_DYNAMICS: 0.9 },
    carLevel: 80,
    partOffsets: { FLOOR: 3 },
    powerUnit: POWER_UNITS.vortex
  },
  {
    id: 'rossa',
    name: 'Scuderia Rossa Veloce',
    controlledBy: 'AI',
    developmentBudget: 60,
    facilities: { windTunnel: 4, cfd: 5, rig: 5, manufacturing: 5 },
    staff: { aero: 86, vehicleDynamics: 88 },
    correlation: 74,
    aggression: 0.7,
    focus: { AERO: 1, VEHICLE_DYNAMICS: 1 },
    carLevel: 78,
    partOffsets: { REAR_SUSPENSION: 2 },
    powerUnit: POWER_UNITS.helix
  },
  {
    id: 'silverline',
    name: 'Silverline GP',
    controlledBy: 'AI',
    developmentBudget: 60,
    facilities: { windTunnel: 5, cfd: 4, rig: 5, manufacturing: 4 },
    staff: { aero: 84, vehicleDynamics: 90 },
    correlation: 66,
    aggression: 0.5,
    focus: { AERO: 0.9, VEHICLE_DYNAMICS: 1.1 },
    carLevel: 77,
    powerUnit: POWER_UNITS.vortex
  },
  {
    id: 'papaya',
    name: 'Papaya Motorsport',
    controlledBy: 'AI',
    developmentBudget: 58,
    facilities: { windTunnel: 4, cfd: 4, rig: 4, manufacturing: 4 },
    staff: { aero: 88, vehicleDynamics: 80 },
    correlation: 85,
    aggression: 0.6,
    focus: { AERO: 1.15, VEHICLE_DYNAMICS: 0.85 },
    carLevel: 76,
    partOffsets: { FRONT_WING: 2 },
    powerUnit: POWER_UNITS.vortex
  },
  {
    id: 'emerald',
    name: 'Emerald Racing',
    controlledBy: 'AI',
    developmentBudget: 50,
    facilities: { windTunnel: 3, cfd: 4, rig: 3, manufacturing: 4 },
    staff: { aero: 78, vehicleDynamics: 76 },
    correlation: 70,
    aggression: 0.45,
    focus: { AERO: 1, VEHICLE_DYNAMICS: 1 },
    carLevel: 72,
    powerUnit: POWER_UNITS.vortex
  },
  {
    id: 'azure',
    name: 'Azure Racing',
    controlledBy: 'AI',
    developmentBudget: 48,
    facilities: { windTunnel: 3, cfd: 3, rig: 3, manufacturing: 3 },
    staff: { aero: 72, vehicleDynamics: 74 },
    correlation: 62,
    aggression: 0.6,
    focus: { AERO: 1, VEHICLE_DYNAMICS: 1 },
    carLevel: 70,
    powerUnit: POWER_UNITS.stratus
  },
  {
    id: 'northstar',
    name: 'Northstar GP',
    controlledBy: 'AI',
    developmentBudget: 45,
    facilities: { windTunnel: 3, cfd: 3, rig: 2, manufacturing: 3 },
    staff: { aero: 74, vehicleDynamics: 68 },
    correlation: 72,
    aggression: 0.4,
    focus: { AERO: 1.1, VEHICLE_DYNAMICS: 0.9 },
    carLevel: 69,
    powerUnit: POWER_UNITS.kanto
  },
  {
    id: 'falcon',
    name: 'Falcon Racing',
    controlledBy: 'AI',
    developmentBudget: 44,
    facilities: { windTunnel: 3, cfd: 3, rig: 3, manufacturing: 2 },
    staff: { aero: 70, vehicleDynamics: 72 },
    correlation: 68,
    aggression: 0.65,
    focus: { AERO: 1, VEHICLE_DYNAMICS: 1 },
    carLevel: 69,
    powerUnit: POWER_UNITS.kanto
  },
  {
    id: 'ironworks',
    name: 'Ironworks Racing',
    controlledBy: 'AI',
    developmentBudget: 38,
    facilities: { windTunnel: 2, cfd: 3, rig: 2, manufacturing: 2 },
    staff: { aero: 66, vehicleDynamics: 70 },
    correlation: 60,
    aggression: 0.5,
    focus: { AERO: 0.9, VEHICLE_DYNAMICS: 1.1 },
    carLevel: 67,
    powerUnit: POWER_UNITS.helix
  },
  {
    id: 'kestrel',
    name: 'Kestrel Motorsport',
    controlledBy: 'AI',
    developmentBudget: 36,
    facilities: { windTunnel: 2, cfd: 2, rig: 2, manufacturing: 2 },
    staff: { aero: 64, vehicleDynamics: 62 },
    correlation: 58,
    aggression: 0.35,
    focus: { AERO: 1, VEHICLE_DYNAMICS: 1 },
    carLevel: 65,
    powerUnit: POWER_UNITS.helix
  }
];

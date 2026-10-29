import type { CarAttribute, PartDefinition, PartId } from './types';

/**
 * The 8 upgrade areas from the FIA car presentation submissions. Power unit
 * and gearbox are homologated, so they are not developed here.
 */
export const PART_DEFINITIONS: PartDefinition[] = [
  {
    id: 'FRONT_WING',
    name: 'Front wing',
    area: 'AERO',
    researchMethod: 'WIND_TUNNEL',
    researchWeeks: 3,
    designWeeks: 2,
    manufactureWeeks: 2,
    cost: 2.0,
    maxGain: 8.8,
    reliabilityRisk: 2,
    descriptions: {
      PERFORMANCE: [
        'Revised flap profiles to increase local load',
        'Modified endplate to improve outwash around the front tyre',
        'New mainplane leading edge for better flow conditioning'
      ],
      CIRCUIT_SPECIFIC: ['Trimmed flap for a lower-downforce balance'],
      RELIABILITY: ['Reinforced flap mounting brackets']
    }
  },
  {
    id: 'NOSE',
    name: 'Nose',
    area: 'AERO',
    researchMethod: 'WIND_TUNNEL',
    researchWeeks: 4,
    designWeeks: 2,
    manufactureWeeks: 3,
    cost: 2.6,
    maxGain: 5.6,
    reliabilityRisk: 3,
    // Every new nose needs a fresh crash test.
    maxUpgradesPerSeason: 2,
    descriptions: {
      PERFORMANCE: [
        'Narrower nose tip to feed more flow under the chassis',
        'Revised nose underside to condition flow to the floor'
      ],
      CIRCUIT_SPECIFIC: ['Nose cooling inlet for hot conditions'],
      RELIABILITY: ['Revised crash structure layup']
    }
  },
  {
    id: 'FRONT_SUSPENSION',
    name: 'Front suspension',
    area: 'VEHICLE_DYNAMICS',
    researchMethod: 'RIG',
    researchWeeks: 5,
    designWeeks: 3,
    manufactureWeeks: 3,
    cost: 3.5,
    maxGain: 8.0,
    reliabilityRisk: 5,
    // Pick-up points are fixed to the homologated chassis.
    maxUpgradesPerSeason: 2,
    descriptions: {
      PERFORMANCE: [
        'Revised wishbone fairings to improve flow to the sidepods',
        'New upright geometry for better front-end response'
      ],
      CIRCUIT_SPECIFIC: ['Softer setup range for kerb riding'],
      RELIABILITY: ['Stiffened pushrod to remove a fatigue issue']
    }
  },
  {
    id: 'FLOOR',
    name: 'Floor',
    area: 'AERO',
    researchMethod: 'WIND_TUNNEL',
    researchWeeks: 5,
    designWeeks: 3,
    manufactureWeeks: 3,
    cost: 4.8,
    maxGain: 12.8,
    reliabilityRisk: 3,
    descriptions: {
      PERFORMANCE: [
        'Revised floor fences to strengthen the underfloor vortices',
        'New floor edge geometry to seal the underfloor',
        'Modified Venturi throat to increase local load'
      ],
      CIRCUIT_SPECIFIC: ['Floor edge trim for a bumpy circuit'],
      RELIABILITY: ['Added floor stays to limit flexing']
    }
  },
  {
    id: 'BODYWORK_COOLING',
    name: 'Bodywork & cooling',
    area: 'AERO',
    researchMethod: 'WIND_TUNNEL',
    researchWeeks: 4,
    designWeeks: 3,
    manufactureWeeks: 3,
    cost: 4.0,
    maxGain: 9.6,
    reliabilityRisk: 6,
    circuitPackage: 'HIGH_COOLING',
    descriptions: {
      PERFORMANCE: [
        'Tighter sidepod packaging to reduce drag',
        'Revised engine cover downwash ramp',
        'New sidepod inlet for improved flow to the rear'
      ],
      CIRCUIT_SPECIFIC: ['Enlarged cooling louvres for hot conditions'],
      RELIABILITY: ['Revised radiator ducting to lower temperatures']
    }
  },
  {
    id: 'REAR_WING',
    name: 'Rear wing',
    area: 'AERO',
    researchMethod: 'WIND_TUNNEL',
    researchWeeks: 3,
    designWeeks: 2,
    manufactureWeeks: 2,
    cost: 2.0,
    maxGain: 8.0,
    reliabilityRisk: 2,
    circuitPackage: 'LOW_DRAG',
    descriptions: {
      PERFORMANCE: [
        'New rear wing profiles for better load efficiency',
        'Revised endplate tip to reduce induced drag'
      ],
      CIRCUIT_SPECIFIC: ['Low-downforce rear wing for high-speed circuits'],
      RELIABILITY: ['Strengthened DRS actuator mounting']
    }
  },
  {
    id: 'REAR_SUSPENSION',
    name: 'Rear suspension',
    area: 'VEHICLE_DYNAMICS',
    researchMethod: 'RIG',
    researchWeeks: 5,
    designWeeks: 3,
    manufactureWeeks: 3,
    cost: 3.5,
    maxGain: 8.0,
    reliabilityRisk: 5,
    maxUpgradesPerSeason: 2,
    descriptions: {
      PERFORMANCE: [
        'Revised rear geometry to reduce tyre degradation',
        'New wishbone fairings to clean up flow to the diffuser'
      ],
      CIRCUIT_SPECIFIC: ['Ride height range for a high-speed circuit'],
      RELIABILITY: ['Revised bearing housing to cure overheating']
    }
  },
  {
    id: 'DIFFUSER_REAR_EDGE',
    name: 'Diffuser & rear edge',
    area: 'AERO',
    researchMethod: 'WIND_TUNNEL',
    researchWeeks: 4,
    designWeeks: 2,
    manufactureWeeks: 3,
    cost: 3.1,
    maxGain: 10.4,
    reliabilityRisk: 2,
    descriptions: {
      PERFORMANCE: [
        'Revised diffuser kick-up to increase rear load',
        'New rear floor edge to improve diffuser expansion'
      ],
      CIRCUIT_SPECIFIC: ['Diffuser trim to rebalance the car'],
      RELIABILITY: ['Reinforced diffuser strakes']
    }
  }
];

/**
 * How much each part feeds each car characteristic. Every attribute column
 * sums to 1. Power comes from the homologated power unit instead.
 */
export const PART_CONTRIBUTIONS: Record<Exclude<CarAttribute, 'power'>, Partial<Record<PartId, number>>> = {
  downforce: {
    FLOOR: 0.35,
    DIFFUSER_REAR_EDGE: 0.2,
    FRONT_WING: 0.2,
    REAR_WING: 0.15,
    NOSE: 0.05,
    BODYWORK_COOLING: 0.05
  },
  dragEfficiency: {
    REAR_WING: 0.35,
    BODYWORK_COOLING: 0.25,
    FLOOR: 0.15,
    DIFFUSER_REAR_EDGE: 0.1,
    NOSE: 0.1,
    FRONT_WING: 0.05
  },
  mechanicalGrip: { REAR_SUSPENSION: 0.45, FRONT_SUSPENSION: 0.4, FLOOR: 0.15 },
  tyreManagement: {
    REAR_SUSPENSION: 0.35,
    FRONT_SUSPENSION: 0.3,
    DIFFUSER_REAR_EDGE: 0.2,
    FRONT_WING: 0.15
  },
  cooling: { BODYWORK_COOLING: 0.85, DIFFUSER_REAR_EDGE: 0.15 }
};

/** How much each characteristic matters to lap time on an average circuit. */
export const PACE_WEIGHTS: Record<CarAttribute, number> = {
  downforce: 0.3,
  power: 0.25,
  dragEfficiency: 0.15,
  mechanicalGrip: 0.15,
  tyreManagement: 0.1,
  cooling: 0.05
};

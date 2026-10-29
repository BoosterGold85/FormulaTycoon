/**
 * Static data shapes for car development. Plain data only; the rules that
 * use it live in src/simulation/development.
 */

/** The 8 areas teams declare upgrades for in the FIA car presentation documents. */
export type PartId =
  | 'FRONT_WING'
  | 'NOSE'
  | 'FRONT_SUSPENSION'
  | 'FLOOR'
  | 'BODYWORK_COOLING'
  | 'REAR_WING'
  | 'REAR_SUSPENSION'
  | 'DIFFUSER_REAR_EDGE';

/** Car characteristics, each 0-100 where higher is better. */
export type CarAttribute =
  | 'downforce'
  | 'dragEfficiency'
  | 'mechanicalGrip'
  | 'tyreManagement'
  | 'cooling'
  | 'power';

/** Department that owns a part's development. */
export type DevelopmentArea = 'AERO' | 'VEHICLE_DYNAMICS';

/** How a concept is validated before design release. */
export type ResearchMethod = 'WIND_TUNNEL' | 'RIG';

/** Reasons used on the FIA upgrade submission documents. */
export type UpgradeReason = 'PERFORMANCE' | 'CIRCUIT_SPECIFIC' | 'RELIABILITY';

/** Circuit-specific packages a team can build once and reuse at matching events. */
export type CircuitPackage = 'LOW_DRAG' | 'HIGH_COOLING';

export type PartDefinition = {
  id: PartId;
  name: string;
  area: DevelopmentArea;
  researchMethod: ResearchMethod;
  /** Weeks of work per stage for an average team. */
  researchWeeks: number;
  designWeeks: number;
  manufactureWeeks: number;
  /** Cost in $M of a full-ambition performance upgrade. */
  cost: number;
  /** Rating gain of a full-ambition upgrade on a car with all the headroom in the world. */
  maxGain: number;
  /** Reliability lost when a brand-new full-ambition spec is fitted. */
  reliabilityRisk: number;
  /** Homologation limits (e.g. nose crash tests, suspension pick-up points). */
  maxUpgradesPerSeason?: number;
  /** Circuit package this part can provide. */
  circuitPackage?: CircuitPackage;
  /** Flavour text for submissions, by reason. */
  descriptions: Record<UpgradeReason, string[]>;
};

export type FacilityLevels = {
  windTunnel: number;
  cfd: number;
  rig: number;
  manufacturing: number;
};

export type TeamDevelopmentProfile = {
  id: string;
  name: string;
  controlledBy: 'AI' | 'PLAYER';
  /** Development spend available per season in $M (limited by the regulations). */
  developmentBudget: number;
  /** Facility levels 1-5. */
  facilities: FacilityLevels;
  /** Staff quality 0-100. */
  staff: { aero: number; vehicleDynamics: number };
  /** How well simulation tools predict the track, 0-100. Low = surprises. */
  correlation: number;
  /** Willingness to bring big, risky upgrades, 0-1. */
  aggression: number;
  /** Relative appetite per area (1 = neutral). */
  focus: Record<DevelopmentArea, number>;
  /** Starting rating for every part, plus per-part offsets. */
  carLevel: number;
  partOffsets?: Partial<Record<PartId, number>>;
  /** Homologated power unit: developed by the supplier, not by this engine. */
  powerUnit: { supplier: string; rating: number };
};

export type GrandPrix = {
  id: string;
  name: string;
  week: number;
  downforce: 'LOW' | 'MEDIUM' | 'HIGH';
  hot: boolean;
};

export type DevelopmentRegulations = {
  /** Highest development spend allowed per season in $M. */
  developmentCap: number;
  /** Part ratings live between these values. */
  ratingFloor: number;
  ratingCeiling: number;
  seasonWeeks: number;
  /**
   * Aerodynamic Testing Restrictions: share of baseline wind tunnel/CFD time by
   * previous championship position (index 0 = champions).
   */
  aeroTestingAllowance: number[];
};

export type DevelopmentContext = {
  parts: PartDefinition[];
  regulations: DevelopmentRegulations;
  calendar: GrandPrix[];
  teams: TeamDevelopmentProfile[];
};

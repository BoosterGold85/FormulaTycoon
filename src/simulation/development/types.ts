import type { CircuitPackage, PartId, UpgradeReason } from '../../game/development';

export type ProjectStage = 'RESEARCH' | 'DESIGN' | 'MANUFACTURING' | 'READY';

export type PartState = {
  /** Performance of the part spec on the car, ratingFloor-ratingCeiling. */
  rating: number;
  /** 0-100; new specs start fragile and mature with running. */
  reliability: number;
  /** Spec number of the part currently fitted. */
  spec: number;
  /** Performance upgrades introduced this season (for homologation limits). */
  upgradesThisSeason: number;
};

export type DevelopmentProject = {
  id: string;
  partId: PartId;
  reason: UpgradeReason;
  stage: ProjectStage;
  /** Work done on the current stage, in average-team weeks. */
  progress: number;
  /** 0-1: how big and risky the upgrade is. */
  ambition: number;
  /** What the team's tools predict, in rating points. */
  expectedGain: number;
  cost: number;
  startedWeek: number;
  circuitPackage?: CircuitPackage;
  /** Development rules 2 only (save v6). Absent under the released rules-1 kernel. */
  events?: DevelopmentEventRecord[];
  /** Rules 2: per-project correlation shift from decisions, applied once at fitting. */
  correlationAdjustment?: number;
  /** Rules 2: quality bonus points; each adds 1% to the prediction, capped at +/-25%. */
  bonusPoints?: number;
  /** Rules 2: real weeks of work lost to decisions, consumed before stage work. */
  delayWeeks?: number;
  /** Rules 2: a READY project the team keeps back from the next race weekend. */
  hold?: boolean;
};

/** One hiccup/breakthrough raised on a project stage and the decision taken (rules 2). */
export type DevelopmentEventRecord = {
  type: string;
  stage: ProjectStage;
  choice: string | null;
  defaulted: boolean;
};

export type UpgradeOutcome = 'DELIVERED' | 'UNDERPERFORMED' | 'REVERTED';

/** One line of a team's FIA-style upgrade submission at a Grand Prix. */
export type UpgradeSubmission = {
  season: number;
  week: number;
  eventId: string;
  teamId: string;
  partId: PartId;
  reason: UpgradeReason;
  description: string;
  /** Authoritative effect; hidden from the player by the UI later. */
  expectedGain: number;
  actualGain: number;
  outcome: UpgradeOutcome;
  cost: number;
};

export type TeamDevelopmentState = {
  teamId: string;
  parts: Record<PartId, PartState>;
  projects: DevelopmentProject[];
  spent: number;
  circuitPackages: CircuitPackage[];
  /** Share of baseline wind tunnel/CFD time for this season. */
  aeroAllowance: number;
  nextProjectNumber: number;
};

/** Ephemeral kernel view only. Current careers persist DevelopmentState, never these time projections. */
export type DevelopmentWorld = {
  seed: number;
  season: number;
  /** Last completed week; 0 before the season starts. */
  week: number;
  teams: Record<string, TeamDevelopmentState>;
  submissions: UpgradeSubmission[];
};

/** The only development data persisted by a current career. */
export type DevelopmentState = Omit<DevelopmentWorld, 'season' | 'week'>;

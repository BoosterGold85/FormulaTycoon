import type { DevelopmentRegulations } from './types';

export const DEVELOPMENT_REGULATIONS: DevelopmentRegulations = {
  developmentCap: 60,
  ratingFloor: 40,
  ratingCeiling: 100,
  seasonWeeks: 52,
  // Real-world sliding scale: champions get 70% of the baseline, last place 115%.
  aeroTestingAllowance: [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15]
};

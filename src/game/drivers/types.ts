import type {SourcePerformance} from './performance2026';
export const BUCKETS = ['talent', 'racecraft', 'adaptability', 'composure', 'feedback', 'marketability'] as const;
export type Bucket = typeof BUCKETS[number];
export type Abilities = Record<Bucket, number>;
export const TRAITS = ['Wet Weather Specialist', 'Qualifying Specialist', 'Tire Whisperer', 'Aggressive Defender',
  'Late Braker', 'Setup Expert', 'Technical Leader', 'Street Circuit Specialist', 'High-Speed Specialist',
  'Low-Grip Specialist', 'Comeback Racer', 'Calm Under Pressure', 'Sponsor Favorite'] as const;
export type Trait = typeof TRAITS[number];
export type CareerStage = 'ROOKIE' | 'DEVELOPING' | 'PRIME' | 'VETERAN' | 'LATE_CAREER';
export type Driver = {
  id: string; name: string; nationality: string; ageAt2026: number; stage: CareerStage;
  category: 'GRID' | 'PROSPECT' | 'RESERVE'; ability: Abilities; traits: Trait[];
  hidden: { potential: number; peakAge: number; growth: 'EARLY' | 'STEADY' | 'LATE'; decline: number };
  personality: { ambition: number; loyalty: number; patience: number; ego: number; professionalism: number; risk: number };
  dynamic: { form: number; morale: number; confidence: number; fatigue: number };
  commercial: { home: string; region: string; globalAppeal: number };
  comfort: { frontResponse: number; rearStability: number; braking: number; downforce: number };
  familiarity: { teamId: string | null; organization: number; car: number };
  sourcePerformance?: SourcePerformance;
  affiliatedTeamIds?: string[];
  experience: number; summary: string;
  history: { seasons: Array<{ season: number; teamId: string; starts: number; wins: number; podiums: number; poles: number; championships: number; points: number }>; contractIds: string[] };
};
export type DriverContract = {
  id: string; teamId: string; driverId: string; seat: 1 | 2 | null; role?: 'RACE' | 'RESERVE';
  provenance?: {status:'CONFIRMED'|'REPORTED';context:'new deal'|'2026 base'}; startSeason: number; endSeason: number;
  annualSalaryM: number; performanceBonusM: number; status: 'SIGNED' | 'EXPIRED' | 'RELEASED';
  option: null | { season: number; deadlineSeason: number; deadlineWeek: number; salaryM: number;
    state: 'PENDING' | 'EXERCISED' | 'DECLINED' | 'LAPSED' };
};
export type Observation = { precision: number; lastSeason: number; lastWeek: number; reports: number };
export type DriverWorld = {
  season: number; week: number; drivers: Record<string, Driver>; contracts: DriverContract[];
  /** Observer-owned evidence, not a duplicate true profile. */
  knowledge: Record<string, Record<string, Observation>>;
  nextContractNumber: number;
};

import type {CampaignDate} from '../campaignTime';

/**
 * Qualifying V1 (save v8). Persistent shapes only; no React values, timers or PRNG objects.
 * Session results are written once per segment and never recomputed.
 */
export type QualifyingRules = 1;
export const SEGMENTS = ['Q1', 'Q2', 'Q3'] as const;
export type Segment = typeof SEGMENTS[number];
/** Whole-minute slots per segment, cars starting each segment and cars knocked out. */
export const FORMAT: Record<Segment, { minutes: number; cars: number; out: number; offset: number }> = {
  Q1: { minutes: 18, cars: 22, out: 6, offset: 0 },
  Q2: { minutes: 15, cars: 16, out: 6, offset: 18 },
  Q3: { minutes: 12, cars: 10, out: 0, offset: 33 }
};
export const SESSION_MINUTES = 45;
/** The replay pauses for the one mid-session call at this minute of each segment. */
export const CHECKPOINT: Record<Segment, number> = { Q1: 9, Q2: 7, Q3: 6 };
/** A run is out-lap (slot s), flying lap (s + 1), in-lap (s + 2). The flying lap must start before the flag. */
export const RUN_SLOTS = 3;
/** Per-driver qualifying allowance. Intermediates are not rationed in V1. */
export const NEW_SOFT_SETS = 4;
export const MEDIUM_SETS = 1;

export type Tyre = 'NEW_SOFT' | 'USED_SOFT' | 'MEDIUM' | 'INTER';
/** What a lap actually ran on, after the allowance is applied. */
export type LapTyre = Tyre | 'USED_MEDIUM';
export type Timing = 'EARLY' | 'MIDDLE' | 'LATE';
export type Traffic = 'FIND_SPACE' | 'PUSH';
export type SegmentPlan = { tyre: Tyre; runs: 1 | 2; timing: Timing; traffic: Traffic };
export type DriverPlan = Record<Segment, SegmentPlan>;
export type CallAction = 'PLAN' | 'GO_NOW' | 'GO_LATE' | 'STAY_IN';
/** tyre: optional override for the rest of the segment (e.g. switch to inters). */
export type Call = { action: CallAction; tyre?: Tyre };

export type WeatherKind = 'DRY' | 'RAIN' | 'DRYING';
/** Actual session weather: at most one change, at a session minute (0..44). */
export type Weather = { kind: WeatherKind; changeMinute: number | null };
export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH';
/** What a team was told at FP1. It can be wrong; confidence grows with Research work. */
export type Forecast = { kind: WeatherKind; changeMinute: number | null; confidence: Confidence };

/** One timed (or failed) flying lap. time: seconds versus a nominal reference lap (gaps only are meaningful). */
export type QualifyingLap = {
  driverId: string; slot: number; tyre: LapTyre; time: number | null;
  /** Seconds lost to traffic on this lap (0 when clean). */
  traffic: number; mistake: boolean; wet: number;
};
export type SegmentResult = {
  /** The call each driver in the segment made at the checkpoint (defaulted = policy/default, not the player). */
  calls: Record<string, Call & { defaulted: boolean }>;
  laps: QualifyingLap[];
  /** Every driver in the segment, fastest first. */
  order: string[];
};
export type GridEntry = {
  position: number; driverId: string; teamId: string; time: number | null;
  /** Segment in which the driver's final position was decided. */
  segment: Segment; reasons: string[];
};
export type SessionStatus = 'PLANNING' | 'Q1_CALL' | 'Q2_CALL' | 'Q3_CALL' | 'COMPLETE';
export type QualifyingSession = {
  eventId: string;
  /** Saturday: the day after the weekend's FP1. */
  date: CampaignDate;
  status: SessionStatus;
  weather: Weather;
  forecasts: Record<string, Forecast>;
  /** Race-seat lineup at the briefing, in entry order. */
  entrants: Array<{ driverId: string; teamId: string }>;
  plans: Record<string, DriverPlan>;
  /** True once the player locks a plan; false means the player's cars run the policy plan. */
  planLocked: boolean;
  segments: Partial<Record<Segment, SegmentResult>>;
  grid: GridEntry[] | null;
};
export type QualifyingState = {
  rules: QualifyingRules;
  /** Season-to-date Research points per team: the same authoritative points the week replay shows. */
  researchPoints: Record<string, number>;
  sessions: Record<string, QualifyingSession>;
};

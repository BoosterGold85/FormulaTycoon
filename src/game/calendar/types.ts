import type {CampaignDate} from '../../simulation/campaignTime/date';

/** Shared normalized technical vocabulary. Demand is importance, not a physical measurement. */
export const TECHNICAL_AXES = ['straightLine','aeroEfficiency','lowSpeed','mediumSpeed','highSpeed',
  'traction','braking','mechanicalGrip','tyrePreservation','cooling','reliability'] as const;
export type TechnicalAxis = typeof TECHNICAL_AXES[number];
export type TechnicalVector = Record<TechnicalAxis,number>;
export type CircuitDefinition = {
  id:string; name:string; country:string; type:'STREET'|'PERMANENT'|'HYBRID';
  /** Bounded 0..1 Formula Tycoon design demands, NOT measured real-world ratings. */
  demands:TechnicalVector;
  packageContext:{downforce:'LOW'|'MEDIUM'|'HIGH';hot:boolean};
  metadata:{
    overtakingDifficulty:number;qualifyingImportance:number;safetyCarTendency:number;
    tyreSeverity:number;kerbSeverity:number;trackEvolution:number;
    altitudeM:number|null;night:boolean;rainTendency:'LOW'|'MEDIUM'|'HIGH';
  };
  /** No inferred weather/incident/altitude physics is applied by C. */
  profileStatus:'INITIAL'|'PROVISIONAL'|'CONFIRMED';
  /** External owner handoff confidence; absent on the unchanged initial v1 content. */
  profileConfidence?:'HIGH'|'MEDIUM';rationale:string;
};
export type CalendarEvent = {
  id:string;trackId:string;round:number;weekendStartDate:CampaignDate;raceDate:CampaignDate;sprint:boolean;
};
export type CalendarDefinition = {
  id:string;season:number;profileVersion:string;events:readonly CalendarEvent[];
  tracks:Readonly<Record<string,CircuitDefinition>>;
};

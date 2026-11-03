import {calendarById} from '../game/calendar';
import {isReleasedCalendarId} from '../game/calendar/releasedIds';
import type {GameDefinition} from '../simulation/universe';
import {campaignContext,compareCampaignDates,parseCampaignDate} from '../simulation/campaignTime';
import {array,choice,number,object,requireValid,text,type Check} from './validation';

/** Frozen rules-2 vocabulary for V6 (independent of the live catalogue so V6 stays stable). */
const EVENT_CHOICES:Record<string,{stage:string;choices:string[]}>={
 WIND_TUNNEL_CORRELATION:{stage:'RESEARCH',choices:['INVESTIGATE','TRUST_CFD']},
 RIG_CORRELATION:{stage:'RESEARCH',choices:['RETEST','PROCEED']},
 DESIGN_BREAKTHROUGH:{stage:'DESIGN',choices:['EXPLOIT','BANK_TIME']},
 SIMPLIFICATION:{stage:'DESIGN',choices:['KEEP_CONCEPT','SIMPLIFY']},
 PROTOTYPE_DEFECT:{stage:'MANUFACTURING',choices:['REMAKE','ACCEPT']},
 MATERIAL_SHORTAGE:{stage:'MANUFACTURING',choices:['EXPEDITE','WAIT']},
 EXTRA_SIMULATION_TIME:{stage:'RESEARCH',choices:['DECLINE_TIME','BUY_TIME']},
 RIVAL_CONCEPT:{stage:'DESIGN',choices:['STAY_COURSE','ADAPT_IDEA']},
 LIGHTWEIGHT_MATERIAL:{stage:'MANUFACTURING',choices:['STANDARD_MATERIAL','USE_LIGHTWEIGHT']},
 REFINE:{stage:'DESIGN',choices:['REFINE']}
};
const STAGES=['RESEARCH','DESIGN','MANUFACTURING','READY'];
const EXTRAS=['events','correlationAdjustment','bonusPoints','hold','delayWeeks'];

function validateExtras(project:Record<string,unknown>,path:string,rules:number):Record<string,unknown> {
 const present=EXTRAS.filter(k=>Object.hasOwn(project,k));
 if(rules===1){requireValid(present.length===0,`${path}.rules1`);return project;}
 const stage=STAGES.indexOf(project.stage as string);
 requireValid(stage>=0,`${path}.stage`);
 if(present.some(k=>k!=='hold'&&k!=='delayWeeks'))requireValid(project.reason==='PERFORMANCE',`${path}.reason`);
 if(Object.hasOwn(project,'hold'))requireValid(project.hold===true,`${path}.hold`);
 if(Object.hasOwn(project,'delayWeeks'))number(Number.MIN_VALUE,20)(project.delayWeeks,`${path}.delayWeeks`);
 if(Object.hasOwn(project,'bonusPoints'))number(-60,60)(project.bonusPoints,`${path}.bonusPoints`);
 if(Object.hasOwn(project,'correlationAdjustment'))number(-60,60)(project.correlationAdjustment,`${path}.correlationAdjustment`);
 if(Object.hasOwn(project,'events')){
  const record:Check=object({type:choice(Object.keys(EVENT_CHOICES)),stage:choice(STAGES.slice(0,3)),choice:v=>{if(v!==null)text(v,`${path}.choice`);},defaulted:v=>requireValid(typeof v==='boolean',`${path}.defaulted`)});
  array(record)(project.events,`${path}.events`);
  const events=project.events as Array<{type:string;stage:string;choice:string|null;defaulted:boolean}>;
  requireValid(events.length>0,`${path}.events.empty`);
  const seen=new Set<string>();
  for(const e of events){
   const spec=EVENT_CHOICES[e.type]!;
   requireValid(e.stage===spec.stage&&STAGES.indexOf(e.stage)<=stage,`${path}.events.stage`);
   requireValid(e.choice===null?!e.defaulted:spec.choices.includes(e.choice),`${path}.events.choice`);
   const key=e.type==='REFINE'?'REFINE':e.stage;
   requireValid(!seen.has(key),`${path}.events.duplicate`);seen.add(key);
  }
  requireValid(events.filter(e=>e.choice===null).length<=1,`${path}.events.pending`);
 }
 const copy={...project};for(const k of EXTRAS)delete copy[k];return copy;
}

/** Validates V6-only facts and returns the V5-shaped projection for the shared structural rules.
 * Released V6 semantics: rules 1 or 2 only. */
export function validateDevelopmentRulesV6(raw:Record<string,unknown>,definition:GameDefinition):Record<string,unknown> {
 requireValid(raw.developmentRules===1||raw.developmentRules===2,'universe.developmentRules');
 return validateRules(raw,definition);
}
/** V7 adds rules 3 (rules 2 + passive weekly variation). Variation writes only existing rules-2 project
 * fields (progress, bonusPoints), so rules-3 projects share the frozen rules-2 vocabulary and bounds. */
export function validateDevelopmentRulesV7(raw:Record<string,unknown>,definition:GameDefinition):Record<string,unknown> {
 requireValid(raw.developmentRules===1||raw.developmentRules===2||raw.developmentRules===3,'universe.developmentRules');
 return validateRules(raw,definition);
}
function validateRules(raw:Record<string,unknown>,definition:GameDefinition):Record<string,unknown> {
 const {developmentRules:rules,...rest}=raw;
 const development=rest.development as Record<string,any>;
 requireValid(development&&typeof development==='object'&&!Array.isArray(development),'development');
 requireValid(development.teams&&typeof development.teams==='object'&&Array.isArray(development.submissions),'development.shape');
 const teams:Record<string,unknown>={};
 for(const [id,team] of Object.entries(development.teams as Record<string,any>)){
  requireValid(team&&typeof team==='object'&&Array.isArray(team.projects),`team.${id}`);
  teams[id]={...team,projects:team.projects.map((p:any,i:number)=>{requireValid(p&&typeof p==='object'&&!Array.isArray(p),`team.${id}.project`);return validateExtras(p,`team.${id}.projects[${i}]`,rules as number);})};
 }
 if(rules!==1)validateWeekendSubmissions(development.submissions,rest,definition);
 return {...rest,development:{...development,teams,submissions:rules!==1?[]:development.submissions}};
}

/** Rules 2 fits at the career's own race weekends: identity is the pinned calendar's event ID. */
function validateWeekendSubmissions(submissions:unknown[],root:Record<string,unknown>,definition:GameDefinition):void {
 requireValid(isReleasedCalendarId(root.calendarId),'universe.calendarId');
 const calendar=calendarById(root.calendarId as string),current=parseCampaignDate(root.currentDate);
 const context=definition.development;
 const shape=object({season:number(1,Number.MAX_SAFE_INTEGER,true),week:number(0,context.regulations.seasonWeeks,true),
  eventId:choice(calendar.events.map(e=>e.id)),teamId:choice(context.teams.map(t=>t.id)),partId:choice(context.parts.map(p=>p.id)),
  reason:choice(['PERFORMANCE','CIRCUIT_SPECIFIC','RELIABILITY']),description:text,expectedGain:number(-1e6,1e6),actualGain:number(-1e6,1e6),
  outcome:choice(['DELIVERED','UNDERPERFORMED','REVERTED']),cost:number()});
 const keys=new Set<string>();
 submissions.forEach((s,i)=>{
  shape(s,`development.submissions[${i}]`);
  const sub=s as {season:number;week:number;eventId:string;teamId:string;partId:string};
  const event=calendar.events.find(e=>e.id===sub.eventId)!;
  const time=campaignContext(event.weekendStartDate);
  requireValid(sub.season===time.seasonIndex&&sub.week===time.week,`development.submissions[${i}].event`);
  requireValid(compareCampaignDates(event.weekendStartDate,current)<=0,`development.submissions[${i}].future`);
  const key=`${sub.eventId}:${sub.teamId}:${sub.partId}`;
  requireValid(!keys.has(key),`development.submissions[${i}].duplicate`);keys.add(key);
 });
}

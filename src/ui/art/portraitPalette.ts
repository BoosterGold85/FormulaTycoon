import {teamBrand} from '../../game/brandRegistry';

export type PortraitColors = {primary:string; secondary:string; accent?:string; background?:string};
export const PORTRAIT_VISOR = '#20222A';
const WHITE = '#FFFFFF';
const NEUTRAL = {primary:'#9DAEBB', secondary:'#354553', accent:WHITE};

function luminance(hex:string):number {
 const rgb=[1,3,5].map(start=>parseInt(hex.slice(start,start+2),16)/255)
  .map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
 return rgb[0]!*.2126+rgb[1]!*.7152+rgb[2]!*.0722;
}
function contrast(a:string,b:string):number {
 const x=luminance(a),y=luminance(b);
 return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
/** Registry uses six-digit RGB. This is an art-region fallback, not a new canonical palette. */
export function resolvePortraitColors(colors:PortraitColors) {
 const secondary=contrast(colors.primary,colors.secondary)<1.8
  ? (contrast(colors.primary,WHITE)>=contrast(colors.primary,PORTRAIT_VISOR)?WHITE:PORTRAIT_VISOR)
  : colors.secondary;
 return {primary:colors.primary,secondary,accent:colors.accent??WHITE,
  background:colors.background??'#172B3B',visor:PORTRAIT_VISOR};
}
/** Always resolve CURRENT employment supplied by the existing disclosure DTO. No saved/cached art. */
export function portraitColorsForTeam(teamId:string|null):PortraitColors {
 return teamId===null?NEUTRAL:teamBrand(teamId).colors;
}

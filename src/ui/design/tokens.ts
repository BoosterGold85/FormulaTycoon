/** Semantic presentation only. Team identities and game state never depend on these values. */
const shell={navBackground:'#111D2A',navSurface:'#1E2D3E',navText:'#F6F2E9',navMuted:'#B4C0CD',navBorder:'#304154',navSelected:'#402631',navAccent:'#FF6975'};
const common={...shell,accent:'#B51E30',onAccent:'#FFFFFF',artGold:'#EDC475',space:{xs:4,sm:8,md:12,lg:18,xl:24,xxl:32},type:{caption:11,small:12,body:14,heading:20,title:30,hero:36}};
export const THEMES={
 light:{...common,mode:'light' as const,background:'#F2EBDD',surface:'#FAF6EE',surfaceElevated:'#E9E1D3',textPrimary:'#152334',textSecondary:'#4E5D6C',border:'#D5CBBA',accentMuted:'#F5DADD',success:'#176544',warning:'#795311',danger:'#A32135',shadow:'#493B28',hero:'#F8F1E5',chip:'#EAE3D7',weekend:'#E3E9EC',nextWeekend:'#CEDCE5',completed:'#E7E2D9',artBackground:'#E5DED0',artShadow:'#D1C6B3',overlay:'#FAF6EE',environment:'#0E1621'},
 dark:{...common,mode:'dark' as const,accent:'#F78D97',onAccent:'#17202C',background:'#0B121D',surface:'#142131',surfaceElevated:'#1D2E42',textPrimary:'#F5EFE3',textSecondary:'#A8B8C9',border:'#3D5267',accentMuted:'#402631',success:'#83D8B5',warning:'#EDC475',danger:'#F0999E',shadow:'#000000',hero:'#172A3B',chip:'#1A2C3D',weekend:'#263E52',nextWeekend:'#22394E',completed:'#29333D',artBackground:'#172B3B',artShadow:'#080F18',overlay:'#142131',environment:'#0E1621'}
};
export type ThemeMode=keyof typeof THEMES;
export function themeTokens(mode:ThemeMode){
 const t=THEMES[mode];
 // Compatibility names resolve to the same semantic source, never a second palette.
 return {...t,bg:t.background,panel:t.surface,raised:t.surfaceElevated,line:t.border,ink:t.textPrimary,muted:t.textSecondary,
  gold:t.warning,green:t.success,red:t.danger,text:t.textPrimary,textMuted:t.textSecondary,panelBorder:t.border};
}
export type VisualTheme=ReturnType<typeof themeTokens>;

/** Text-only contrast correction; canonical team colors used by artwork remain untouched. */
export function readableTeamInk(color:string,theme:VisualTheme):string {
 const channels=(h:string)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 const luminance=(h:string)=>{
  const c=channels(h).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
  return c[0]!*.2126+c[1]!*.7152+c[2]!*.0722;
 };
 const backgrounds=[theme.background,theme.surface,theme.hero,theme.surfaceElevated].map(luminance),source=channels(color),target=channels(theme.textPrimary);
 for(let step=0;step<=10;step++){
  const ink='#'+source.map((v,i)=>Math.round(v+(target[i]!-v)*step/10).toString(16).padStart(2,'0')).join('');
  const l=luminance(ink);
  if(backgrounds.every(bg=>(Math.max(l,bg)+.05)/(Math.min(l,bg)+.05)>=4.5))return ink;
 }
 return theme.textPrimary;
}

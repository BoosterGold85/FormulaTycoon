import React,{useState} from 'react';
import {Platform,Text,TextInput,View} from 'react-native';
import type {NavTab} from '../game/hudPlaceholders';
import {Action,Card,Chip,Section,Screen,useDesign} from './design/system';
import {DEFAULT_PACK,DEFAULT_ROSTER,cosmeticOnly,toCosmeticPack,parseRosterPack,planRosterApplication,type PackError,type ResolvedRoster,type RosterPack} from '../game/roster';
import {PackPreview} from './roster/PackPreview';
import {PackFileButton,downloadText} from './roster/PackFileButton';

type Checked={source:string;result:ReturnType<typeof parseRosterPack>};
export type RosterPackActions={
 /** Display-only change to the running career. */
 applyCosmetic:(pack:RosterPack,roster:ResolvedRoster)=>void;
 /** Ends the running career and starts a fresh one built from the pack. */
 startNewCareer:(pack:RosterPack|null,roster:ResolvedRoster)=>void;
 reset:()=>void;
};

/** Settings: import, validate, preview and apply a roster pack. The rules live in game/roster/policy. */
export function RosterPackScreen({display,careerRoster,actions,onClose,tab,onNavigate}:{display:ResolvedRoster;careerRoster:ResolvedRoster|undefined;
 actions:RosterPackActions;onClose:()=>void;tab:NavTab;onNavigate:(tab:NavTab)=>void}){
 const {ui,styles}=useDesign();
 const [paste,setPaste]=useState('');
 const [checked,setChecked]=useState<Checked|null>(null);
 const [confirm,setConfirm]=useState<'pack'|'default'|null>(null);
 const [notice,setNotice]=useState<string|null>(null);
 const check=(text:string,source:string)=>{setNotice(null);setConfirm(null);setChecked({source,result:parseRosterPack(text)});};
 const fail=(message:string)=>{setNotice(null);setChecked({source:'File',result:{ok:false,errors:[{path:'',where:'File',message}]}});};
 const ok=checked?.result.ok?checked.result:null;
 const applyCosmetic=()=>{if(!ok)return;const plan=planRosterApplication(ok.roster,'CURRENT_CAREER');
  if(!plan.ok){setNotice(plan.reason);return;}
  actions.applyCosmetic(ok.pack,plan.display);setNotice(`Now showing "${ok.roster.packName}". Your career, results and stats are unchanged.`);};
 const applyNamesOnly=()=>{if(!ok)return;actions.applyCosmetic(toCosmeticPack(ok.pack),cosmeticOnly(ok.roster));
  setNotice(`Now showing the names and colours from "${ok.roster.packName}". Stats were not applied.`);};
 const startCareer=()=>{if(!ok)return;actions.startNewCareer(ok.pack,ok.roster);setConfirm(null);
  setNotice(`New career started with "${ok.roster.packName}".`);};
 const startDefault=()=>{actions.startNewCareer(null,DEFAULT_ROSTER);setConfirm(null);setNotice('New career started with the default roster.');};
 const fullCareer=careerRoster&&!careerRoster.isDefault?careerRoster:null;
 return <Screen title="Roster packs" kicker="SETTINGS / ROSTER" subtitle="Rename the grid with your own teams and drivers. The game always ships with its fictional default roster." tab={tab} onNavigate={onNavigate}>
  <Action secondary label="Back to game" onPress={onClose}/>
  <Card style={{gap:8}} accessibilityLabel="Roster in use">
   <Section title="In use"/>
   <View style={styles.between}><Text style={[styles.heading,{fontSize:18,flex:1}]}>{display.packName}</Text><Chip text={display.isDefault?'DEFAULT':display.type==='full'&&fullCareer?'FULL PACK':'COSMETIC'} tone={display.isDefault?'muted':'green'}/></View>
   <Text style={styles.muted}>Career stats: {fullCareer?`"${fullCareer.packName}" (full pack, set when this career started)`:'default roster'}.</Text>
   {!display.isDefault?<Action secondary label="Reset to default roster" onPress={()=>{actions.reset();setNotice(fullCareer
    ?'Default names and colours restored. This career keeps the stats it started with; start a new career to use the default stats too.'
    :'Default roster restored.');}}/>:null}
   {fullCareer?confirm==='default'
    ?<Confirm text="This ends your current career and starts a new one with the default roster and default stats." onYes={startDefault} onNo={()=>setConfirm(null)} yes="End career and start new"/>
    :<Action secondary label="Start a new career with the default roster" onPress={()=>setConfirm('default')}/>:null}
  </Card>
  {notice?<Card accent={ui.green} style={{gap:4}}><Text accessibilityLiveRegion="polite" style={styles.body}>{notice}</Text></Card>:null}
  <Card style={{gap:10}}>
   <Section title="Import a pack"/>
   <Text style={styles.muted}>A pack is one .json file. Cosmetic packs change names, colours, numbers and helmets, and can be applied to this career. Full packs can also change stats, which only take effect in a new career.</Text>
   <PackFileButton onText={(text,name)=>check(text,name)} onError={fail}/>
   <Text style={[styles.eyebrow,{marginTop:4}]}>Or paste pack JSON</Text>
   <TextInput value={paste} onChangeText={setPaste} multiline placeholder='{"format": "formula-tycoon-roster-pack", ...}' placeholderTextColor={ui.muted}
    accessibilityLabel="Pack JSON" autoCapitalize="none" autoCorrect={false} spellCheck={false}
    style={{minHeight:96,maxHeight:220,borderWidth:1,borderColor:ui.line,borderRadius:6,padding:10,color:ui.ink,backgroundColor:ui.raised,fontFamily:Platform.OS==='web'?'monospace':undefined,fontSize:12}}/>
   <Action secondary label="Check pasted pack" onPress={()=>check(paste,'Pasted text')}/>
   {Platform.OS==='web'?<Action secondary label="Download the default pack" onPress={()=>downloadText('formula-tycoon-default-roster.json',JSON.stringify(DEFAULT_PACK,null,2)+'\n')}/>:null}
  </Card>
  {checked&&!checked.result.ok?<PackErrors source={checked.source} errors={checked.result.errors}/>:null}
  {ok?<>
   <PackPreview roster={ok.roster}/>
   <Card hero style={{gap:10}} accessibilityLabel="Apply pack">
    <Section title="Apply"/>
    {ok.roster.type==='cosmetic'
     ?<><Text style={styles.muted}>Changes what you see in this career. Results, stats and your save stay exactly the same.</Text>
       <Action label="Apply to this career" onPress={applyCosmetic}/></>
     :<><Text style={styles.muted}>Full packs change driver stats, so they never apply mid-season. Start a new career to use them, or apply only the names and colours here.</Text>
       {confirm==='pack'
        ?<Confirm text={`This ends your current career and starts a new one with "${ok.roster.packName}".`} onYes={startCareer} onNo={()=>setConfirm(null)} yes="End career and start new"/>
        :<Action label="Start a new career with this pack" onPress={()=>setConfirm('pack')}/>}
       <Action secondary label="Apply names and colours only" onPress={applyNamesOnly}/></>}
   </Card>
  </>:null}
 </Screen>;
}
function Confirm({text,yes,onYes,onNo}:{text:string;yes:string;onYes:()=>void;onNo:()=>void}){const {ui,styles}=useDesign();
 return <View style={{gap:8,borderWidth:1,borderColor:ui.red,borderRadius:6,padding:10}}><Text style={styles.body}>{text}</Text>
  <Action label={yes} onPress={onYes}/><Action secondary label="Cancel" onPress={onNo}/></View>;
}
function PackErrors({source,errors}:{source:string;errors:PackError[]}){const {ui,styles}=useDesign();
 return <Card accent={ui.red} style={{gap:8}} accessibilityLabel="Pack problems">
  <Text accessibilityRole="header" style={[styles.heading,{fontSize:18}]}>This pack can't be used yet</Text>
  <Text style={styles.muted}>{source}: {errors.length} problem{errors.length===1?'':'s'} found. Nothing was changed.</Text>
  {errors.slice(0,40).map((e,i)=><View key={i} style={{borderTopWidth:1,borderTopColor:ui.line,paddingTop:6,gap:2}}>
   <Text style={{color:ui.red,fontWeight:'800',fontSize:12}}>{e.where}</Text>
   <Text style={styles.body}>{e.message}</Text>
   {e.path?<Text style={[styles.muted,{fontSize:11,fontFamily:Platform.OS==='web'?'monospace':undefined}]}>{e.path}</Text>:null}
  </View>)}
  {errors.length>40?<Text style={styles.muted}>…and {errors.length-40} more.</Text>:null}
 </Card>;
}

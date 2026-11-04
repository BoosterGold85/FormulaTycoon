import React from 'react';
import {Pressable,Text,View} from 'react-native';
import {formatCampaignDate,weekday} from '../../simulation/campaignTime';
import type {TurnTarget} from '../../simulation/developmentLoop';
import {useTheme} from '../theme';

export type TurnControlsProps={target:TurnTarget|null;pendingDecisions:number;onContinue:()=>void;onNextDay:()=>void;playing?:boolean;blocked?:number;
 /** Qualifying weekend step: a call is waiting (LIVE). */
 qualifyingCall?:boolean};
/** Campaign controls in the shared dark shell. They only dispatch the domain turn/day commands. */
export function TurnControls({target,pendingDecisions,onContinue,onNextDay,playing=false,blocked=0,qualifyingCall=false,compact=false}:TurnControlsProps&{compact?:boolean}){
 const {theme:t}=useTheme();
 if(!target)return <Text style={{color:t.navMuted,fontSize:11,fontWeight:'800',maxWidth:140}}>Season complete · review not available yet</Text>;
 const when=`${weekday(target.date).slice(0,3)} ${formatCampaignDate(target.date).replace(/, \d{4}$/,'')}`;
 const sub=qualifyingCall?'Your call':target.kind==='FP1'?`${target.venue} FP1`:target.kind==='QUALIFYING'?`${target.venue} · ${when}`:when;
 const label=playing?'WORKING…':blocked?'DECISION REQUIRED':qualifyingCall?'QUALIFYING LIVE':target.kind==='FP1'?'CONTINUE TO FP1':target.kind==='QUALIFYING'?'PLAN QUALIFYING':'CONTINUE WEEK';
 const spoken=qualifyingCall?'Qualifying is waiting for your call':target.kind==='FP1'?`Continue to ${target.venue} first practice`:target.kind==='QUALIFYING'?`Plan ${target.venue} qualifying`:'Continue week';
 return <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
  {!compact?<Pressable accessibilityRole="button" accessibilityLabel="Next day" onPress={onNextDay} style={{minHeight:44,paddingHorizontal:10,justifyContent:'center',borderRadius:6,borderWidth:1,borderColor:t.navBorder,backgroundColor:t.navSurface}}>
   <Text style={{color:t.navText,fontSize:11,fontWeight:'800'}}>+1 DAY</Text></Pressable>:null}
  <Pressable accessibilityRole="button" accessibilityState={{disabled:playing}} disabled={playing} accessibilityLabel={playing?'The team is working':blocked?'Decision required before continuing':`${spoken}, ${when}`} testID="turn-continue" onPress={onContinue}
   style={{minHeight:44,minWidth:96,paddingHorizontal:12,justifyContent:'center',borderRadius:6,backgroundColor:blocked&&!playing?t.artGold:t.accent,opacity:playing?.55:1}}>
   <Text style={{color:blocked&&!playing?'#17202C':t.onAccent,fontSize:12,fontWeight:'900'}}>{label}</Text>
   <Text numberOfLines={1} style={{color:blocked&&!playing?'#17202C':t.onAccent,fontSize:10,fontWeight:'700',opacity:.9}}>{blocked&&!playing?'Answer to continue':sub}</Text>
   {pendingDecisions?<View accessibilityLabel={`${pendingDecisions} development decisions waiting`} style={{position:'absolute',top:-6,right:-6,minWidth:20,height:20,borderRadius:10,backgroundColor:t.artGold,alignItems:'center',justifyContent:'center',paddingHorizontal:4}}>
    <Text style={{color:'#17202C',fontSize:11,fontWeight:'900'}}>{pendingDecisions}</Text></View>:null}
  </Pressable>
 </View>;
}

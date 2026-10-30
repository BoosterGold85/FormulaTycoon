import React from 'react';
import {Pressable,Text,View,useWindowDimensions} from 'react-native';
import {weekday,formatCampaignDate,type CampaignDate} from '../../simulation/campaignTime';
import {useTheme} from '../theme';
/** Shared dark racing shell. Date/event are supplied by the unchanged domain selectors. */
export function GameHud({currentDate,nextEvent}:{currentDate:CampaignDate;nextEvent:{venue:string;detail:string}}){
 const {theme:t,setMode}=useTheme(),wide=useWindowDimensions().width>=1000;
 return <View style={{backgroundColor:t.navBackground,borderBottomWidth:1,borderColor:t.navBorder,paddingHorizontal:wide?28:16,paddingVertical:8,gap:5}}>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12}}>
   <Text style={{color:t.navText,fontSize:wide?27:19,fontWeight:'900',fontStyle:'italic',letterSpacing:.7}}>FORMULA <Text style={{color:t.navAccent}}>TYCOON</Text></Text>
   {wide?<View style={{flexDirection:'row',gap:28,alignItems:'center'}}><DateSummary currentDate={currentDate}/><EventSummary nextEvent={nextEvent}/></View>:null}
   <Pressable accessibilityRole="button" accessibilityLabel={`Switch to ${t.mode==='light'?'dark':'light'} theme`}
    onPress={()=>setMode(t.mode==='light'?'dark':'light')}
    style={{minWidth:64,minHeight:44,paddingHorizontal:10,justifyContent:'center',alignItems:'center',borderRadius:6,backgroundColor:t.navSurface,borderWidth:1,borderColor:t.navBorder}}>
    <Text style={{color:t.navText,fontSize:11,fontWeight:'800'}}>{t.mode==='light'?'DARK':'LIGHT'}</Text>
   </Pressable>
  </View>
  {!wide?<View style={{flexDirection:'row',justifyContent:'space-between',gap:12}}><DateSummary currentDate={currentDate}/><EventSummary nextEvent={nextEvent}/></View>:null}
 </View>;
}
function DateSummary({currentDate}:{currentDate:CampaignDate}){
 const {theme:t}=useTheme();return <View style={{gap:2}}><Text style={{color:t.navText,fontSize:11}}>{weekday(currentDate)}</Text><Text style={{color:t.navMuted,fontSize:11}}>{formatCampaignDate(currentDate)}</Text></View>;
}
function EventSummary({nextEvent}:{nextEvent:{venue:string;detail:string}}){
 const {theme:t}=useTheme();return <View style={{gap:2}}><Text style={{color:t.navText,fontSize:11,fontWeight:'800'}}>{nextEvent.venue}</Text><Text style={{color:t.navMuted,fontSize:11}}>{nextEvent.detail}</Text></View>;
}

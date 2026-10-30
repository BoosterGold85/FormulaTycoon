import React from 'react';
import {Pressable,Text,View,useWindowDimensions} from 'react-native';
import {NAV_TABS,type NavTab} from '../../game/hudPlaceholders';
import {useTheme} from '../theme';
import {Icon} from '../design/Icon';
type Props={active:NavTab;onSelect:(tab:NavTab,available:boolean)=>void;sidebar?:boolean};
/** Same navigation model; sidebar on wide screens, bottom strip on phones. */
export function BottomNav({active,onSelect,sidebar=false}:Props){
 const {theme:t}=useTheme(),{width}=useWindowDimensions();
 if(sidebar?width<1000:width>=1000)return null;
 return <View style={{flexDirection:sidebar?'column':'row',width:sidebar?170:undefined,
  borderTopWidth:sidebar?0:1,borderRightWidth:sidebar?1:0,borderColor:t.navBorder,
  backgroundColor:t.navBackground,paddingTop:sidebar?24:8,paddingHorizontal:8,gap:sidebar?10:4,paddingBottom:6}}>
  {NAV_TABS.map(tab=>{
   const selected=tab.id===active;
   return <Pressable key={tab.id} onPress={()=>onSelect(tab.id,tab.available)} accessibilityRole="tab"
    accessibilityLabel={tab.label} accessibilityState={{selected,disabled:!tab.available}}
    style={{flex:sidebar?undefined:1,minHeight:54,flexDirection:sidebar?'row':'column',gap:sidebar?14:0,
     alignItems:'center',justifyContent:sidebar?'flex-start':'center',paddingHorizontal:sidebar?16:0,paddingVertical:7,
     borderRadius:6,backgroundColor:selected?t.navSelected:'transparent',borderLeftWidth:sidebar&&selected?3:0,
     borderTopWidth:!sidebar&&selected?2:0,borderColor:t.navAccent}}>
    <Icon name={tab.id} size={19} color={selected?t.navAccent:t.navMuted}/>
    <Text style={{color:selected?t.navAccent:t.navText,fontSize:11,fontWeight:'900',letterSpacing:.6}}>{tab.label}</Text>
   </Pressable>;
  })}
 </View>;
}

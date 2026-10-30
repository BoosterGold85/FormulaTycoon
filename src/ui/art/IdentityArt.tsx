import React from 'react';
import {View,Text} from 'react-native';
import {ui} from '../design/system';

/** Original identity graphics: initials and helmets, never generated driver likenesses. */
export function DriverIdentity({name,color=ui.accent,large=false}:{name:string;color?:string;large?:boolean}){
 const initials=name.split(' ').map(n=>n[0]).join('').slice(0,2),size=large?104:50;
 return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{width:size,height:size,backgroundColor:'#22364A',borderRadius:large?20:12,overflow:'hidden',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:color}}>
  <View style={{position:'absolute',width:size*.65,height:size*.62,backgroundColor:color,borderRadius:size*.3,top:size*.14,transform:[{rotate:'-12deg'}]}}/>
  <View style={{position:'absolute',width:size*.65,height:size*.17,backgroundColor:'#0C1723',top:size*.37,borderRadius:3,transform:[{rotate:'-12deg'}]}}/>
  <Text style={{position:'absolute',bottom:large?6:2,right:6,fontWeight:'900',color:ui.ink,fontSize:large?22:12}}>{initials}</Text>
 </View>;
}
export function CarArt({color=ui.accent}:{color?:string}){
 return <View accessibilityLabel="Original racing car illustration" style={{height:116,width:'100%',alignItems:'center',justifyContent:'center'}}>
  <View style={{position:'absolute',width:240,height:24,borderRadius:40,backgroundColor:'#080F18',top:77,transform:[{rotate:'-5deg'}]}}/>
  <View style={{width:230,height:80,transform:[{rotate:'-5deg'}]}}>
   {[25,167].map(x=><React.Fragment key={x}><View style={{position:'absolute',left:x,top:3,width:32,height:22,borderRadius:5,backgroundColor:'#060C13',borderWidth:2,borderColor:'#354859'}}/><View style={{position:'absolute',left:x,top:57,width:32,height:22,borderRadius:5,backgroundColor:'#060C13',borderWidth:2,borderColor:'#354859'}}/></React.Fragment>)}
   <View style={{position:'absolute',top:27,left:20,width:184,height:30,borderRadius:16,backgroundColor:color,transform:[{skewX:'-12deg'}]}}/>
   <View style={{position:'absolute',left:68,top:20,width:76,height:42,borderRadius:18,backgroundColor:color,borderWidth:2,borderColor:'#A3D1F0'}}/>
   <View style={{position:'absolute',left:100,top:29,width:22,height:25,borderRadius:14,backgroundColor:'#0A1520',borderWidth:3,borderColor:'#CDDBDE'}}/>
   <View style={{position:'absolute',left:205,top:18,width:12,height:48,borderRadius:2,backgroundColor:'#CDDDE8'}}/>
   <View style={{position:'absolute',left:10,top:17,width:15,height:49,borderRadius:2,backgroundColor:color}}/>
   <View style={{position:'absolute',left:144,top:39,width:58,height:5,backgroundColor:'#D9E9F1'}}/>
  </View>
 </View>;
}
export function GarageArt(){return <View style={{height:72,justifyContent:'center',alignItems:'center'}}><View style={{width:120,height:55,backgroundColor:'#2B4355',borderTopWidth:6,borderTopColor:ui.accent,transform:[{skewY:'-8deg'}],flexDirection:'row',gap:9,padding:10}}>{[1,2,3].map(n=><View key={n} style={{flex:1,backgroundColor:'#0B1924',borderTopWidth:3,borderColor:'#79A5BE'}}/>)}</View></View>;}
export function TrophyArt(){return <View style={{height:145,width:160,alignItems:'center',justifyContent:'center'}}><View style={{position:'absolute',top:25,width:108,height:52,borderWidth:7,borderColor:'#9C8050',borderRadius:22}}/><View style={{width:68,height:65,backgroundColor:ui.gold,borderBottomLeftRadius:28,borderBottomRightRadius:28,borderTopWidth:5,borderTopColor:'#F9DCA1'}}/><View style={{width:13,height:22,backgroundColor:'#CFA35A'}}/><View style={{width:74,height:13,borderRadius:4,backgroundColor:'#8E744D'}}/></View>;}

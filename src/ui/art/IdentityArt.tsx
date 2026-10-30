import React from 'react';
import {View,Text} from 'react-native';
import {ui} from '../design/system';

/** Original identity graphics: initials and helmets, never generated driver likenesses. */
export function DriverIdentity({name,color=ui.accent,large=false,size:requestedSize}:{name:string;color?:string;large?:boolean;size?:number}){
 const initials=name.split(' ').map(n=>n[0]).join('').slice(0,2),size=requestedSize??(large?140:50);
 const stripe=[...name].reduce((sum,char)=>sum+char.charCodeAt(0),0)%3===0;
 return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{width:size,height:size,justifyContent:'center',alignItems:'center'}}>
  <View style={{position:'absolute',width:size*.9,height:size*.17,borderRadius:size*.2,backgroundColor:'#07101A',bottom:size*.08}}/>
  <View style={{position:'absolute',width:size*.84,height:size*.75,backgroundColor:color,borderTopLeftRadius:size*.42,borderTopRightRadius:size*.4,borderBottomLeftRadius:size*.24,borderBottomRightRadius:size*.17,top:size*.07,transform:[{rotate:'-12deg'}],borderTopWidth:size*.035,borderTopColor:'#D6E7EE'}}/>
  <View style={{position:'absolute',width:size*.24,height:size*.65,backgroundColor:'#E5EAD9',opacity:.8,left:size*.39,top:size*.13,transform:[{rotate:stripe?'-14deg':'18deg'}]}}/>
  <View style={{position:'absolute',width:size*.84,height:size*.2,backgroundColor:'#0A1925',top:size*.37,borderRadius:size*.06,transform:[{rotate:'-12deg'}],borderTopWidth:size*.025,borderTopColor:'#91B6C8'}}/>
  <View style={{position:'absolute',width:size*.3,height:size*.03,backgroundColor:'#426077',top:size*.4,right:size*.2,transform:[{rotate:'-12deg'}]}}/>
  <Text style={{position:'absolute',bottom:size*.12,right:size*.1,fontWeight:'900',color:ui.ink,fontSize:size*.22}}>{initials}</Text>
 </View>;
}
export function CarArt({color=ui.accent,compact=false}:{color?:string;compact?:boolean}){
 return <View accessibilityLabel="Original racing car illustration" style={{height:compact?84:116,width:compact?150:'100%',alignItems:'center',justifyContent:'center'}}>
  <View style={{position:'absolute',width:compact?150:240,height:compact?16:24,borderRadius:40,backgroundColor:'#080F18',top:compact?57:77,transform:[{rotate:'-5deg'}]}}/>
  <View style={{width:230,height:80,transform:[{rotate:'-5deg'},{scale:compact?.64:1}]}}>
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

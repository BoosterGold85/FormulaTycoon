import React from 'react';
import {Text,View} from 'react-native';
import {styles,ui} from '../design/system';

/** Factory artwork and current-stage disclosure only; all progress is supplied by the read model. */
export function WorkshopArt(){return <View accessible={false} style={{width:76,height:64,justifyContent:'center',alignItems:'center'}}>
 <View style={{position:'absolute',width:60,height:32,top:9,backgroundColor:'#254357',transform:[{skewY:'-12deg'}],borderTopWidth:2,borderTopColor:'#7299AF'}}/>
 <View style={{position:'absolute',width:46,height:9,top:21,left:18,backgroundColor:'#9FB9C8',transform:[{rotate:'-12deg'}]}}/>
 <View style={{width:72,height:7,backgroundColor:'#567589',top:15}}/>
 <View style={{position:'absolute',width:5,height:19,backgroundColor:'#304A5C',left:10,bottom:1}}/>
 <View style={{position:'absolute',width:5,height:19,backgroundColor:'#304A5C',right:10,bottom:1}}/>
 </View>;}
export function DevelopmentSummary({project}:{project:{name:string;stage:string;progress:number}}){
 return <View style={{gap:12,paddingVertical:12}}>
  <View style={styles.row}><View style={{flex:1,gap:5}}><Text style={styles.heading}>{project.name}</Text><Text style={styles.muted}>{project.stage} · {project.progress}% of current stage</Text></View><WorkshopArt/></View>
  <View accessibilityLabel={`${project.progress}% of current stage`} style={{height:5,backgroundColor:ui.line}}><View style={{width:`${project.progress}%`,height:5,backgroundColor:ui.accent}}/></View>
  <View style={styles.between}>{(['RESEARCH','DESIGN','MANUFACTURING','READY'] as const).map(stage=><Text key={stage} style={{fontSize:10,fontWeight:'800',color:project.stage===stage?ui.accent:ui.muted}}>{stage==='MANUFACTURING'?'MANUFACTURE':stage}</Text>)}</View>
 </View>;
}

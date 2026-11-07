import React,{useMemo,useState} from 'react';
import {Animated,Text,View} from 'react-native';
import type {TowerRow} from '../../simulation/qualifying';
import {circuitOutline} from '../art/CircuitArt';
import {useDesign} from '../design/system';
import {doubleLoopRanges,loopPath,outlineAspect,pointAt,type LoopPath} from './trackGeometry';

/** Tracks whose live map has been reviewed. Melbourne first, by owner request; others follow after review. */
export const LIVE_MAP_TRACKS=new Set(['track.melbourne']);
const STAGGER=.014,PAD=24;

/**
 * Live track map. Each car sits where the stored replay puts it (laps since leaving the pits at the shown beat,
 * a sector per beat) and glides toward the next beat while the replay plays. The glide is presentation only and
 * never runs past the next beat. Stylized outline, not a surveyed layout; sectors are equal thirds of the lap.
 */
export function TrackMap({trackId,rows,progress}:{trackId:string;rows:TowerRow[];progress:Animated.Value}){
 const {ui,styles}=useDesign();
 const [box,setBox]=useState(0),outline=circuitOutline(trackId);
 // At most 380 wide and 260 tall, so the tower stays in reach on a phone; padding leaves room for dots and labels.
 const aspect=outlineAspect(outline),width=Math.round(Math.min(box,380,(260-2*PAD)/aspect+2*PAD)),height=Math.round((width-2*PAD)*aspect)+2*PAD;
 const path=useMemo(()=>width?loopPath(outline,width-2*PAD,height-2*PAD):null,[outline,width,height]);
 const ranges=useMemo(()=>path?doubleLoopRanges(path):null,[path]);
 if(!LIVE_MAP_TRACKS.has(trackId))return null;
 // Cars that left in the same minute share a beat position: space them along the track, in tower order.
 const onTrack=rows.filter(r=>r.onTrack),groups=new Map<number,number>();
 const placed=onTrack.map(r=>{const at=r.onTrack!.laps,k=groups.get(at)??0;groups.set(at,k+1);return {row:r,from:(((at-k*STAGGER)%1)+1)%1};})
  .sort((a,b)=>Number(a.row.mine)-Number(b.row.mine));
 const pits=rows.filter(r=>!r.onTrack).length;
 return <View testID="track-map" style={{gap:8}} onLayout={e=>setBox(Math.round(e.nativeEvent.layout.width))}
  accessibilityLabel={`Track map, stylized, not to scale: ${onTrack.length} cars on track, ${pits} in the pits`}>
  {path&&ranges?<View style={{width,height,alignSelf:'center'}}>
   <Outline path={path} base={ui.line} centre={ui.surfaceElevated}/>
   <SectorMarks path={path}/>
   {placed.map(({row,from})=><CarDot key={row.driverId} row={row} from={from} progress={progress} ranges={ranges}/>)}
  </View>:<View style={{height:200}}/>}
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:12,alignItems:'center'}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:6}}><View style={{width:12,height:12,borderRadius:6,borderWidth:2.5,borderColor:'#FFFFFF',backgroundColor:ui.surface}}/><Text style={styles.muted}>Your cars</Text></View>
   <Text style={styles.muted}>Dimmed: out or in lap</Text>
   <Text style={styles.muted}>{pits} in the pits</Text>
  </View>
 </View>;
}

function Outline({path,base,centre}:{path:LoopPath;base:string;centre:string}){
 const seg=(w:number,color:string,key:string)=>path.pts.slice(1).map((b,i)=>{const a=path.pts[i]!,dx=b.x-a.x,dy=b.y-a.y;
  return <View key={key+i} pointerEvents="none" style={{position:'absolute',left:PAD+a.x,top:PAD+a.y-w/2,width:Math.hypot(dx,dy)+w/2,height:w,borderRadius:w/2,backgroundColor:color,
   transformOrigin:'0% 50%',transform:[{rotate:`${Math.atan2(dy,dx)*180/Math.PI}deg`}]}}/>;});
 return <>{seg(12,base,'b')}{seg(4,centre,'c')}</>;
}

/** Start/finish (white) and the S1/S2 and S2/S3 boundaries, with sector labels at each sector's middle. */
function SectorMarks({path}:{path:LoopPath}){
 const {ui,styles}=useDesign(),cx=path.pts.reduce((a,p)=>a+p.x,0)/path.pts.length,cy=path.pts.reduce((a,p)=>a+p.y,0)/path.pts.length;
 const tick=(f:number,color:string,len:number)=>{const p=pointAt(path,f);
  return <View key={'t'+f} pointerEvents="none" style={{position:'absolute',left:PAD+p.x-len/2,top:PAD+p.y-2,width:len,height:4,borderRadius:1,backgroundColor:color,transform:[{rotate:`${p.angle+90}deg`}]}}/>;};
 const label=(f:number,text:string)=>{const p=pointAt(path,f),dx=p.x-cx,dy=p.y-cy,d=Math.hypot(dx,dy)||1;
  return <Text key={text} pointerEvents="none" style={[styles.eyebrow,{position:'absolute',left:PAD+p.x+dx/d*20-10,top:PAD+p.y+dy/d*20-7,width:20,textAlign:'center',fontSize:10,color:ui.muted}]}>{text}</Text>;};
 return <>{tick(0,'#FFFFFF',22)}{tick(1/3,ui.gold,18)}{tick(2/3,ui.gold,18)}{label(1/6,'S1')}{label(1/2,'S2')}{label(5/6,'S3')}</>;
}

function CarDot({row,from,progress,ranges}:{row:TowerRow;from:number;progress:Animated.Value;ranges:ReturnType<typeof doubleLoopRanges>}){
 const {ui}=useDesign();
 const to=row.onTrack!.moving?from+1/3:from;
 const frac=useMemo(()=>progress.interpolate({inputRange:[0,1],outputRange:[from,to],extrapolate:'clamp'}),[progress,from,to]);
 const x=useMemo(()=>frac.interpolate({inputRange:ranges.input,outputRange:ranges.xs}),[frac,ranges]);
 const y=useMemo(()=>frac.interpolate({inputRange:ranges.input,outputRange:ranges.ys}),[frac,ranges]);
 const size=row.mine?16:10,off=row.phase==='OFF';
 return <Animated.View pointerEvents="none" accessibilityLabel={`${row.name}${row.mine?', your car':''}`}
  style={{position:'absolute',left:PAD-size/2,top:PAD-size/2,width:size,height:size,transform:[{translateX:x},{translateY:y}],opacity:row.phase==='FLYING'||row.mine?1:.55,alignItems:'center'}}>
  <View style={{width:size,height:size,borderRadius:size/2,backgroundColor:row.color,borderWidth:row.mine?3:off?2:1,borderColor:row.mine?'#FFFFFF':off?ui.danger:'#07090D'}}/>
  {row.mine?<Text numberOfLines={1} style={{position:'absolute',top:-17,width:44,textAlign:'center',color:'#FFFFFF',fontSize:11,...(ui.fonts.displayBold?{fontFamily:ui.fonts.displayBold}:{fontWeight:'900'})}}>{row.code}</Text>:null}
 </Animated.View>;
}

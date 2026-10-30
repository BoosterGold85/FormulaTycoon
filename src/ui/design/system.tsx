import React,{useState,type ReactNode} from 'react';
import {SafeAreaView,ScrollView,View,Text,Pressable,StyleSheet,type StyleProp,type ViewStyle} from 'react-native';
import type {NavTab} from '../../game/hudPlaceholders';
import {BottomNav} from '../components/BottomNav';

import {ui} from './tokens';
import {Icon} from './Icon';
export {ui} from './tokens';
export const styles=StyleSheet.create({
 row:{flexDirection:'row',alignItems:'center',gap:12},between:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
 stack:{gap:12},body:{color:ui.ink,fontSize:ui.type.body,lineHeight:21},muted:{color:ui.muted,fontSize:ui.type.small,lineHeight:19},
 title:{color:ui.ink,fontSize:ui.type.title,fontWeight:'900',letterSpacing:-1},heading:{color:ui.ink,fontSize:ui.type.heading,fontWeight:'800'},
 eyebrow:{color:ui.muted,fontSize:ui.type.caption,fontWeight:'800',letterSpacing:1.6,textTransform:'uppercase'},
});
export function Screen({title,kicker,subtitle,tab,onNavigate,children}:{title:string;kicker:string;subtitle?:string;tab:NavTab;onNavigate:(tab:NavTab)=>void;children:ReactNode}){
 return <SafeAreaView style={{flex:1,backgroundColor:ui.bg}}>
  <View style={s.header}><View style={{width:'100%',maxWidth:920,alignSelf:'center',gap:4}}><Text style={styles.eyebrow}>{kicker}</Text><Text accessibilityRole="header" style={styles.title}>{title}</Text>{subtitle?<Text style={styles.muted}>{subtitle}</Text>:null}</View></View>
  <ScrollView style={{flex:1}} contentContainerStyle={s.page}>{children}</ScrollView>
  <BottomNav active={tab} onSelect={next=>onNavigate(next)}/>
 </SafeAreaView>;
}
export function Section({title,meta}:{title:string;meta?:string}){return <View style={[styles.between,{marginTop:6}]}><Text accessibilityRole="header" style={styles.eyebrow}>{title}</Text>{meta?<Text style={styles.muted}>{meta}</Text>:null}</View>;}
export function Card({children,accent,style,hero=false,onPress,accessibilityLabel}:{children:ReactNode;accent?:string;style?:StyleProp<ViewStyle>;hero?:boolean;onPress?:()=>void;accessibilityLabel?:string}){
 const treatment=[s.card,hero&&s.hero,accent?{borderTopColor:accent,borderTopWidth:3}:null,style];
 return onPress?<Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({pressed})=>[treatment,pressed&&{opacity:.8}]}>{children}</Pressable>:<View style={treatment}>{children}</View>;
}
export function Chip({text,tone='muted'}:{text:string;tone?:'muted'|'green'|'gold'|'accent'|'red'}){return <View style={[s.chip,{borderColor:ui[tone]}]}><Text style={{fontSize:10,fontWeight:'800',letterSpacing:.5,color:ui[tone]}}>{text}</Text></View>;}
export function GradeBadge({label,grade,large=false}:{label:string;grade:string;large?:boolean}){return <View style={[s.grade,large&&{flexGrow:1,flexBasis:'30%',minWidth:90,minHeight:84}]}><Text style={styles.muted}>{label}</Text><Text style={{color:ui.ink,fontSize:large?29:17,fontWeight:'900',marginTop:4}}>{grade}</Text></View>;}
export function Action({label,onPress,secondary=false}:{label:string;onPress:()=>void;secondary?:boolean}){return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({pressed})=>[s.action,secondary&&s.secondary,pressed&&{opacity:.7}]}><Text style={{fontSize:12,fontWeight:'900',letterSpacing:.7,color:secondary?ui.ink:ui.bg}}>{label}</Text><Icon name="chevron" color={secondary?ui.accent:ui.bg} size={22}/></Pressable>;}
export function Disclosure({title,children,initiallyOpen=false}:{title:string;children:ReactNode;initiallyOpen?:boolean}){
 const [open,setOpen]=useState(initiallyOpen);
 return <View style={s.disclosure}><Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{expanded:open}} onPress={()=>setOpen(!open)} style={s.disclosureButton}><Text style={[styles.eyebrow,{color:ui.ink}]}>{title}</Text><Text style={{color:ui.accent,fontSize:22}}>{open?'−':'+'}</Text></Pressable>{open?<View style={{padding:16,paddingTop:0,gap:12}}>{children}</View>:null}</View>;
}
export function CompactRow({label,detail,leading,trailing,onPress,accessibilityLabel}:{label:string;detail:string;leading?:ReactNode;trailing?:ReactNode;onPress:()=>void;accessibilityLabel?:string}){return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel??label} onPress={onPress} style={({pressed})=>[s.listRow,pressed&&{backgroundColor:ui.raised}]}>{leading}<View style={{flex:1,minWidth:0,gap:4}}><Text style={{fontSize:15,fontWeight:'800',color:ui.ink}}>{label}</Text><Text style={styles.muted}>{detail}</Text></View>{trailing}<Text style={{color:ui.accent,fontSize:22}}>›</Text></Pressable>;}
export function EmptyState({title,text,art}:{title:string;text:string;art?:ReactNode}){return <Card style={{alignItems:'center',paddingVertical:30}}>{art}<Text accessibilityRole="header" style={[styles.heading,{textAlign:'center'}]}>{title}</Text><Text style={[styles.muted,{textAlign:'center',maxWidth:280}]}>{text}</Text></Card>;}
export function Fact({label,value}:{label:string;value:string}){return <View style={styles.between}><Text style={styles.muted}>{label}</Text><Text style={[styles.body,{flex:1,textAlign:'right',fontWeight:'600'}]}>{value}</Text></View>;}
const s=StyleSheet.create({
 header:{paddingHorizontal:ui.space.lg,paddingTop:16,paddingBottom:14,borderBottomWidth:1,borderBottomColor:ui.line},
 page:{padding:ui.space.lg,paddingBottom:30,gap:16,width:'100%',maxWidth:920,alignSelf:'center'},
 card:{borderRadius:8,padding:ui.space.lg,gap:ui.space.md,backgroundColor:ui.panel,borderWidth:1,borderColor:ui.line,overflow:'hidden'},
 hero:{borderRadius:4,borderWidth:0,backgroundColor:'#172A3B'},
 chip:{alignSelf:'flex-start',borderWidth:0,borderRadius:3,paddingVertical:4,paddingHorizontal:7,backgroundColor:'#1A2C3D'},
 grade:{paddingVertical:10,paddingHorizontal:4,borderBottomWidth:1,borderBottomColor:ui.line},action:{minHeight:46,paddingHorizontal:15,paddingVertical:10,borderRadius:5,backgroundColor:ui.accent,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},
 secondary:{backgroundColor:'transparent',borderBottomWidth:1,borderColor:ui.line,paddingHorizontal:0},
 disclosure:{borderBottomWidth:1,borderColor:ui.line,overflow:'hidden'},disclosureButton:{minHeight:52,paddingHorizontal:0,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
 listRow:{minHeight:84,paddingVertical:12,paddingHorizontal:4,flexDirection:'row',alignItems:'center',gap:10,borderBottomWidth:1,borderColor:ui.line},
});

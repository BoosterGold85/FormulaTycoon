import React from 'react';
import {Text,View} from 'react-native';
import type {NavTab} from '../game/hudPlaceholders';
import {Screen,EmptyState,styles,ui} from './design/system';
import {TrophyArt} from './art/IdentityArt';
export function HistoryScreen({onNavigate}:{onNavigate:(tab:NavTab)=>void}){return <Screen title="Your legacy" kicker="HISTORY / FORMULA TYCOON" subtitle="Every great team starts somewhere." tab="HISTORY" onNavigate={onNavigate}><EmptyState title="A legacy worth building." text="Team records will appear here when race results and championship history are available." art={<TrophyArt/>}/><View style={{flexDirection:'row',justifyContent:'space-around',paddingVertical:16}}>{['SEASONS','RACE RECORDS','TEAM LEGACY'].map(t=><Text key={t} style={{fontSize:10,fontWeight:'800',letterSpacing:.5,color:ui.muted}}>{t}</Text>)}</View><Text style={[styles.muted,{textAlign:'center'}]}>Every season will leave a mark.</Text></Screen>;}

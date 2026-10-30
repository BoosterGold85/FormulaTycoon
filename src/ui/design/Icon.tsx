import React from 'react';
import {Text} from 'react-native';
import {ui} from './tokens';
const GLYPHS={HQ:'⌂',TEAM:'◇',DRIVERS:'◉',RACE:'⚑',HISTORY:'▤',chevron:'›'} as const;
export function Icon({name,color=ui.accent,size=20}:{name:keyof typeof GLYPHS;color?:string;size?:number}){
 return <Text accessible={false} importantForAccessibility="no" style={{fontSize:size,lineHeight:size+4,color}}>{GLYPHS[name]}</Text>;
}

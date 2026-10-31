import React from 'react';
import {Text} from 'react-native';
import {useTheme} from '../theme';
const GLYPHS={HQ:'⌂',TEAM:'◇',DRIVERS:'◉',RACE:'⚑',HISTORY:'▤',chevron:'›'} as const;
export function Icon({name,color:requestedColor,size=20}:{name:keyof typeof GLYPHS;color?:string;size?:number}){const {theme:ui}=useTheme(),color=requestedColor??ui.accent;
 return <Text accessible={false} importantForAccessibility="no" style={{fontSize:size,lineHeight:size+4,color}}>{GLYPHS[name]}</Text>;
}

import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useDesign} from '../design/system';

export function Panel({children, testID, style}: {children: React.ReactNode; testID?: string; style?: object}) {
  const {ui} = useDesign();
  return <View testID={testID} style={[{backgroundColor: ui.surface, borderRadius: 10, padding: 16, gap: 12, minWidth: 0}, style]}>{children}</View>;
}
export function LinkText({label, onPress}: {label: string; onPress: () => void}) {
  const {ui} = useDesign();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8}
    style={{minHeight: 44, justifyContent: 'center'}}>
    <Text style={{color: ui.danger, fontWeight: '800', fontSize: 13}}>{label} ›</Text></Pressable>;
}
export function Meter({value, color, height = 6}: {value: number; color: string; height?: number}) {
  const {ui} = useDesign();
  return <View style={{height, borderRadius: height, backgroundColor: ui.raised, overflow: 'hidden'}}>
    <View style={{width: `${Math.max(0, Math.min(100, value))}%`, height, backgroundColor: color, borderRadius: height}}/></View>;
}
export function Tag({text, color}: {text: string; color: string}) {
  return <View style={{borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: color + '26'}}>
    <Text style={{color, fontSize: 10, fontWeight: '900', letterSpacing: .6}}>{text}</Text></View>;
}
export function Chip({text, mono}: {text: string; mono?: boolean}) {
  const {ui, styles} = useDesign();
  return <View style={{borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: ui.raised}}>
    <Text style={mono ? [styles.figure, {fontSize: 12}] : {color: ui.ink, fontSize: 12, fontWeight: '600'}}>{text}</Text></View>;
}

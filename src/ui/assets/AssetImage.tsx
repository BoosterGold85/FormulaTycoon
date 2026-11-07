import React, {useEffect, useState} from 'react';
import {Image, Platform, Text, View, type ImageResizeMode, type StyleProp, type ViewStyle} from 'react-native';
import {useDesign} from '../design/system';

type Props = {src: string; label: string; width: number | `${number}%`; aspect: number; resizeMode?: ImageResizeMode;
  /** Shown while the file is missing: what belongs here. */
  placeholder: string; fallback?: string; style?: StyleProp<ViewStyle>; testID?: string};

/**
 * An optional art file. Web loads it from public/assets; until it exists (or fails to load), a labelled
 * dashed box shows what is missing and the expected file name. Native shows the placeholder: files dropped
 * into a folder cannot be bundled at runtime, so native art needs a generated asset list later.
 */
export function AssetImage({src, label, width, aspect, resizeMode = 'contain', placeholder, fallback, style, testID}: Props) {
  const {ui, styles} = useDesign();
  const web = Platform.OS === 'web';
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>(web ? 'loading' : 'missing');
  useEffect(() => { setState(web ? 'loading' : 'missing'); }, [src, web]);
  const file = src.split('/').pop();
  return <View testID={testID} accessibilityLabel={label} style={[{width, aspectRatio: aspect, alignItems: 'center', justifyContent: 'center'}, style]}>
    {web && state !== 'missing' ? <Image source={{uri: src}} accessibilityLabel={label} resizeMode={resizeMode}
      onLoad={() => setState('ready')} onError={() => setState('missing')}
      style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: state === 'ready' ? 1 : 0}}/> : null}
    {state !== 'ready' ? <View testID={testID ? `${testID}-placeholder` : undefined} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      borderWidth: 1.5, borderStyle: 'dashed', borderColor: ui.line, borderRadius: 8, alignItems: 'center', justifyContent: 'center', padding: 6, gap: 3}}>
      {fallback ? <Text style={[styles.heading, {fontSize: 20, color: ui.muted}]}>{fallback}</Text> : null}
      <Text numberOfLines={3} style={{color: ui.muted, fontSize: 9, fontWeight: '800', letterSpacing: .4, textAlign: 'center'}}>{`{${placeholder}}`}</Text>
      <Text numberOfLines={1} style={[styles.figure, {color: ui.muted, fontSize: 9, opacity: .8}]}>{file}</Text>
    </View> : null}
  </View>;
}

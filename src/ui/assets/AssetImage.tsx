import React, {useEffect, useState} from 'react';
import {Image, Platform, Text, View, type ImageResizeMode, type StyleProp, type ViewStyle} from 'react-native';
import {useDesign} from '../design/system';
import type {AssetSpec} from './assetPaths';

type Props = {asset: AssetSpec; width: number | `${number}%`; aspect: number; resizeMode?: ImageResizeMode;
  /** compact: small slots show the title and file only; the full description stays in the accessibility label. */
  compact?: boolean; style?: StyleProp<ViewStyle>; testID?: string};

/**
 * A commissioned art file. Web loads it from public/assets; until it exists (or fails to load) a labelled dashed
 * box says what image belongs here, its size and file name. Nothing is drawn in its place. Native shows the
 * placeholder: files dropped into a folder cannot be bundled at runtime, so native art needs an asset list later.
 */
export function AssetImage({asset, width, aspect, resizeMode = 'contain', compact = false, style, testID}: Props) {
  const {ui, styles} = useDesign();
  const web = Platform.OS === 'web';
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>(web ? 'loading' : 'missing');
  useEffect(() => { setState(web ? 'loading' : 'missing'); }, [asset.src, web]);
  const label = `${asset.title}. Image needed: ${asset.description} ${asset.size}, ${asset.file}`;
  return <View testID={testID} accessibilityLabel={state === 'ready' ? asset.title : label}
    style={[{width, aspectRatio: aspect, alignItems: 'center', justifyContent: 'center'}, style]}>
    {web && state !== 'missing' ? <Image source={{uri: asset.src}} accessibilityLabel={asset.title} resizeMode={resizeMode}
      onLoad={() => setState('ready')} onError={() => setState('missing')}
      style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: state === 'ready' ? 1 : 0}}/> : null}
    {state !== 'ready' ? <View testID={testID ? `${testID}-placeholder` : undefined} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      borderWidth: 1.5, borderStyle: 'dashed', borderColor: ui.line, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
      padding: compact ? 4 : 12, gap: compact ? 2 : 6}}>
      <Text numberOfLines={compact ? 3 : 2} style={{color: ui.ink, fontSize: compact ? 9 : 12, fontWeight: '800', letterSpacing: .4, textAlign: 'center'}}>
        {compact ? asset.title.toUpperCase() : `IMAGE NEEDED · ${asset.title.toUpperCase()}`}</Text>
      <Text numberOfLines={compact ? 3 : undefined} style={{color: ui.muted, fontSize: compact ? 8 : 11, lineHeight: compact ? 10 : 15, textAlign: 'center', maxWidth: 420}}>
        {compact ? asset.short : asset.description}</Text>
      <Text numberOfLines={2} style={[styles.figure, {color: ui.muted, fontSize: compact ? 8 : 10, textAlign: 'center'}]}>
        {compact ? asset.file.split('/').pop() : `${asset.file} · ${asset.size}`}</Text>
    </View> : null}
  </View>;
}

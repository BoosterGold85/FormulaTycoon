import {useFonts} from 'expo-font';

/**
 * Bundled display and figure faces (SIL OFL, assets/fonts). Rendering never waits for them: until they load,
 * or if loading fails, text uses the platform fallback, so a font problem can never block the game.
 */
export function useAppFonts(){
 const [loaded]=useFonts({
  'BarlowCondensed-ExtraBold':require('../../../assets/fonts/BarlowCondensed_800ExtraBold.ttf'),
  'BarlowCondensed-Bold':require('../../../assets/fonts/BarlowCondensed_700Bold.ttf'),
  'BarlowCondensed-ExtraBoldItalic':require('../../../assets/fonts/BarlowCondensed_800ExtraBold_Italic.ttf'),
  'JetBrainsMono-Medium':require('../../../assets/fonts/JetBrainsMono_500Medium.ttf'),
  'JetBrainsMono-Bold':require('../../../assets/fonts/JetBrainsMono_700Bold.ttf')
 });
 return loaded;
}

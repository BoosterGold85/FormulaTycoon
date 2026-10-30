import React,{createContext,useContext,useMemo,useState,type ReactNode} from 'react';
import {themeTokens,type ThemeMode} from './design/tokens';
export const THEME_PREFERENCE_KEY='formula-tycoon.theme';
type PreferenceStorage={getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void};
function browserStorage():PreferenceStorage|undefined {
 try{return (globalThis as typeof globalThis&{localStorage?:PreferenceStorage}).localStorage;}catch{return undefined;}
}
export function readThemePreference(storage=browserStorage()):ThemeMode {
 try{return storage?.getItem(THEME_PREFERENCE_KEY)==='dark'?'dark':'light';}catch{return 'light';}
}
export function writeThemePreference(mode:ThemeMode,storage=browserStorage()):void {
 try{storage?.setItem(THEME_PREFERENCE_KEY,mode);}catch{/* Restricted storage still permits session-local selection. */}
}
const ThemeContext=createContext({theme:themeTokens('light'),setMode:(_mode:ThemeMode)=>{}});
/** Presentation owner, outside campaign/session state. No keyed remount on changes. */
export function ThemeProvider({children}:{children:ReactNode}){
 const [mode,setModeState]=useState<ThemeMode>(()=>readThemePreference());
 const value=useMemo(()=>({theme:themeTokens(mode),setMode:(next:ThemeMode)=>{setModeState(next);writeThemePreference(next);}}),[mode]);
 return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme=()=>useContext(ThemeContext);

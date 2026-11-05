import React,{useRef} from 'react';
import {Platform} from 'react-native';
import {Action} from '../design/system';
import {PACK_MAX_BYTES} from '../../game/roster';

/** Web file picker using the browser's own input; native builds use the paste box (no picker dependency). */
export function PackFileButton({onText,onError}:{onText:(text:string,fileName:string)=>void;onError:(message:string)=>void}){
 const input=useRef<HTMLInputElement|null>(null);
 if(Platform.OS!=='web')return null;
 const onChange=async(event:{target:HTMLInputElement})=>{
  const file=event.target.files?.[0];event.target.value='';
  if(!file)return;
  if(file.size>PACK_MAX_BYTES){onError(`"${file.name}" is larger than ${PACK_MAX_BYTES/1024} KB. Roster packs are small text files; check you picked the right file.`);return;}
  try{onText(await file.text(),file.name);}catch{onError(`"${file.name}" could not be read.`);}
 };
 return <>
  {React.createElement('input',{ref:input,type:'file',accept:'.json,application/json',onChange,style:{display:'none'},'data-testid':'roster-pack-file'})}
  <Action label="Choose pack file" onPress={()=>input.current?.click()}/>
 </>;
}

/** Web only: save the shipped fictional pack as a starting point for pack authors. */
export function downloadText(fileName:string,text:string){
 if(Platform.OS!=='web')return;
 const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download=fileName;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from './setup';
export type Cable = 'safe'|'yellow'|'blue'|'red'|'pink'|'green'|'orange';
export type TBPlayer = {id:string;name:string;ready:boolean;connected:boolean;role:string|null;cards:{id:string}[]};
export type TimebombState = {myId:string;role:string|null;composition:{type:Cable;count:number}[];room:{code:string;hostId:string;phase:string;mode:string;firstId:string|null;round:number;cuts:number;limit:number;activeId:string;forcedId:string|null;colors:Cable[];revealed:{type:Cable;actorId:string;targetId:string;round:number;number:number}[];protected:Cable[];pending:{type:string;actorId:string;options:Cable[]}|null;history:{id:number;text:string}[];winner:string|null;reason:string;paused:boolean;players:TBPlayer[]}};
export const CABLES:Record<Cable,{label:string;color:string;symbol:string;effect:string}> = {
 safe:{label:'Désamorçage',color:'#7DE2C0',symbol:'✓',effect:'Trouvez tous les câbles de désamorçage pour sauver Londres. En Evolution, protégez une couleur déjà révélée, sauf jaune.'},
 yellow:{label:'Jaune',color:'#F4D068',symbol:'◆',effect:'Ne peut jamais être désamorcée. Explosion à la quatrième carte.'},
 blue:{label:'Bleue',color:'#79BDF0',symbol:'≈',effect:'Retire une protection au choix du joueur qui coupe. Cela peut provoquer une explosion immédiate.'},
 red:{label:'Rouge',color:'#F48F79',symbol:'↗',effect:'Le prochain joueur doit couper chez une personne tirée au sort. Le zéro autorise à couper chez soi.'},
 pink:{label:'Rose',color:'#EB9FCC',symbol:'∞',effect:'Deux roses consécutives explosent, même protégées et même entre deux manches.'},
 green:{label:'Verte',color:'#ADD488',symbol:'▲',effect:'Explose dès la troisième carte, sauf si elle est protégée.'},
 orange:{label:'Orange',color:'#EEAD68',symbol:'◷',effect:'Chaque orange révélée avant la quatrième manche retire une coupure à cette dernière manche.'},
};
let token='';
function readToken(){try{return typeof window!=='undefined'?window.sessionStorage?.getItem('timebomb.session')||token:token;}catch{return token;}}
function saveToken(value:string){token=value;try{if(typeof window!=='undefined')window.sessionStorage?.setItem('timebomb.session',value);}catch{/* Optional persistence. */}}
export function useTimebomb(){
 const [state,setState]=useState<TimebombState|null>(null),[connected,setConnected]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const ref=useRef<Socket|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{const s=io(SERVER_URL+'/timebomb',{transports:['websocket'],auth:{token:readToken()},reconnection:true,reconnectionDelayMax:3000});ref.current=s;
 const clear=()=>{setBusy(false);if(timer.current)clearTimeout(timer.current);};
 s.on('connect',()=>{setConnected(true);setError('');});s.on('disconnect',()=>{setConnected(false);clear();});s.on('connect_error',()=>{setConnected(false);clear();});
 s.on('session',(value:string)=>{saveToken(value);s.auth={token:value};});s.on('state',(value:TimebombState)=>{setState(value);setError('');clear();});s.on('errorMessage',(message:string)=>{setError(message);clear();});s.on('left',()=>{saveToken('');s.auth={};setState(null);clear();});s.on('expired',()=>{saveToken('');s.auth={};setState(null);setError('La salle a expiré. Créez ou rejoignez une salle.');clear();});
 return()=>{if(timer.current)clearTimeout(timer.current);s.disconnect();ref.current=null;};},[]);
 const send=(event:string,data:object={})=>{if(!ref.current?.connected){setError('Connexion en cours. Le serveur gratuit peut prendre une minute à démarrer.');return;}setError('');setBusy(true);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{setBusy(false);setError('Le serveur ne répond pas. Réessayez.');},12000);ref.current.emit('command',{event,data});};
 return {state,connected,error,busy,send,clearError:()=>setError('')};
}

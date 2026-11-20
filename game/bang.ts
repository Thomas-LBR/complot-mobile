import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from './setup';
export type BangCard = { id:string; type:string; name:string; description:string; category:string; suit:string; rank:number };
export type BangPlayer = { id:string; name:string; connected:boolean; ready:boolean; alive:boolean; hp:number; maxHp:number; handCount:number; character:{name:string;description:string;hp:number}|null; equipment:BangCard[];range:number;distance:number;role:string|null };
export type BangPending = { type:string; kind?:string; targetId:string; actorId?:string; remaining?:number; needed?:number; barrelUsed?:string[]; cards?:BangCard[] };
export type BangState = { myId:string;hand:BangCard[];role:string|null;room:{code:string;hostId:string;phase:string;stage:string;activeId:string;turn:number;bangs:number;paused:boolean;winner:string|null;deckCount:number;discardTop:BangCard|null;pending:BangPending|null;history:{id:number;text:string;kind:string;actorId?:string;targetId?:string}[];players:BangPlayer[]} };
let token='';
function readToken(){try{return typeof window!=='undefined'?window.sessionStorage?.getItem('bang.session')||token:token;}catch{return token;}}
function saveToken(value:string){token=value;try{if(typeof window!=='undefined')window.sessionStorage?.setItem('bang.session',value);}catch{/* Optional persistence. */}}
export function useBang(){
 const [state,setState]=useState<BangState|null>(null),[connected,setConnected]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const ref=useRef<Socket|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{const s=io(SERVER_URL+'/bang',{transports:['websocket'],auth:{token:readToken()},reconnection:true,reconnectionDelayMax:3000});ref.current=s;
 const clear=()=>{setBusy(false);if(timer.current)clearTimeout(timer.current);};
 s.on('connect',()=>{setConnected(true);setError('');});s.on('disconnect',()=>{setConnected(false);clear();});s.on('connect_error',()=>{setConnected(false);clear();});
 s.on('session',(value:string)=>{saveToken(value);s.auth={token:value};});s.on('state',(value:BangState)=>{setState(value);setError('');clear();});s.on('errorMessage',(message:string)=>{setError(message);clear();});s.on('left',()=>{saveToken('');s.auth={};setState(null);clear();});s.on('expired',()=>{saveToken('');s.auth={};setState(null);setError('La salle a expiré. Créez ou rejoignez une salle.');clear();});
 return()=>{if(timer.current)clearTimeout(timer.current);s.disconnect();ref.current=null;};},[]);
 const send=(event:string,data:object={})=>{if(!ref.current?.connected){setError('Connexion en cours. Le serveur gratuit peut prendre une minute à démarrer.');return;}setError('');setBusy(true);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{setBusy(false);setError('Le serveur ne répond pas. Réessayez.');},12000);ref.current.emit('command',{event,data});};
 return {state,connected,error,busy,send,clearError:()=>setError('')};
}
export const ROLE_HELP:Record<string,string>={'Shérif':'Éliminez les Hors-la-loi et le Renégat. Vos Adjoints vous aident.','Adjoint':'Protégez le Shérif. Vous gagnez avec lui, même après votre élimination.','Hors-la-loi':'Éliminez le Shérif. Votre camp peut gagner même si vous êtes éliminé.','Renégat':'Soyez le dernier survivant : gardez le Shérif en vie jusqu’au duel final.'};
export const SUITS:Record<string,string>={hearts:'♥',diamonds:'♦',clubs:'♣',spades:'♠'};
export const rank=(n:number)=>({11:'V',12:'D',13:'R',14:'A'}[n]||String(n));

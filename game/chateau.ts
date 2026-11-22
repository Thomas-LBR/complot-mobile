import {useEffect,useRef,useState} from 'react';
import {io,Socket} from 'socket.io-client';
import {SERVER_URL} from './setup';
export type CCBoardCard={id:string|null;down:boolean;stored:number};
export type CCPlayer={id:string;name:string;ready:boolean;connected:boolean;gold:number;keys:number;board:(CCBoardCard|null)[];score:number|null};
export type CCState={myId:string;room:{code:string;hostId:string;phase:string;current:number;messenger:'Village'|'Castle';keyUsed:boolean;pending:{type:string;actorId:string;place?:string;resource?:string;options?:string[];alternate?:boolean;remaining?:number}|null;market:{Village:string[];Castle:string[]};decks:{Village:number;Castle:number};discard:{Village:number;Castle:number};history:{id:number;text:string}[];winners:string[];paused:boolean;players:CCPlayer[]}};
let token='';
function readToken(){try{return typeof window!=='undefined'?window.sessionStorage?.getItem('chateau.session')||token:token;}catch{return token;}}
function saveToken(v:string){token=v;try{if(typeof window!=='undefined')window.sessionStorage?.setItem('chateau.session',v);}catch{}}
export function useChateau(){
 const [state,setState]=useState<CCState|null>(null),[connected,setConnected]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);const ref=useRef<Socket|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{const s=io(SERVER_URL+'/chateau',{transports:['websocket'],auth:{token:readToken()},reconnection:true,reconnectionDelayMax:3000});ref.current=s;const clear=()=>{setBusy(false);if(timer.current)clearTimeout(timer.current)};s.on('connect',()=>{setConnected(true);setError('')});s.on('disconnect',()=>{setConnected(false);clear()});s.on('connect_error',()=>{setConnected(false);clear()});s.on('session',(v:string)=>{saveToken(v);s.auth={token:v}});s.on('state',(v:CCState)=>{setState(v);setError('');clear()});s.on('errorMessage',(v:string)=>{setError(v);clear()});s.on('left',()=>{saveToken('');s.auth={};setState(null);clear()});s.on('expired',()=>{saveToken('');s.auth={};setState(null);setError('La salle a expiré.');clear()});return()=>{clear();s.disconnect();ref.current=null}},[]);
 const send=(event:string,data:Record<string,unknown>={})=>{if(!ref.current?.connected)return;setBusy(true);ref.current.emit('command',{event,data});if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setBusy(false),5000)};
 return {state,connected,error,busy,send,clearError:()=>setError('')};
}

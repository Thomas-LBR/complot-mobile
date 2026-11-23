import {useEffect,useRef,useState} from 'react';
import {io,Socket} from 'socket.io-client';
import {SERVER_URL} from './setup';
export type CNState=any;
let memoryToken='';
function token(){try{return typeof window!=='undefined'?window.sessionStorage?.getItem('undercover.session')||memoryToken:memoryToken;}catch{return memoryToken;}}
function save(value:string){memoryToken=value;try{if(typeof window!=='undefined')window.sessionStorage?.setItem('undercover.session',value);}catch{}}
export function useUndercover(){
 const [state,setState]=useState<CNState|null>(null),[connected,setConnected]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const ref=useRef<Socket|null>(null),latest=useRef<CNState|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{const s=io(SERVER_URL+'/undercover',{transports:['websocket'],auth:{token:token()},timeout:45000,reconnection:true,reconnectionDelayMax:4000});ref.current=s;
  const clear=()=>{setBusy(false);if(timer.current)clearTimeout(timer.current);};
  s.on('connect',()=>{setConnected(true);setError('');});s.on('disconnect',()=>{setConnected(false);clear();});
  s.on('connect_error',(e:Error)=>{setConnected(false);clear();setError(e.message==='Invalid namespace'?'Le serveur en ligne ne contient pas encore Undercover. Il faut déployer la nouvelle version de complot-server sur Render.':'Connexion au serveur en cours. Un serveur Render en veille peut prendre une minute à démarrer.');});
  s.on('session',(v:string)=>{save(v);s.auth={token:v};});s.on('state',(v:CNState)=>{latest.current=v;setState(v);clear();});s.on('errorMessage',(v:string)=>{setError(v);clear();});
  const reset=()=>{save('');s.auth={};latest.current=null;setState(null);clear();};s.on('left',reset);s.on('expired',()=>{reset();setError('La salle a expiré. Créez ou rejoignez une nouvelle salle.');});
  return()=>{clear();s.disconnect();ref.current=null;};
 },[]);
 const send=(event:string,data:Record<string,unknown>={})=>{if(!ref.current?.connected||busy)return;setError('');setBusy(true);ref.current.emit('command',{event,data,revision:latest.current?.room.revision});if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{setBusy(false);setError('Le serveur ne répond pas. Votre action n’est pas confirmée.');ref.current?.emit('command',{event:'sync'});},8000);};
 return {state,connected,error,busy,send,clearError:()=>setError('')};
}

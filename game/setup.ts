import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
const hostUri = Constants.expoConfig?.hostUri;
const serverHost = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.hostname : hostUri ? new URL(`http://${hostUri}`).hostname : Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || `http://${serverHost}:3001`;
let memoryToken = '';
export function rememberSession(token: string) {
  memoryToken = token;
  try { if (typeof window !== 'undefined') window.sessionStorage?.setItem('complot.session', token); } catch { /* Private browsing can disable storage. */ }
}
function savedToken() {
  try { return typeof window !== 'undefined' ? window.sessionStorage?.getItem('complot.session') || memoryToken : memoryToken; } catch { return memoryToken; }
}
let socket: Socket | null = null;
export function getSocket(): Socket {
  if (!socket) socket = io(SERVER_URL, { transports: ['websocket'], autoConnect: false, reconnection: true, reconnectionDelayMax: 3000, timeout: 7000, auth: { sessionToken: savedToken() } });
  return socket;
}

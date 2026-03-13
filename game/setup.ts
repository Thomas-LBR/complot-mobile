import { io, Socket } from "socket.io-client";

export const SERVER_URL = "http://10.114.128.142:3001";

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io(SERVER_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 5000,
    });

    _socket.on("connect",       () => console.log("[socket] connecté ✓", _socket?.id));
    _socket.on("connect_error", (e) => console.log("[socket] erreur:", e.message));
    _socket.on("disconnect",    (r) => console.log("[socket] déconnecté:", r));
  }
  return _socket;
}

export function resetSocket() {
  _socket?.disconnect();
  _socket = null;
}
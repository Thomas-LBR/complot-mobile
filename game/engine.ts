import { useCallback, useEffect, useReducer, useRef } from "react";
import { Actions } from "./action";
import { getSocket } from "./setup";
import {
  CardState,
  ExchangeOptions,
  GameRoom,
  MustRevealPayload,
  RoleName,
} from "./types";

// ─── State ────────────────────────────────────────────────────────────────────
interface EngineState {
  roomCode: string | null;
  myId: string | null;
  lobbyPlayers: { id: string; username: string }[];
  room: GameRoom | null;
  myCards: CardState[];
  mustReveal: MustRevealPayload | null;
  exchangeOptions: ExchangeOptions | null;
  error: string | null;
  connected: boolean;
}

const INIT: EngineState = {
  roomCode: null, myId: null, lobbyPlayers: [],
  room: null, myCards: [], mustReveal: null, exchangeOptions: null,
  error: null, connected: false,
};

type Msg =
  | { type: "CONNECTED" }
  | { type: "DISCONNECTED" }
  | { type: "SET_ID"; id: string }
  | { type: "ROOM_CREATED"; code: string }
  | { type: "LOBBY_UPDATE"; players: { id: string; username: string }[] }
  | { type: "GAME_STARTED"; room: GameRoom }
  | { type: "GAME_UPDATE"; room: GameRoom }
  | { type: "ACTION_PENDING"; room: GameRoom }
  | { type: "YOUR_CARDS"; cards: CardState[] }
  | { type: "MUST_REVEAL"; payload: MustRevealPayload }
  | { type: "EXCHANGE_OPTIONS"; payload: ExchangeOptions }
  | { type: "ERROR"; msg: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_ROOM_CODE"; code: string }
  | { type: "RESET" };

function reducer(s: EngineState, m: Msg): EngineState {
  switch (m.type) {
    case "CONNECTED":        return { ...s, connected: true };
    case "DISCONNECTED":     return { ...s, connected: false };
    case "SET_ID":           return { ...s, myId: m.id };
    case "ROOM_CREATED":     return { ...s, roomCode: m.code };
    case "SET_ROOM_CODE":    return { ...s, roomCode: m.code };
    case "LOBBY_UPDATE":     return { ...s, lobbyPlayers: m.players };
    case "GAME_STARTED":     return { ...s, room: m.room, mustReveal: null, exchangeOptions: null };
    case "GAME_UPDATE":      return { ...s, room: m.room, mustReveal: null, exchangeOptions: null };
    case "ACTION_PENDING":   return { ...s, room: m.room };
    case "YOUR_CARDS":       return { ...s, myCards: m.cards };
    case "MUST_REVEAL":      return { ...s, mustReveal: m.payload };
    case "EXCHANGE_OPTIONS": return { ...s, exchangeOptions: m.payload };
    case "ERROR":            return { ...s, error: m.msg };
    case "CLEAR_ERROR":      return { ...s, error: null };
    case "RESET":            return { ...INIT, connected: s.connected };
    default:                 return s;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useGameEngine() {
  const [state, dispatch] = useReducer(reducer, INIT);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;

    socket.on("connect",       () => { console.log("SOCKET connect", socket.id); dispatch({ type: "CONNECTED" }); dispatch({ type: "SET_ID", id: socket.id! }); });
    socket.on("disconnect",    () => { console.log("SOCKET disconnect"); dispatch({ type: "DISCONNECTED" }); });
    socket.on("connect_error", (err: any) => { console.warn("SOCKET connect_error", err.message || err); dispatch({ type: "ERROR", msg: "Connection error" }); });
    socket.on("roomCreated",   (payload: any) => {
      const code = typeof payload === "string" ? payload : payload?.code;
      console.log("SOCKET roomCreated", payload);
      if (code) {
        dispatch({ type: "ROOM_CREATED", code });
      } else {
        dispatch({ type: "ERROR", msg: "Room creation failed (invalid payload)" });
      }
    });
    socket.on("roomUpdate",    (players: any) => { console.log("SOCKET roomUpdate", players?.length); dispatch({ type: "LOBBY_UPDATE", players }); });
    socket.on("gameStarted",   (room: GameRoom) => dispatch({ type: "GAME_STARTED", room }));
    socket.on("gameUpdate",    (room: GameRoom) => dispatch({ type: "GAME_UPDATE", room }));
    socket.on("actionPending", (room: GameRoom) => dispatch({ type: "ACTION_PENDING", room }));
    socket.on("yourCards",     (cards: CardState[]) => dispatch({ type: "YOUR_CARDS", cards }));
    socket.on("mustReveal",    (p: MustRevealPayload) => dispatch({ type: "MUST_REVEAL", payload: p }));
    socket.on("exchangeOptions", (p: ExchangeOptions) => dispatch({ type: "EXCHANGE_OPTIONS", payload: p }));
    socket.on("errorMessage",  (msg: string) => { console.log("SOCKET errorMessage", msg); dispatch({ type: "ERROR", msg }); });

    // Si déjà connecté au mount
    if (socket.connected) {
      dispatch({ type: "CONNECTED" });
      dispatch({ type: "SET_ID", id: socket.id! });
    }

    return () => {
      socket.off("connect"); socket.off("disconnect");
      socket.off("roomCreated"); socket.off("roomUpdate");
      socket.off("gameStarted"); socket.off("gameUpdate");
      socket.off("actionPending"); socket.off("yourCards");
      socket.off("mustReveal"); socket.off("exchangeOptions");
      socket.off("errorMessage");
    };
  }, []);

  // ─── Actions exposées ────────────────────────────────────────────────────
  const s = socketRef.current;
  const rc = state.roomCode ?? "";

  const createRoom = useCallback((username: string) => Actions.createRoom(s, username), []);
  const joinRoom   = useCallback((code: string, username: string) => {
    dispatch({ type: "SET_ROOM_CODE", code });
    Actions.joinRoom(s, code, username);
  }, []);
  const startGame       = useCallback(() => Actions.startGame(s, rc), [rc]);
  const takeCoins       = useCallback((n: number) => Actions.takeCoins(s, rc, n), [rc]);
  const foreignAid      = useCallback(() => Actions.foreignAid(s, rc), [rc]);
  const declareDuchesse = useCallback(() => Actions.declareDuchesse(s, rc), [rc]);
  const exchangeRequest = useCallback(() => Actions.exchangeRequest(s, rc), [rc]);
  const exchangeConfirm = useCallback((sel: CardState[]) => Actions.exchangeConfirm(s, rc, sel), [rc]);
  const steal           = useCallback((tid: string) => Actions.steal(s, rc, tid), [rc]);
  const assassinate     = useCallback((tid: string, role: RoleName) => Actions.assassinate(s, rc, tid, role), [rc]);
  const coup            = useCallback((tid: string, role: RoleName) => Actions.coup(s, rc, tid, role), [rc]);
  const challenge       = useCallback(() => Actions.challenge(s, rc), [rc]);
  const passChallenge   = useCallback(() => Actions.passChallenge(s, rc), [rc]);
  const blockAction     = useCallback((role: RoleName) => Actions.blockAction(s, rc, role), [rc]);
  const passBlock       = useCallback(() => Actions.passBlock(s, rc), [rc]);
  const revealInfluence = useCallback((idx: number) => Actions.revealInfluence(s, rc, idx), [rc]);
  const clearError      = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);
  const reset           = useCallback(() => { dispatch({ type: "RESET" }); }, []);

  return {
    ...state,
    createRoom, joinRoom, startGame,
    takeCoins, foreignAid, declareDuchesse,
    exchangeRequest, exchangeConfirm,
    steal, assassinate, coup,
    challenge, passChallenge,
    blockAction, passBlock,
    revealInfluence,
    clearError, reset,
  };
}
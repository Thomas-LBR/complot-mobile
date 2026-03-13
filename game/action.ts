import { Socket } from "socket.io-client";
import { CardState, RoleName } from "./types";

export const Actions = {
  createRoom:      (s: Socket, username: string)                                          => s.emit("createRoom", username),
  joinRoom:        (s: Socket, roomCode: string, username: string)                        => s.emit("joinRoom", { roomCode, username }),
  startGame:       (s: Socket, roomCode: string)                                          => s.emit("startGame", roomCode),
  takeCoins:       (s: Socket, roomCode: string, amount: number)                          => s.emit("takeCoins", { roomCode, amount }),
  foreignAid:      (s: Socket, roomCode: string)                                          => s.emit("foreignAid", { roomCode }),
  declareDuchesse: (s: Socket, roomCode: string)                                          => s.emit("declareDuchesse", { roomCode }),
  exchangeRequest: (s: Socket, roomCode: string)                                          => s.emit("exchangeRequest", { roomCode }),
  exchangeConfirm: (s: Socket, roomCode: string, selectedCards: CardState[])              => s.emit("exchangeConfirm", { roomCode, selectedCards }),
  steal:           (s: Socket, roomCode: string, targetId: string)                        => s.emit("steal", { roomCode, targetId }),
  assassinate:     (s: Socket, roomCode: string, targetId: string, guessedRole: RoleName) => s.emit("assassinate", { roomCode, targetId, guessedRole }),
  coup:            (s: Socket, roomCode: string, targetId: string, targetRole: RoleName)  => s.emit("coup", { roomCode, targetId, targetRole }),
  challenge:       (s: Socket, roomCode: string)                                          => s.emit("challenge", { roomCode }),
  passChallenge:   (s: Socket, roomCode: string)                                          => s.emit("passChallenge", { roomCode }),
  blockAction:     (s: Socket, roomCode: string, role: RoleName)                         => s.emit("blockAction", { roomCode, role }),
  passBlock:       (s: Socket, roomCode: string)                                          => s.emit("passBlock", { roomCode }),
  revealInfluence: (s: Socket, roomCode: string, index: number)                          => s.emit("revealInfluence", { roomCode, index }),
};
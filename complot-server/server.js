const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const rooms = {};

const ROLES = [
  "Duchesse",    "Duchesse",    "Duchesse",
  "Assassin",    "Assassin",    "Assassin",
  "Capitaine",   "Capitaine",   "Capitaine",
  "Comtesse",    "Comtesse",    "Comtesse",
  "Ambassadeur", "Ambassadeur", "Ambassadeur",
];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function aliveCount(player) {
  return player.influences.filter((c) => !c.revealed).length;
}

function isAlive(player) {
  return aliveCount(player) > 0;
}

function nextAliveIndex(room) {
  const n = room.players.length;
  let tries = 0;
  do {
    room.currentPlayerIndex = (room.currentPlayerIndex + 1) % n;
    tries++;
  } while (!isAlive(room.players[room.currentPlayerIndex]) && tries < n);
}

function makePublicRoom(room) {
  const pa = room.pendingAction;
  return {
    host: room.host,
    phase: room.phase,
    currentPlayerIndex: room.currentPlayerIndex,
    pendingAction: pa ? {
      type: pa.type,
      actorId: pa.actorId,
      targetId: pa.targetId ?? null,
      claimedRole: pa.claimedRole ?? null,
      guessedRole: pa.guessedRole ?? null,
      revealSpecificRole: pa.revealSpecificRole ?? null,
      stage: pa.stage,
      blockedBy: pa.blockedBy ?? null,
      blockRole: pa.blockRole ?? null,
      challengedBy: pa.challengedBy ?? null,
    } : null,
    players: room.players.map((p) => ({
      id: p.id,
      username: p.username,
      coins: p.coins,
      alive: isAlive(p),
      influenceCount: aliveCount(p),
      revealedInfluences: p.influences
        .filter((c) => c.revealed)
        .map((c) => ({ role: c.role, revealed: true })),
    })),
  };
}

function swapClaimedCardWithDeck(room, player, claimedRole) {
  const idx = player.influences.findIndex(
    (c) => !c.revealed && c.role === claimedRole
  );
  if (idx === -1) return false;
  room.deck.push(player.influences[idx].role);
  shuffle(room.deck);
  const newRole = room.deck.pop();
  player.influences[idx] = { role: newRole, revealed: false };
  return true;
}

function requireRoom(roomCode) { return rooms[roomCode] || null; }
function getPlayer(room, id) { return room.players.find((p) => p.id === id) || null; }
function currentPlayer(room) { return room.players[room.currentPlayerIndex] || null; }
function alivePlayers(room) { return room.players.filter(isAlive); }

function canActNow(room, socketId) {
  if (!room || room.phase !== "playing") return false;
  if (room.pendingAction) return false;
  const cur = currentPlayer(room);
  if (!cur) return false;
  return cur.id === socketId && isAlive(cur);
}

const BLOCKS = {
  steal:      ["Capitaine", "Ambassadeur"],
  assassinate:["Comtesse"],
  foreign_aid:["Duchesse"],
  duchess:    [],
  coup:       [],
  exchange:   [],
};

function startPending(room, pending) {
  room.pendingAction = {
    ...pending,
    stage: "challengeAction",
    challengedBy: null,
    blockedBy: null,
    blockRole: null,
    passes: new Set(),
    awaitingRevealBy: null,
    resolveAfterReveal: null,
    revealSpecificRole: null,
  };
}

function broadcastPending(roomCode) {
  io.to(roomCode).emit("actionPending", makePublicRoom(rooms[roomCode]));
}

function broadcastUpdate(roomCode) {
  io.to(roomCode).emit("gameUpdate", makePublicRoom(rooms[roomCode]));
}

function finishPendingAndAdvance(roomCode) {
  const room = rooms[roomCode];
  room.pendingAction = null;
  const alive = alivePlayers(room);
  if (alive.length <= 1) {
    room.phase = "finished";
    broadcastUpdate(roomCode);
    return;
  }
  nextAliveIndex(room);
  broadcastUpdate(roomCode);
}

function sendExchangeOptions(room, action, roomCode) {
  const actor = getPlayer(room, action.actorId);
  if (!actor) return;
  io.to(action.actorId).emit("exchangeOptions", {
    currentCards: actor.influences.filter(c => !c.revealed),
    drawnCards: actor.tempDrawn || [],
  });
  broadcastPending(roomCode);
}

// ─── needsTargetReveal helper ───
function triggerTargetReveal(room, action, roomCode, reason) {
  action.stage = "awaitingReveal";
  action.awaitingRevealBy = action.targetId;
  action.resolveAfterReveal = "assassinationResolved";
  const target = getPlayer(room, action.targetId);
  if (target) {
    io.to(target.id).emit("mustReveal", {
      roomCode,
      reason,
      targetRole: action.revealSpecificRole || null,
    });
  }
  broadcastPending(roomCode);
}

function applyAction(room, action) {
  const actor  = getPlayer(room, action.actorId);
  const target = action.targetId ? getPlayer(room, action.targetId) : null;
  if (!actor || !isAlive(actor)) return null;

  switch (action.type) {

    case "duchess":
      actor.coins = Math.min(actor.coins + 3, 12);
      return null;

    case "foreign_aid":
      actor.coins = Math.min(actor.coins + 2, 12);
      return null;

    case "steal":
      if (!target || !isAlive(target)) return null;
      { const amt = Math.min(2, target.coins); target.coins -= amt; actor.coins = Math.min(actor.coins + amt, 12); }
      return null;

    case "assassinate": {
      if (!target || !isAlive(target)) return null;
      // guessedRole = rôle que l'assassin pense que la cible possède
      const guessedRole = action.guessedRole;
      const hasRole = guessedRole && target.influences.some(c => !c.revealed && c.role === guessedRole);
      if (!hasRole) {
        // Raté — les 3 pièces sont perdues mais rien ne se passe sur la cible
        return "assassinMissed";
      }
      // Touché — on force la révélation de cette carte précise
      action.revealSpecificRole = guessedRole;
      return "needsTargetReveal";
    }

    case "coup": {
      if (!target || !isAlive(target)) return null;
      // Même logique que l'assassin : le joueur DOIT deviner le bon rôle
      const targetRole = action.targetRole;
      const hasRole = targetRole && target.influences.some(c => !c.revealed && c.role === targetRole);
      if (!hasRole) {
        // Raté — 7💰 perdus, rien ne se passe sur la cible
        return "coupMissed";
      }
      // Touché — on force la révélation de cette carte précise
      action.revealSpecificRole = targetRole;
      return "needsTargetReveal";
    }

    case "exchange": {
      const drawn = [];
      if (room.deck.length > 0) drawn.push({ role: room.deck.pop(), revealed: false });
      if (room.deck.length > 0) drawn.push({ role: room.deck.pop(), revealed: false });
      actor.tempDrawn = drawn;
      return "needsExchange";
    }

    default:
      return null;
  }
}

// ─── handleApplyResult — factorise le traitement du retour applyAction ───
function handleApplyResult(res, room, action, roomCode) {
  if (res === "needsExchange")  return sendExchangeOptions(room, action, roomCode);
  if (res === "assassinMissed") return finishPendingAndAdvance(roomCode);
  if (res === "coupMissed")     return finishPendingAndAdvance(roomCode);
  if (res === "needsTargetReveal") return triggerTargetReveal(room, action, roomCode, "assassinated");
  return finishPendingAndAdvance(roomCode);
}

// ════════════════════════════════════════════════════════
io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("createRoom", (username) => {
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    rooms[roomCode] = { host: socket.id, players: [{ id: socket.id, username, coins: 0, influences: [] }], deck: [], currentPlayerIndex: 0, phase: "waiting", pendingAction: null };
    socket.join(roomCode);
    socket.emit("roomCreated", roomCode);
    io.to(roomCode).emit("roomUpdate", rooms[roomCode].players);
  });

  socket.on("joinRoom", ({ roomCode, username }) => {
    const room = requireRoom(roomCode);
    if (!room) return socket.emit("errorMessage", "Salle introuvable");
    if (room.phase !== "waiting") return socket.emit("errorMessage", "La partie a déjà commencé");
    room.players.push({ id: socket.id, username, coins: 0, influences: [] });
    socket.join(roomCode);
    io.to(roomCode).emit("roomUpdate", room.players);
  });

  socket.on("startGame", (roomCode) => {
    const room = requireRoom(roomCode);
    if (!room || room.host !== socket.id || room.phase !== "waiting") return;
    room.deck = shuffle([...ROLES]);
    room.phase = "playing";
    room.pendingAction = null;
    room.currentPlayerIndex = 0;
    room.players.forEach((p) => {
      p.coins = 2;
      p.influences = [{ role: room.deck.pop(), revealed: false }, { role: room.deck.pop(), revealed: false }];
    });
    io.to(roomCode).emit("gameStarted", makePublicRoom(room));
    room.players.forEach((p) => io.to(p.id).emit("yourCards", p.influences));
  });

  // +1 Revenu
  socket.on("takeCoins", ({ roomCode, amount }) => {
    const room = requireRoom(roomCode);
    if (!canActNow(room, socket.id) || amount !== 1) return;
    currentPlayer(room).coins = Math.min(currentPlayer(room).coins + 1, 12);
    finishPendingAndAdvance(roomCode);
  });

  // Aide étrangère — pas de challenge, fenêtre de blocage directe
  socket.on("foreignAid", ({ roomCode }) => {
    const room = requireRoom(roomCode);
    if (!canActNow(room, socket.id)) return;
    startPending(room, { type: "foreign_aid", actorId: socket.id, targetId: null, claimedRole: null });
    room.pendingAction.stage = "blockWindow";
    broadcastPending(roomCode);
  });

  // Duchesse +3 — challengeable
  socket.on("declareDuchesse", ({ roomCode }) => {
    const room = requireRoom(roomCode);
    if (!canActNow(room, socket.id)) return;
    startPending(room, { type: "duchess", actorId: socket.id, targetId: null, claimedRole: "Duchesse" });
    broadcastPending(roomCode);
  });

  // ──────────────────────────────────────────────────────
  // COUP (7 pièces, non contestable, obligatoire à 10+)
  // targetRole optionnel — permet de viser une carte précise si la cible en a 2
  // ──────────────────────────────────────────────────────
  socket.on("coup", ({ roomCode, targetId, targetRole }) => {
    const room = requireRoom(roomCode);
    if (!canActNow(room, socket.id)) return;
    const actor = currentPlayer(room);
    if (!actor || actor.coins < 7) return;
    const target = getPlayer(room, targetId);
    if (!target || !isAlive(target) || targetId === socket.id) return;

    actor.coins -= 7;

    // Le joueur choisit un rôle à viser — applyAction vérifie si c'est bon
    room.pendingAction = {
      type: "coup", actorId: socket.id, targetId,
      targetRole: targetRole || null, claimedRole: null, guessedRole: null,
      revealSpecificRole: null,
      stage: "awaitingReveal", awaitingRevealBy: targetId,
      resolveAfterReveal: "assassinationResolved",
      passes: new Set(), challengedBy: null, blockedBy: null, blockRole: null,
    };

    // Coup est non-contestable : on applique directement
    const coupRes = applyAction(room, room.pendingAction);
    if (coupRes === "coupMissed") {
      // Raté — pas de mustReveal, fin du tour
      room.pendingAction = null;
      finishPendingAndAdvance(roomCode);
      return;
    }
    // Touché — mustReveal sur la cible
    room.pendingAction.stage = "awaitingReveal";
    room.pendingAction.awaitingRevealBy = targetId;
    room.pendingAction.resolveAfterReveal = "assassinationResolved";
    io.to(targetId).emit("mustReveal", {
      roomCode, reason: "coup",
      targetRole: room.pendingAction.revealSpecificRole || null,
    });
    broadcastPending(roomCode);
  });

  // Vol (Capitaine) — challengeable + blockable
  socket.on("steal", ({ roomCode, targetId }) => {
    const room = requireRoom(roomCode);
    if (!canActNow(room, socket.id)) return;
    const target = getPlayer(room, targetId);
    if (!target || !isAlive(target) || targetId === socket.id) return;
    startPending(room, { type: "steal", actorId: socket.id, targetId, claimedRole: "Capitaine" });
    broadcastPending(roomCode);
  });

  // ──────────────────────────────────────────────────────
  // ASSASSINAT (Assassin, 3 pièces) — challengeable + blockable Comtesse
  //
  // Règles :
  //  - guessedRole = rôle que l'assassin cible sur la victime
  //  - Si contesté : on vérifie si l'acteur a Assassin
  //      → s'il l'a : le contestateur perd une carte ; PUIS si le rôle ciblé était bon → victime perd sa carte
  //      → s'il ne l'a pas : l'acteur perd une carte, action annulée
  //  - Si non contesté :
  //      → on passe en fenêtre de blocage (Comtesse)
  //      → si pas bloqué : on vérifie le guessedRole
  //          → touché → victime révèle ce rôle
  //          → raté → rien (mais les 3 pièces sont déjà perdues)
  // ──────────────────────────────────────────────────────
  socket.on("assassinate", ({ roomCode, targetId, guessedRole }) => {
    const room = requireRoom(roomCode);
    if (!canActNow(room, socket.id)) return;
    const actor = currentPlayer(room);
    if (!actor || actor.coins < 3) return;
    const target = getPlayer(room, targetId);
    if (!target || !isAlive(target) || targetId === socket.id) return;

    const validRoles = ["Duchesse","Assassin","Capitaine","Comtesse","Ambassadeur"];
    if (!validRoles.includes(guessedRole)) return;

    // 3 pièces déduites immédiatement (même si raté ou bloqué)
    actor.coins -= 3;

    startPending(room, {
      type: "assassinate",
      actorId: socket.id,
      targetId,
      claimedRole: "Assassin",
      guessedRole,
    });
    broadcastPending(roomCode);
  });

  // ──────────────────────────────────────────────────────
  // PASSE / CONTESTE
  // ──────────────────────────────────────────────────────
  socket.on("passChallenge", ({ roomCode }) => {
    const room = requireRoom(roomCode);
    if (!room || !room.pendingAction) return;
    const action = room.pendingAction;
    if (!["challengeAction","challengeBlock"].includes(action.stage)) return;
    if (action.stage === "challengeAction" && socket.id === action.actorId) return;
    if (action.stage === "challengeBlock"  && socket.id === action.blockedBy) return;

    action.passes.add(socket.id);
    const alive = alivePlayers(room);
    const required = alive.map(p => p.id).filter(id =>
      action.stage === "challengeAction" ? id !== action.actorId : id !== action.blockedBy
    );
    if (!required.every(id => action.passes.has(id))) return broadcastPending(roomCode);

    if (action.stage === "challengeAction") {
      const canBlock = (BLOCKS[action.type] || []).length > 0;
      if (canBlock) {
        action.stage = "blockWindow"; action.passes = new Set();
        return broadcastPending(roomCode);
      }
      return handleApplyResult(applyAction(room, action), room, action, roomCode);
    }

    if (action.stage === "challengeBlock") {
      // Le bloc tient — action annulée
      return finishPendingAndAdvance(roomCode);
    }
  });

  socket.on("challenge", ({ roomCode }) => {
    const room = requireRoom(roomCode);
    if (!room || !room.pendingAction) return;
    const action = room.pendingAction;
    if (!["challengeAction","challengeBlock"].includes(action.stage)) return;
    if (action.stage === "challengeAction" && socket.id === action.actorId) return;
    if (action.stage === "challengeBlock"  && socket.id === action.blockedBy) return;

    action.challengedBy = socket.id;

    let challengedPlayerId, challengedRole, onSuccess, onFail;
    if (action.stage === "challengeAction") {
      challengedPlayerId = action.actorId;
      challengedRole = action.claimedRole;
      onSuccess = "actionValid";
      onFail = "actionFail";
    } else {
      challengedPlayerId = action.blockedBy;
      challengedRole = action.blockRole;
      onSuccess = "blockValid";
      onFail = "blockFail";
    }

    const challenged = getPlayer(room, challengedPlayerId);
    const challenger = getPlayer(room, socket.id);
    if (!challenged || !challenger) return;

    const hasRole = challenged.influences.some(c => !c.revealed && c.role === challengedRole);

    if (hasRole) {
      // Contesté a raison → challenger perd une carte
      swapClaimedCardWithDeck(room, challenged, challengedRole);
      // Le joueur qui a prouvé reçoit ses nouvelles cartes (après swap)
      io.to(challenged.id).emit("yourCards", challenged.influences);
      // Le challenger reçoit aussi ses cartes pour forcer le refresh avant mustReveal
      io.to(challenger.id).emit("yourCards", challenger.influences);
      action.stage = "awaitingReveal";
      action.awaitingRevealBy = challenger.id;
      action.resolveAfterReveal = onSuccess;
      io.to(challenger.id).emit("mustReveal", { roomCode, reason: "challenge_lost" });
    } else {
      // Contesté a menti → contesté perd une carte
      action.stage = "awaitingReveal";
      action.awaitingRevealBy = challenged.id;
      action.resolveAfterReveal = onFail;
      io.to(challenged.id).emit("mustReveal", { roomCode, reason: "challenge_failed" });
    }
    broadcastPending(roomCode);
  });

  // ──────────────────────────────────────────────────────
  // BLOCAGE
  // ──────────────────────────────────────────────────────
  socket.on("blockAction", ({ roomCode, role }) => {
    const room = requireRoom(roomCode);
    if (!room || !room.pendingAction) return;
    const action = room.pendingAction;
    if (action.stage !== "blockWindow") return;
    const allowed = BLOCKS[action.type] || [];
    if (!allowed.includes(role)) return;
    if (action.type !== "foreign_aid") {
      if (!action.targetId || socket.id !== action.targetId) return;
    } else {
      if (socket.id === action.actorId) return;
    }
    action.blockedBy = socket.id;
    action.blockRole = role;
    action.stage = "challengeBlock";
    action.passes = new Set();
    broadcastPending(roomCode);
  });

  socket.on("passBlock", ({ roomCode }) => {
    const room = requireRoom(roomCode);
    if (!room || !room.pendingAction) return;
    const action = room.pendingAction;
    if (action.stage !== "blockWindow") return;
    if (socket.id === action.actorId) return;

    action.passes.add(socket.id);
    const alive = alivePlayers(room);
    const required = alive.map(p => p.id).filter(id => id !== action.actorId);
    if (!required.every(id => action.passes.has(id))) return broadcastPending(roomCode);

    return handleApplyResult(applyAction(room, action), room, action, roomCode);
  });

  // ──────────────────────────────────────────────────────
  // RÉVÉLATION D'INFLUENCE
  // ──────────────────────────────────────────────────────
  socket.on("revealInfluence", ({ roomCode, index }) => {
    const room = requireRoom(roomCode);
    if (!room || !room.pendingAction) return;
    const action = room.pendingAction;
    if (action.stage !== "awaitingReveal") return;
    if (socket.id !== action.awaitingRevealBy) return;

    const player = getPlayer(room, socket.id);
    if (!player) return;
    if (index < 0 || index >= player.influences.length) return;
    if (player.influences[index].revealed) return;

    // Si un rôle précis doit être révélé, bloquer la mauvaise carte
    if (action.revealSpecificRole) {
      if (player.influences[index].role !== action.revealSpecificRole) return;
    }

    player.influences[index].revealed = true;
    // Notifier le joueur de ses cartes mises à jour
    io.to(player.id).emit("yourCards", player.influences);
    // Notifier aussi tous les autres joueurs de leurs cartes (refresh général)
    room.players.forEach(p => {
      if (p.id !== player.id) io.to(p.id).emit("yourCards", p.influences);
    });

    const outcome = action.resolveAfterReveal;

    if (outcome === "actionFail") return finishPendingAndAdvance(roomCode);

    if (outcome === "actionValid") {
      const canBlock = (BLOCKS[action.type] || []).length > 0;
      if (canBlock) {
        action.stage = "blockWindow"; action.passes = new Set();
        action.challengedBy = null; action.awaitingRevealBy = null; action.resolveAfterReveal = null;
        return broadcastPending(roomCode);
      }
      return handleApplyResult(applyAction(room, action), room, action, roomCode);
    }

    if (outcome === "blockValid") return finishPendingAndAdvance(roomCode);

    if (outcome === "blockFail") {
      // Le blocage a échoué → l'action s'applique quand même
      return handleApplyResult(applyAction(room, action), room, action, roomCode);
    }

    if (outcome === "assassinationResolved") return finishPendingAndAdvance(roomCode);

    finishPendingAndAdvance(roomCode);
  });

  // ──────────────────────────────────────────────────────
  // AMBASSADEUR — échange
  // ──────────────────────────────────────────────────────
  socket.on("exchangeRequest", ({ roomCode }) => {
    const room = requireRoom(roomCode);
    if (!canActNow(room, socket.id)) return;
    startPending(room, { type: "exchange", actorId: socket.id, targetId: null, claimedRole: "Ambassadeur" });
    broadcastPending(roomCode);
  });

  socket.on("exchangeConfirm", ({ roomCode, selectedCards }) => {
    const room = requireRoom(roomCode);
    if (!room || room.phase !== "playing") return;
    const current = currentPlayer(room);
    if (!current || current.id !== socket.id) return;
    // Le joueur doit garder autant de cartes qu'il en a de non révélées
    const keepCount = current.influences.filter(c => !c.revealed).length;
    if (!selectedCards || selectedCards.length !== keepCount) return;

    const available = [...current.influences.filter(c => !c.revealed), ...(current.tempDrawn || [])];
    const copy = [...available];
    for (const card of selectedCards) {
      const idx = copy.findIndex(c => c.role === card.role && c.revealed === card.revealed);
      if (idx === -1) return;
      copy.splice(idx, 1);
    }
    copy.forEach(card => room.deck.push(card.role));
    // Garder les cartes révélées + les nouvelles cartes choisies
    const revealedCards = current.influences.filter(c => c.revealed);
    current.influences = [...revealedCards, ...selectedCards];
    current.tempDrawn = null;
    shuffle(room.deck);
    room.pendingAction = null;
    nextAliveIndex(room);
    broadcastUpdate(roomCode);
    io.to(socket.id).emit("yourCards", current.influences);
  });

  // ──────────────────────────────────────────────────────
  // DÉCONNEXION
  // ──────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      room.players = room.players.filter(p => p.id !== socket.id);
      if (room.players.length === 0) { delete rooms[roomCode]; continue; }
      if (room.host === socket.id) room.host = room.players[0].id;
      if (room.pendingAction) {
        const pa = room.pendingAction;
        if ([pa.actorId, pa.targetId, pa.blockedBy, pa.awaitingRevealBy].includes(socket.id)) {
          room.pendingAction = null;
        }
      }
      if (room.phase === "playing") {
        if (room.currentPlayerIndex >= room.players.length) room.currentPlayerIndex = 0;
        io.to(roomCode).emit("gameUpdate", makePublicRoom(room));
      } else {
        io.to(roomCode).emit("roomUpdate", room.players);
      }
    }
  });
});

server.listen(3001, () => console.log("Server running on port 3001"));
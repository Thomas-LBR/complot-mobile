import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ActionButton from "../components/ActionButton";
import Card from "../components/Card";
import PlayerBoard from "../components/PlayerBoard";
import { ALL_ROLES, BLOCKS, ROLES } from "../game/cards";
import { useEngine } from "../game/EngineContext";
import { CardState, PublicPlayer, RoleName } from "../game/types";
import { alivePlayers, isMyTurn, mustCoup, pendingLabel, stageLabel } from "../game/utils";

// ─── Modal générique ──────────────────────────────────────────────────────────
function GameModal({ visible, title, children, onClose }: {
  visible: boolean; title: string; children: React.ReactNode; onClose?: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={m.overlay}>
        <View style={m.box}>
          <Text style={m.title}>{title}</Text>
          {children}
          {onClose && (
            <TouchableOpacity onPress={onClose} style={m.closeBtn}>
              <Text style={m.closeTxt}>✕ Fermer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
  box:     { backgroundColor: "#120a04", borderRadius: 14, borderWidth: 1, borderColor: "rgba(160,110,30,0.5)", padding: 20, width: "100%", maxWidth: 380, gap: 12 },
  title:   { color: "#c9922a", fontSize: 18, fontWeight: "800", textAlign: "center", letterSpacing: 1 },
  closeBtn:{ alignItems: "center", marginTop: 4 },
  closeTxt:{ color: "#665544", fontSize: 13 },
});

// ─── Sélecteur de rôle ────────────────────────────────────────────────────────
function RolePicker({ onPick, title }: { onPick: (r: RoleName) => void; title: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: "#886644", fontSize: 13, textAlign: "center" }}>{title}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {ALL_ROLES.map((role) => {
          const r = ROLES[role];
          return (
            <TouchableOpacity key={role}
              onPress={() => onPick(role)}
              style={{ backgroundColor: r.bg, borderWidth: 1.5, borderColor: r.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center" }}
            >
              <Text style={{ fontSize: 18, color: r.color }}>{r.symbol}</Text>
              <Text style={{ fontSize: 11, color: r.color, marginTop: 2 }}>{role}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function GameScreen() {
  const router = useRouter();
  const engine = useEngine();

  // Modales
  const [showTargetModal, setShowTargetModal]     = useState(false);
  const [showRoleModal, setShowRoleModal]         = useState(false);
  const [pendingAction, setPendingAction]         = useState<"steal"|"assassinate"|"coup"|null>(null);
  const [pendingTarget, setPendingTarget]         = useState<PublicPlayer | null>(null);
  const [showExchange, setShowExchange]           = useState(false);
  const [selectedExchange, setSelectedExchange]   = useState<string[]>([]); // poolKeys des cartes sélectionnées
  const [showReveal, setShowReveal]               = useState(false);

  useEffect(() => {
    if (!engine || !engine.room) { router.replace("/"); return; }
  }, []);

  // Ouvrir exchange quand options arrivent
  useEffect(() => {
    if (engine?.exchangeOptions) {
      setSelectedExchange([]); // reset poolKeys
      setShowExchange(true);
    }
  }, [engine?.exchangeOptions]);

  // Ouvrir révélation quand mustReveal arrive
  useEffect(() => {
    if (engine?.mustReveal) setShowReveal(true);
  }, [engine?.mustReveal]);

  // Fin de partie — écran de victoire
  const [winner, setWinner] = useState<string | null>(null);
  const [iWon, setIWon]     = useState(false);

  useEffect(() => {
    if (engine?.room?.phase === "finished") {
      const alive = alivePlayers(engine.room);
      const w = alive[0]?.username ?? "?";
      setWinner(w);
      setIWon(alive[0]?.id === engine.myId);
    }
  }, [engine?.room?.phase]);

  // ── Écran de victoire ──────────────────────────────────────────────────────
  if (winner) {
    return (
      <SafeAreaView style={v.root}>
        <View style={v.container}>
          <Text style={v.trophy}>{iWon ? "🏆" : "☠"}</Text>
          <Text style={v.title}>{iWon ? "Victoire !" : "Défaite..."}</Text>
          <Text style={v.subtitle}>
            {iWon ? "Vous avez survécu à tous les complots !" : `${winner} remporte la partie`}
          </Text>

          <View style={v.winnerBox}>
            <Text style={v.winnerLabel}>Vainqueur</Text>
            <Text style={v.winnerName}>⚓ {winner}</Text>
          </View>

          {/* Classement final */}
          <View style={v.rankList}>
            <Text style={v.rankTitle}>Classement final</Text>
            {engine.room?.players.map((p: PublicPlayer, i: number) => (
              <View key={p.id} style={[v.rankRow, p.alive && v.rankRowWinner]}>
                <Text style={v.rankPos}>{p.alive ? "🥇" : `${i + 1}.`}</Text>
                <Text style={[v.rankName, p.alive && v.rankNameWinner]}>{p.username}</Text>
                <Text style={v.rankStatus}>{p.alive ? "Survivant" : "Éliminé"}</Text>
              </View>
            ))}
          </View>

          <ActionButton
            label="⚓ Retour à l'accueil"
            onPress={() => { engine.reset(); router.replace("/"); }}
            variant="warning"
            style={{ marginTop: 8 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!engine?.room) return null;

  const { room, myCards, myId, mustReveal, exchangeOptions } = engine;
  const me = room.players.find((p: PublicPlayer) => p.id === myId);
  const myTurn   = isMyTurn(room, myId);
  const forceCoup = myTurn && mustCoup(room, myId);
  const pa       = room.pendingAction;
  const alive    = alivePlayers(room);

  // ── Handlers principaux ─────────────────────────────────────────────────
  const onSteal       = () => { setPendingAction("steal");      setShowTargetModal(true); };
  const onAssassinate = () => { setPendingAction("assassinate"); setShowTargetModal(true); };
  const onCoup        = () => { setPendingAction("coup");        setShowTargetModal(true); };

  const onTargetPick = (target: PublicPlayer) => {
    setPendingTarget(target);
    setShowTargetModal(false);
    if (pendingAction === "steal") {
      engine.steal(target.id);
      setPendingAction(null);
    } else {
      // Assassinat / Coup → choisir un rôle
      setShowRoleModal(true);
    }
  };

  const onRolePick = (role: RoleName) => {
    setShowRoleModal(false);
    if (pendingAction === "assassinate") engine.assassinate(pendingTarget!.id, role);
    if (pendingAction === "coup")        engine.coup(pendingTarget!.id, role);
    setPendingAction(null);
    setPendingTarget(null);
  };

  // ── Exchange ────────────────────────────────────────────────────────────
  // Chaque carte a une clé unique "source:index" pour distinguer les doublons
  const getExchangePool = (): Array<CardState & { poolKey: string; source: "current"|"drawn"; sourceIdx: number }> => {
    if (!exchangeOptions) return [];
    return [
      ...exchangeOptions.currentCards.map((c, i) => ({ ...c, poolKey: `current-${i}`, source: "current" as const, sourceIdx: i })),
      ...exchangeOptions.drawnCards.map((c, i)   => ({ ...c, poolKey: `drawn-${i}`,   source: "drawn"   as const, sourceIdx: i })),
    ];
  };

  // Nombre de cartes à garder = nombre de cartes actuelles (non révélées)
  const keepCount = exchangeOptions?.currentCards.length ?? 2;

  const toggleExchangeIdx = (poolKey: string) => {
    if (selectedExchange.includes(poolKey)) {
      setSelectedExchange(selectedExchange.filter((k) => k !== poolKey));
    } else if (selectedExchange.length < keepCount) {
      setSelectedExchange([...selectedExchange, poolKey]);
    }
  };

  const confirmExchange = () => {
    if (selectedExchange.length !== keepCount || !exchangeOptions) return;
    const pool = getExchangePool();
    const selected: CardState[] = selectedExchange.map((key) => {
      const card = pool.find((c) => c.poolKey === key)!;
      return { role: card.role, revealed: false };
    });
    engine.exchangeConfirm(selected);
    setShowExchange(false);
  };

  // ── Révélation ──────────────────────────────────────────────────────────
  const onRevealCard = (idx: number) => {
    const card = myCards[idx];
    if (!card || card.revealed) return;
    if (mustReveal?.targetRole && card.role !== mustReveal.targetRole) {
      Alert.alert("Mauvaise carte", `Tu dois révéler ta carte ${mustReveal.targetRole}`);
      return;
    }
    engine.revealInfluence(idx);
    setShowReveal(false);
  };

  // ── Qui est en attente de quoi ─────────────────────────────────────────
  const iAmActor  = pa?.actorId === myId;
  const iAmTarget = pa?.targetId === myId;
  const iAmBlocker = pa?.blockedBy === myId;

  const canChallenge   = pa && ["challengeAction","challengeBlock"].includes(pa.stage)
    && (pa.stage === "challengeAction" ? !iAmActor : !iAmBlocker);
  const canPassChallenge = canChallenge;

  const canBlock   = pa && pa.stage === "blockWindow"
    && !iAmActor
    && (pa.type === "foreign_aid" ? true : iAmTarget)
    && (BLOCKS[pa.type]?.length ?? 0) > 0;

  const canPassBlock = pa && pa.stage === "blockWindow" && !iAmActor;

  // Rôles disponibles pour bloquer
  const blockRoles: RoleName[] = canBlock ? (BLOCKS[pa!.type] ?? []) : [];

  return (
    <SafeAreaView style={s.root}>
      {/* ── Bandeau action en cours ── */}
      {pa && (
        <View style={s.pendingBanner}>
          <Text style={s.pendingText}>{pendingLabel(pa, room.players)}</Text>
          <Text style={s.stageText}>{stageLabel(pa)}</Text>
        </View>
      )}

      {/* ── Corps principal ── */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>

        {/* Joueurs adverses */}
        {room.players
          .filter((p: PublicPlayer) => p.id !== myId)
          .map((p: PublicPlayer) => (
            <PlayerBoard
              key={p.id}
              player={p}
              isActive={room.players[room.currentPlayerIndex]?.id === p.id}
              isTarget={pa?.targetId === p.id}
              compact
            />
          ))}

        {/* Moi */}
        {me && (
          <View style={s.mySection}>
            <Text style={s.mySectionLabel}>— Votre main —</Text>
            <PlayerBoard
              player={me}
              myCards={myCards}
              isMe
              isActive={myTurn}
            />
          </View>
        )}

        {/* ── Actions de tour (mon tour, pas d'action pendante) ── */}
        {myTurn && !pa && (
          <View style={s.actionPanel}>
            <Text style={s.actionTitle}>
              {forceCoup ? "⚠ Coup obligatoire (10+ pièces)" : "Votre action"}
            </Text>

            {!forceCoup && (
              <View style={s.actionGrid}>
                <ActionButton label="💰 +1 Revenu"          onPress={() => engine.takeCoins(1)}       variant="ghost"   small />
                <ActionButton label="💰💰 Aide étrangère"    onPress={() => engine.foreignAid()}       variant="ghost"   small />
                <ActionButton label="♛ Duchesse +3"         onPress={() => engine.declareDuchesse()}  variant="warning" small />
                <ActionButton label="☮ Échange"             onPress={() => engine.exchangeRequest()}  variant="success" small />
                <ActionButton label="⚓ Voler"              onPress={onSteal}                          variant="primary" small disabled={alive.filter((p: PublicPlayer) => p.id !== myId).length === 0}/>
                {(me?.coins ?? 0) >= 3 && (
                  <ActionButton label="⚔ Assassiner (3💰)"  onPress={onAssassinate} variant="danger" small />
                )}
                {(me?.coins ?? 0) >= 7 && (
                  <ActionButton label="💥 Coup (7💰)"        onPress={onCoup}         variant="danger" small />
                )}
              </View>
            )}

            {forceCoup && (
              <ActionButton label="💥 Coup d'État (7💰)" onPress={onCoup} variant="danger" />
            )}
          </View>
        )}

        {/* ── Réactions (challenge / block) ── */}
        {pa && !myTurn && (
          <View style={s.reactionPanel}>
            {canChallenge && (
              <View style={s.reactionRow}>
                <ActionButton label="⚡ Contester" onPress={() => engine.challenge()}     variant="danger"  />
                <ActionButton label="✓ Passer"     onPress={() => engine.passChallenge()} variant="ghost"   />
              </View>
            )}
            {canBlock && blockRoles.length > 0 && (
              <View style={s.reactionRow}>
                {blockRoles.map((role) => (
                  <ActionButton key={role}
                    label={`🛡 Bloquer (${role})`}
                    onPress={() => engine.blockAction(role)}
                    variant="purple"
                  />
                ))}
                <ActionButton label="✓ Passer" onPress={() => engine.passBlock()} variant="ghost" />
              </View>
            )}
            {canPassBlock && !canBlock && (
              <ActionButton label="✓ Laisser passer" onPress={() => engine.passBlock()} variant="ghost" />
            )}
            {/* Message d'attente */}
            {!canChallenge && !canBlock && !canPassBlock && (
              <Text style={s.waiting}>⏳ En attente des autres joueurs…</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* ══ MODAL : Choisir une cible ══ */}
      <GameModal visible={showTargetModal} title="Choisir une cible" onClose={() => { setShowTargetModal(false); setPendingAction(null); }}>
        {alive
          .filter((p: PublicPlayer) => p.id !== myId)
          .map((p: PublicPlayer) => (
            <TouchableOpacity key={p.id} onPress={() => onTargetPick(p)} style={s.targetRow}>
              <Text style={s.targetName}>{p.username}</Text>
              <Text style={s.targetCoins}>💰 {p.coins} · ♦ ×{p.influenceCount}</Text>
            </TouchableOpacity>
          ))}
      </GameModal>

      {/* ══ MODAL : Choisir le rôle visé ══ */}
      <GameModal visible={showRoleModal} title={`Viser quel rôle de ${pendingTarget?.username} ?`} onClose={() => { setShowRoleModal(false); setPendingAction(null); }}>
        <RolePicker
          title={pendingAction === "coup" ? "Quel rôle voulez-vous éliminer ?" : "Quel rôle pensez-vous qu'il possède ?"}
          onPick={onRolePick}
        />
      </GameModal>

      {/* ══ MODAL : Révéler une carte ══ */}
      <GameModal visible={showReveal && !!mustReveal} title="Révélez une influence">
        <Text style={s.revealReason}>
          {mustReveal?.reason === "challenge_lost"  && "Votre contestation a échoué — révélez une carte."}
          {mustReveal?.reason === "challenge_failed"&& "Votre bluff a été percé — révélez une carte."}
          {mustReveal?.reason === "assassinated"    && mustReveal.targetRole
            ? `Vous êtes assassiné·e — révélez votre ${mustReveal.targetRole}.`
            : "Vous êtes assassiné·e."}
          {mustReveal?.reason === "coup"            && mustReveal.targetRole
            ? `Coup d'État — révélez votre ${mustReveal.targetRole}.`
            : "Coup d'État — révélez une carte."}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 8 }}>
          {myCards.map((card, i) =>
            !card.revealed ? (
              <TouchableOpacity key={i} onPress={() => onRevealCard(i)}>
                <Card role={card.role} width={70} height={98} glowing />
              </TouchableOpacity>
            ) : null
          )}
        </View>
      </GameModal>

      {/* ══ MODAL : Échange Ambassadeur ══ */}
      <GameModal visible={showExchange && !!exchangeOptions} title="☮ Échange — choisissez 2 cartes à garder">
        {exchangeOptions && (
          <>
            <Text style={s.exchangeHint}>Vos cartes actuelles + les 2 piochées · Sélectionnez 2 à conserver</Text>
            <View style={s.exchangePool}>
              {getExchangePool().map((c) => {
                const sel = selectedExchange.includes(c.poolKey);
                return (
                  <TouchableOpacity key={c.poolKey} onPress={() => toggleExchangeIdx(c.poolKey)}
                    style={[s.exchangeCard, sel && s.exchangeCardSel]}>
                    <Card role={c.role as RoleName} width={60} height={84} glowing={sel} />
                    {c.source === "drawn" && <Text style={s.drawnBadge}>Piochée</Text>}
                    {sel && <Text style={s.selBadge}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
            <ActionButton
              label={`Confirmer (${selectedExchange.length}/${keepCount} sélectionnée${keepCount > 1 ? "s" : ""})`}
              onPress={confirmExchange}
              disabled={selectedExchange.length !== keepCount}
            />
          </>
        )}
      </GameModal>
    </SafeAreaView>
  );
}

// ─── Styles victoire ─────────────────────────────────────────────────────────
const v = StyleSheet.create({
  root:      { flex: 1, backgroundColor: "#050402" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 16 },
  trophy:    { fontSize: 80 },
  title:     { fontSize: 38, fontWeight: "900", color: "#c9922a", letterSpacing: 2 },
  subtitle:  { fontSize: 14, color: "#886644", textAlign: "center", lineHeight: 20 },
  winnerBox: {
    backgroundColor: "rgba(40,25,4,0.95)", borderRadius: 14,
    borderWidth: 2, borderColor: "#c9922a",
    paddingHorizontal: 32, paddingVertical: 14,
    alignItems: "center", gap: 4,
    shadowColor: "#c9922a", shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  winnerLabel: { color: "#886644", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  winnerName:  { color: "#ffe066", fontSize: 26, fontWeight: "900", letterSpacing: 2 },
  rankList:    { width: "100%", gap: 6 },
  rankTitle:   { color: "#664422", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", textAlign: "center", marginBottom: 4 },
  rankRow:     { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(15,8,2,0.8)", borderRadius: 8, borderWidth: 1, borderColor: "rgba(80,50,10,0.3)", padding: 10, gap: 10 },
  rankRowWinner: { borderColor: "#c9922a", backgroundColor: "rgba(40,22,2,0.95)" },
  rankPos:     { fontSize: 16, width: 28, textAlign: "center" },
  rankName:    { flex: 1, color: "#886644", fontSize: 14, fontWeight: "600" },
  rankNameWinner: { color: "#ffe066" },
  rankStatus:  { color: "#554433", fontSize: 11 },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#050402" },
  scroll: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 40, gap: 8 },

  pendingBanner: {
    backgroundColor: "rgba(30,18,4,0.95)",
    borderBottomWidth: 1, borderBottomColor: "rgba(160,110,30,0.4)",
    paddingHorizontal: 16, paddingVertical: 8,
  },
  pendingText: { color: "#c9922a", fontWeight: "700", fontSize: 13, textAlign: "center" },
  stageText:   { color: "#886644", fontSize: 11,    textAlign: "center", marginTop: 2 },

  mySection:      { marginTop: 8 },
  mySectionLabel: { color: "#664422", fontSize: 11, textAlign: "center", letterSpacing: 1, marginBottom: 4 },

  actionPanel: {
    backgroundColor: "rgba(10,18,6,0.9)",
    borderRadius: 10, borderWidth: 1, borderColor: "rgba(50,100,30,0.4)",
    padding: 14, gap: 10, marginTop: 8,
  },
  actionTitle: { color: "#88cc44", fontWeight: "700", fontSize: 13, textAlign: "center" },
  actionGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },

  reactionPanel: {
    backgroundColor: "rgba(20,6,6,0.9)",
    borderRadius: 10, borderWidth: 1, borderColor: "rgba(100,30,30,0.4)",
    padding: 14, gap: 8, marginTop: 8,
  },
  reactionRow: { flexDirection: "row", gap: 8, justifyContent: "center", flexWrap: "wrap" },
  waiting:     { color: "#664444", textAlign: "center", fontSize: 13 },

  targetRow:  { backgroundColor: "rgba(20,12,4,0.8)", borderRadius: 8, borderWidth: 1, borderColor: "rgba(200,100,30,0.4)", padding: 12, marginBottom: 6 },
  targetName: { color: "#e8d0a0", fontWeight: "700", fontSize: 15 },
  targetCoins:{ color: "#886644", fontSize: 12, marginTop: 2 },

  revealReason: { color: "#cc8844", textAlign: "center", fontSize: 13, lineHeight: 18 },

  exchangeHint: { color: "#886644", textAlign: "center", fontSize: 12 },
  exchangePool: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginVertical: 8 },
  exchangeCard: { alignItems: "center", padding: 4, borderRadius: 8, borderWidth: 1.5, borderColor: "transparent" },
  exchangeCardSel: { borderColor: "#44dd88", backgroundColor: "rgba(30,60,30,0.4)" },
  drawnBadge: { color: "#44aa88", fontSize: 10, marginTop: 4, fontWeight: "700" },
  selBadge:   { color: "#44dd88", fontSize: 16, fontWeight: "900" },
});
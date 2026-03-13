import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, Share, StyleSheet, Text, View } from "react-native";
import ActionButton from "../components/ActionButton";
import { useEngine } from "../game/EngineContext";

export default function LobbyScreen() {
  const router = useRouter();
  const engine = useEngine();

  useEffect(() => {
    if (!engine.roomCode) { router.replace("/"); return; }
  }, []);

  useEffect(() => {
    if (engine.room?.phase === "playing") {
      router.push("/game");
    }
  }, [engine.room?.phase]);

  const players  = engine.lobbyPlayers ?? [];
  const isHost   = engine.myId === players[0]?.id;
  const canStart = isHost && players.length >= 2;
  const roomCode = engine.roomCode ?? "…";

  const shareCode = () =>
    Share.share({ message: `Rejoins ma partie de Complot ! Code : ${roomCode}` });

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>⚓ Salle d&apos;embarquement</Text>
        <View style={styles.codeRow}>
          <Text style={styles.codeLabel}>Code</Text>
          <Text style={styles.code}>{roomCode}</Text>
          <ActionButton label="📋 Partager" onPress={shareCode} variant="ghost" small />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Équipage ({players.length})</Text>

      <FlatList
        data={players}
        keyExtractor={(p) => p.id}
        renderItem={({ item, index }) => (
          <View style={styles.playerRow}>
            <Text style={styles.playerIndex}>{index + 1}</Text>
            <Text style={styles.playerName}>{item.username}</Text>
            {index === 0 && <Text style={styles.hostBadge}>Capitaine</Text>}
            {item.id === engine.myId && index !== 0 && (
              <Text style={styles.meBadge}>Moi</Text>
            )}
          </View>
        )}
        style={styles.list}
      />

      <View style={styles.footer}>
        {isHost ? (
          <>
            {!canStart && <Text style={styles.hint}>En attente d&apos;au moins 2 joueurs…</Text>}
            <ActionButton label="⚓ Appareiller !" onPress={() => engine.startGame()} disabled={!canStart} />
          </>
        ) : (
          <Text style={styles.hint}>En attente du capitaine…</Text>
        )}
        <ActionButton
          label="Quitter"
          onPress={() => { engine.reset(); router.replace("/"); }}
          variant="danger" small
        />
      </View>

      {engine.error && <Text style={styles.error}>{engine.error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#050402", padding: 20, paddingTop: 60 },
  header: { marginBottom: 24 },
  title:  { fontSize: 22, fontWeight: "900", color: "#c9922a", letterSpacing: 2, marginBottom: 12 },
  codeRow:   { flexDirection: "row", alignItems: "center", gap: 10 },
  codeLabel: { color: "#886644", fontSize: 13 },
  code:      { fontSize: 28, fontWeight: "900", color: "#ffe066", letterSpacing: 4 },
  sectionTitle: { color: "#886644", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  list: { flex: 1, marginBottom: 16 },
  playerRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(20,12,4,0.85)", borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(160,110,30,0.25)",
    padding: 12, marginBottom: 6, gap: 10,
  },
  playerIndex: { color: "#664422", width: 20, textAlign: "center", fontWeight: "700" },
  playerName:  { flex: 1, color: "#e8d0a0", fontSize: 15, fontWeight: "600" },
  hostBadge: { backgroundColor: "rgba(180,130,20,0.25)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, color: "#c9922a", fontSize: 11, fontWeight: "700" },
  meBadge:   { backgroundColor: "rgba(30,80,20,0.3)",   borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, color: "#88ee44", fontSize: 11, fontWeight: "700" },
  footer: { gap: 10, paddingBottom: 20 },
  hint:   { color: "#665544", textAlign: "center", fontSize: 13 },
  error:  { color: "#ee4444", textAlign: "center", fontSize: 13, marginTop: 8 },
});
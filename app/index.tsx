import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform, ScrollView,
    StyleSheet,
    Text, TextInput,
    View,
} from "react-native";
import ActionButton from "../components/ActionButton";
import { useEngine } from "../game/EngineContext";

export default function IndexScreen() {
  const router = useRouter();
  const engine = useEngine();

  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"none" | "create" | "join">("none");

  useEffect(() => {
    if (engine.roomCode) {
      router.push("/lobby");
    }
  }, [engine.roomCode]);

  const handleCreate = () => {
    if (!username.trim()) return Alert.alert("Entrez un pseudo");
    engine.createRoom(username.trim());
  };

  const handleJoin = () => {
    if (!username.trim()) return Alert.alert("Entrez un pseudo");
    if (!roomCode.trim()) return Alert.alert("Entrez un code de salle");
    engine.joinRoom(roomCode.trim().toUpperCase(), username.trim());
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.titleWrap}>
          <Text style={styles.titleMain}>⚓ COMPLOT</Text>
          <Text style={styles.titleSub}>Jeu de déduction pirate</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Votre nom</Text>
          <TextInput
            style={styles.input}
            placeholder="Capitaine Crochet…"
            placeholderTextColor="#554433"
            value={username}
            onChangeText={setUsername}
            maxLength={20}
            autoCapitalize="words"
          />

          {mode === "none" && (
            <View style={styles.btns}>
              <ActionButton label="⚓ Créer une salle" onPress={() => setMode("create")} />
              <ActionButton label="🗺 Rejoindre" onPress={() => setMode("join")} variant="warning" />
            </View>
          )}

          {mode === "create" && (
            <View style={styles.btns}>
              <ActionButton label="⚓ Créer la salle" onPress={handleCreate} loading={!!engine.roomCode} />
              <ActionButton label="Retour" onPress={() => setMode("none")} variant="ghost" small />
            </View>
          )}

          {mode === "join" && (
            <>
              <Text style={[styles.label, { marginTop: 14 }]}>Code de salle</Text>
              <TextInput
                style={styles.input}
                placeholder="EX: A3B9C"
                placeholderTextColor="#554433"
                value={roomCode}
                onChangeText={setRoomCode}
                maxLength={6}
                autoCapitalize="characters"
              />
              <View style={styles.btns}>
                <ActionButton label="🗺 Rejoindre" onPress={handleJoin} variant="warning" />
                <ActionButton label="Retour" onPress={() => setMode("none")} variant="ghost" small />
              </View>
            </>
          )}

          {engine.error && <Text style={styles.error}>{engine.error}</Text>}
          {!engine.connected
            ? <Text style={styles.disconnected}>⚡ Connexion au serveur…</Text>
            : <Text style={styles.connected}>● Connecté</Text>
          }
        </View>

        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>Règles éclair</Text>
          {[
            ["👑 Duchesse",    "Prend 3 pièces - bloque l'aide étrangère"],
            ["⚔ Assassin",     "Dépense 3💰 pour assassiner"],
            ["⚓ Capitaine",   "Vole 2💰 à un joueur - bloque le vol"],
            ["❤️ Comtesse",    "Bloque l'assassin"],
            ["☮ Ambassadeur", "Échange ses cartes - bloque le vol"],
          ].map(([role, desc]) => (
            <Text key={role} style={styles.rulesLine}>
              <Text style={styles.rulesRole}>{role}  </Text>
              <Text style={styles.rulesDesc}>{desc}</Text>
            </Text>
          ))}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#050402" },
  scroll: { padding: 24, paddingTop: 60, gap: 20 },
  titleWrap: { alignItems: "center", marginBottom: 10 },
  titleMain: { fontSize: 36, fontWeight: "900", color: "#c9922a", letterSpacing: 3 },
  titleSub:  { fontSize: 13, color: "#886644", marginTop: 4, letterSpacing: 1 },
  card: {
    backgroundColor: "rgba(20,12,4,0.9)", borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(160,110,30,0.35)", padding: 20, gap: 10,
  },
  label: { color: "#c9922a", fontSize: 12, fontWeight: "700", letterSpacing: 0.8, marginBottom: 2 },
  input: {
    backgroundColor: "rgba(10,6,2,0.8)", borderRadius: 8, borderWidth: 1,
    borderColor: "rgba(160,110,30,0.4)", color: "#e8d0a0",
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
  },
  btns:         { gap: 8, marginTop: 6 },
  error:        { color: "#ee4444", textAlign: "center", fontSize: 13, marginTop: 6 },
  disconnected: { color: "#886633", textAlign: "center", fontSize: 12, marginTop: 4 },
  connected:    { color: "#44aa44", textAlign: "center", fontSize: 12, marginTop: 4 },
  rules: {
    backgroundColor: "rgba(10,6,2,0.6)", borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(80,60,20,0.3)", padding: 14, gap: 6,
  },
  rulesTitle: { color: "#886644", fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" },
  rulesLine:  { flexDirection: "row", flexWrap: "wrap" },
  rulesRole:  { color: "#c9922a", fontSize: 12, fontWeight: "700" },
  rulesDesc:  { color: "#665544", fontSize: 12 },
});
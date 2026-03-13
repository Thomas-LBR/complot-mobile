import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CardState, PublicPlayer, RoleName } from "../game/types";
import { colorFromUsername, initials } from "../game/utils";
import Card from "./Card";

interface PlayerBoardProps {
  player: PublicPlayer;
  myCards?: CardState[];          // seulement pour le joueur local
  isMe?: boolean;
  isActive?: boolean;             // c'est son tour
  isTarget?: boolean;             // il est ciblé par une action en cours
  mustChoose?: boolean;           // je dois choisir ce joueur (vol/assassinat/coup)
  onPress?: () => void;
  compact?: boolean;              // mode réduit pour les adversaires
}

export default function PlayerBoard({
  player, myCards, isMe, isActive, isTarget, mustChoose, onPress, compact,
}: PlayerBoardProps) {
  const avatarBg  = colorFromUsername(player.username, 0);
  const avatarBg2 = colorFromUsername(player.username, 120);
  const dead = !player.alive;

  // Cartes à afficher
  const cards: Array<{ role?: RoleName; revealed: boolean; faceDown: boolean }> =
    isMe && myCards
      ? myCards.map((c) => ({ role: c.role, revealed: c.revealed, faceDown: false }))
      : Array.from({ length: 2 }, (_, i) => {
          const rev = player.revealedInfluences[i];
          return rev
            ? { role: rev.role as RoleName, revealed: true,  faceDown: false }
            : { role: undefined,           revealed: false, faceDown: !dead };
        });

  const cardW = compact ? 38 : 48;
  const cardH = compact ? 54 : 68;

  const content = (
    <View style={[
      styles.container,
      isActive  && styles.active,
      isTarget  && styles.targeted,
      mustChoose && styles.choosable,
      dead       && styles.dead,
      compact    && styles.compactContainer,
    ]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarBg, borderColor: avatarBg2 }]}>
        <Text style={styles.avatarText}>{initials(player.username)}</Text>
        {isActive && <View style={styles.activeDot} />}
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <Text style={[styles.name, dead && styles.deadText]} numberOfLines={1}>
          {player.username}{isMe ? " (moi)" : ""}
        </Text>
        <Text style={styles.coins}>💰 {player.coins}</Text>
        {!compact && (
          <Text style={[styles.influences, dead && styles.deadText]}>
            {dead ? "☠ Éliminé" : `♦ ×${player.influenceCount}`}
          </Text>
        )}
      </View>

      {/* Cartes */}
      <View style={styles.cards}>
        {cards.map((c, i) => (
          <Card
            key={i}
            role={c.role ?? null}
            revealed={c.revealed}
            faceDown={c.faceDown}
            width={cardW}
            height={cardH}
            glowing={isActive && !dead}
            dimmed={dead && !c.revealed}
            style={styles.cardSpacing}
          />
        ))}
      </View>

      {/* Badge ciblé */}
      {isTarget && (
        <View style={styles.targetBadge}><Text style={styles.targetBadgeText}>⚠</Text></View>
      )}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.75}>{content}</TouchableOpacity>;
  }
  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20,12,4,0.85)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(160,110,30,0.25)",
    padding: 8,
    gap: 8,
    marginVertical: 3,
  },
  compactContainer: {
    padding: 5,
    gap: 5,
  },
  active: {
    borderColor: "rgba(200,160,40,0.7)",
    backgroundColor: "rgba(30,18,4,0.95)",
    shadowColor: "#c9922a",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  targeted: {
    borderColor: "rgba(200,40,40,0.7)",
    shadowColor: "#cc2020",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  choosable: {
    borderColor: "rgba(80,180,80,0.8)",
    shadowColor: "#44cc66",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  dead: {
    opacity: 0.55,
    borderColor: "rgba(80,80,80,0.3)",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  activeDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffdd44",
    borderWidth: 1.5,
    borderColor: "#000",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: "#e8d0a0",
    fontWeight: "600",
    fontSize: 13,
  },
  coins: {
    color: "#c9922a",
    fontSize: 12,
    marginTop: 1,
  },
  influences: {
    color: "#888",
    fontSize: 11,
    marginTop: 1,
  },
  deadText: {
    color: "#555",
  },
  cards: {
    flexDirection: "row",
    gap: 4,
  },
  cardSpacing: {
    marginLeft: 2,
  },
  targetBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(180,30,30,0.85)",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  targetBadgeText: {
    color: "#fff",
    fontSize: 12,
  },
});
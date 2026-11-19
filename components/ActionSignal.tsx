import React from 'react';
import { Pressable, View } from 'react-native';
import Text from './Text';
import { C, sansBold } from '../game/theme';
import { GameRoom, TableEvent } from '../game/types';
import { describeEvent, describePending, ACTION_TITLES } from '../game/actionPresentation';
import { Icon } from './Visuals';
export default function ActionSignal({ room, myId, event, onDetails }: { room: GameRoom; myId: string | null; event?: TableEvent; onDetails: () => void }) {
  const pending = describePending(room, myId), a = room.pendingAction;
  const last = room.visualEvents?.filter(e => e.kind !== 'turn').at(-1);
  const lastActionEvent = room.visualEvents?.filter(e => e.actionId === a?.id).at(-1);
  const verdict = a?.stage === 'awaitingReveal' && lastActionEvent && ['verdict', 'cards', 'block'].includes(lastActionEvent.kind) ? room.visualEvents?.filter(e => e.actionId === a.id && e.kind === 'verdict').at(-1) : undefined;
  const result = event || verdict || (!a ? last : undefined);
  const warning = result?.kind === 'challenge' || result?.kind === 'verdict' || a?.stage === 'awaitingReveal';
  const protection = event?.kind === 'block' || a?.stage === 'challengeBlock';
  const color = warning ? '#FF8B8B' : protection ? '#83D7FF' : C.gold;
  const active = room.players[room.currentPlayerIndex];
  const title = result ? describeEvent(result, room) : pending?.title || (active?.id === myId ? 'À vous de jouer' : `Au tour de ${active?.username}`);
  const instruction = pending?.instruction || (active?.id === myId ? 'Choisissez votre action.' : `${active?.username} prépare son action.`);
  const tag = event ? event.kind === 'challenge' ? 'CONTESTATION' : event.kind === 'verdict' ? 'RÉSULTAT DU DÉFI' : event.action ? ACTION_TITLES[event.action] : 'LA TABLE JOUE' : pending?.tag || (last ? 'DERNIÈRE ACTION' : 'DÉBUT DU TOUR');
  return <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${instruction}. Voir les détails de l’action.`} onPress={onDetails} style={{ borderLeftWidth: 3, borderColor: color, backgroundColor: '#172E25', borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8, gap: 4 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon name={warning ? 'alert-triangle' : protection ? 'shield' : 'activity'} color={color} size={14}/><Text style={{ color, fontFamily: sansBold, fontSize: 9, flex: 1 }}>{tag}</Text><Icon name="maximize-2" color={C.muted} size={12}/></View>
    <Text numberOfLines={2} style={{ color: C.text, fontFamily: sansBold, fontSize: 13, lineHeight: 17 }}>{title}</Text>
    <Text numberOfLines={2} style={{ color: instruction.startsWith('À VOUS') ? color : C.muted, fontSize: 11, lineHeight: 14 }}>{instruction}</Text>
  </Pressable>;
}

import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { CardState, GameRoom, RoleName } from '../game/types';
import { C, sansBold } from '../game/theme';
import Card from './Card';
import Text from './Text';
import { Icon } from './Visuals';
export default function GameCompanion({ cards, hidden, onToggle, onRole, room, wide, onHistory }: { cards: CardState[]; hidden: boolean; onToggle: () => void; onRole: (role: RoleName) => void; room: GameRoom; wide: boolean; onHistory: () => void }) {
  const cardWidth = wide ? 96 : 52;
  return <View style={{ width: wide ? 270 : '100%', height: wide ? '100%' : 158, flexDirection: wide ? 'column' : 'row', gap: 10 }}>
    <View style={{ width: wide ? '100%' : 130, backgroundColor: '#152C22', borderWidth: 1, borderColor: '#5E5B3C', borderRadius: 12, padding: wide ? 12 : 7, gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: C.gold, fontSize: wide ? 11 : 9, fontFamily: sansBold }}>MA MAIN</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={hidden ? 'Afficher ma main' : 'Masquer ma main'} onPress={onToggle} style={{ minHeight: 36, paddingHorizontal: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icon name={hidden ? 'eye' : 'eye-off'} size={12}/><Text style={{ color: C.gold, fontSize: 9 }}>{hidden ? 'Afficher' : 'Masquer'}</Text></Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: wide ? 12 : 6, justifyContent: 'center' }}>{cards.map((card, i) => {
        const concealed = hidden && !card.revealed;
        return <Pressable key={i} accessibilityRole="button" accessibilityLabel={concealed ? 'Influence cachée' : 'Rappel du rôle ' + card.role} disabled={concealed} onPress={() => onRole(card.role)} style={({ pressed }) => ({ width: cardWidth, alignItems: 'center', gap: 4, opacity: pressed ? .7 : 1 })}>
          <Card role={concealed ? undefined : card.role} faceDown={concealed} revealed={card.revealed} width={cardWidth} height={wide ? 140 : 74}/>
          <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: card.revealed ? C.muted : C.text, fontSize: wide ? 11 : 9 }}>{concealed ? 'Cachée' : card.role}</Text>
        </Pressable>;
      })}</View>
      {wide && <Text style={{ color: C.muted, fontSize: 10, textAlign: 'center' }}>Touchez une carte pour revoir son rôle.</Text>}
    </View>
    <View style={{ flex: 1, minWidth: 0, minHeight: 0, backgroundColor: '#10251D', borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 10, paddingBottom: 8 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir le journal complet" onPress={onHistory} style={{ minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.mint }}/><Text style={{ color: C.gold, fontSize: 9, fontFamily: sansBold, flex: 1 }}>JOURNAL EN DIRECT</Text><Icon name="maximize-2" size={12}/></Pressable>
      <ScrollView key={`${room.round}:${room.history.at(-1)?.id || 0}`} style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 9 }}>
        {[...room.history].reverse().slice(0, wide ? 20 : 5).map((entry, i) => <View key={entry.id} style={{ gap: 2, borderLeftWidth: i === 0 ? 2 : 0, borderColor: C.gold, paddingLeft: 6 }}><Text style={{ color: C.muted, fontSize: 8 }}>TOUR {entry.turn}</Text><Text style={{ color: i === 0 ? C.text : C.muted, fontSize: wide ? 12 : 10, lineHeight: wide ? 17 : 14 }}>{entry.text}</Text></View>)}
        {!room.history.length && <Text style={{ color: C.muted, fontSize: 11 }}>La partie commence…</Text>}
      </ScrollView>
    </View>
  </View>;
}

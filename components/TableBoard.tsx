import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameRoom } from '../game/types';
import { C, serif, ui } from '../game/theme';
import { Emblem, Ornament } from './Visuals';
import { Entrance } from './Motion';
import PlayerBoard from './PlayerBoard';
import Card from './Card';
import Text from './Text';
export default function TableBoard({ room, myId, onPlayerPress }: { room: GameRoom; myId: string | null; onPlayerPress: (id: string) => void }) {
  const compact = useWindowDimensions().width < 700;
  const active = room.players[room.currentPlayerIndex], n = room.players.length;
  const boards = room.players.map((p, i) => {
    const angle = n === 2 ? i * Math.PI : -Math.PI / 2 + i * 2 * Math.PI / n;
    return <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={'Voir les cartes révélées de ' + p.username} accessibilityHint="Affiche ses pièces et ses influences publiques" onPress={() => onPlayerPress(p.id)} style={compact ? { width: n <= 4 ? '45%' : '30%', minWidth: 92, paddingVertical: 8 } : { position: 'absolute', left: (50 + Math.cos(angle) * 35) + '%' as `${number}%`, top: (50 + Math.sin(angle) * 33) + '%' as `${number}%`, width: 120, transform: [{ translateX: -60 }, { translateY: -83 }] }}>
      <PlayerBoard player={p} isMe={p.id === myId} isActive={p.id === active?.id && p.alive} isTarget={room.pendingAction?.targetId === p.id}/>
    </Pressable>;
  });
  return <Entrance style={{ borderWidth: 1, borderColor: '#4D5941', borderRadius: compact ? 24 : 32, overflow: 'hidden', minHeight: compact ? undefined : n > 4 ? 570 : 440, backgroundColor: '#123527', boxShadow: 'inset 0px 0px 60px rgba(0,0,0,0.4), 0px 12px 36px rgba(0,0,0,0.16)' }}>
    <LinearGradient colors={['#214B36', '#153B2B', '#102A20']} start={{ x: 0.3, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill}/><Ornament opacity={0.065}/>
    <View style={{ pointerEvents: 'none', position: 'absolute', inset: 10, borderWidth: 1, borderColor: '#73815A', opacity: 0.35, borderRadius: compact ? 18 : 27 }}/>
    {compact ? <><View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', padding: 14, gap: 8 }}>{boards}</View><View style={{ borderTopWidth: 1, borderColor: '#405D42', padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 }}><Emblem size={30}/><Text style={[ui.eyebrow, { fontSize: 9 }]}>LA COUR · {room.deckCount} CARTES</Text><Text style={{ fontFamily: serif, color: C.gold, fontSize: 18 }}>Tour {room.turn}</Text></View></> : <>
      <View style={{ pointerEvents: 'none', position: 'absolute', top: '50%', left: '50%', width: 200, height: 180, transform: [{ translateX: -100 }, { translateY: -90 }], alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <View style={{ width: 70, height: 88, alignItems: 'center' }}><Card faceDown width={54} height={80} style={{ position: 'absolute', transform: [{ rotate: '-9deg' }, { translateX: -6 }] }}/><Card faceDown width={54} height={80} style={{ position: 'absolute', transform: [{ rotate: '5deg' }, { translateX: 7 }] }}/></View>
        <Text style={{ fontFamily: serif, color: '#DCC79A', fontSize: 24, letterSpacing: 4 }}>LA COUR</Text><Text style={{ color: '#A4B59D', fontSize: 9, letterSpacing: 1.5 }}>{room.deckCount} CARTES · TOUR {room.turn}</Text>
      </View>{boards}</>}
  </Entrance>;
}

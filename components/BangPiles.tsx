import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Text from './Text';
import { BangCard, SUITS, rank } from '../game/bang';
import { sansBold, serif } from '../game/theme';

export default function BangPiles({ count, top, onDeck, onDiscard }: {
  count: number; top: BangCard | null; onDeck: () => void; onDiscard: () => void;
}) {
  const draw = useRef(new Animated.Value(0)).current;
  const drop = useRef(new Animated.Value(0)).current;
  const previous = useRef({ count, id: top?.id });
  useEffect(() => {
    if (count !== previous.current.count) {
      draw.setValue(1);
      Animated.timing(draw, { toValue: 0, duration: 320, useNativeDriver: true }).start();
    }
    if (top?.id !== previous.current.id) {
      drop.setValue(1);
      Animated.timing(drop, { toValue: 0, duration: 260, useNativeDriver: true }).start();
    }
    previous.current = { count, id: top?.id };
  }, [count, top?.id, draw, drop]);
  const red = top && ['hearts', 'diamonds'].includes(top.suit);
  return <View style={styles.row}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Pioche : ${count} cartes. Informations`} onPress={onDeck} style={({ pressed }) => [styles.pile, { opacity: pressed ? .8 : 1 }]}>
      <View style={styles.cards}>
        {count > 0 && <>
          <View style={[styles.back, styles.layer, { transform: [{ rotate: '-6deg' }], top: 5 }]} />
          <View style={[styles.back, styles.layer, { transform: [{ rotate: '4deg' }], top: 2 }]} />
          <Animated.View style={[styles.back, { transform: [{ translateY: draw.interpolate({ inputRange: [0, 1], outputRange: [0, -9] }) }] }]}>
            <View style={styles.backInner}><Text style={styles.brand}>BANG!</Text><Text style={styles.star}>✦</Text><Text style={styles.ornament}>◆ ─ ◆</Text></View>
          </Animated.View>
        </>}
        {count === 0 && <View style={styles.empty}><Text style={styles.emptyText}>↻</Text></View>}
        <View style={styles.counter}><Text style={styles.counterText}>{count}</Text></View>
      </View>
      <Text style={styles.label}>PIOCHE</Text>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={top ? `Défausse : ${top.name}. Voir la carte` : 'Défausse vide'} onPress={onDiscard} style={({ pressed }) => [styles.pile, { opacity: pressed ? .8 : 1 }]}>
      <View style={styles.cards}>
        {top ? <>
          <View style={[styles.back, styles.layer, { backgroundColor: '#B59C75', top: 4, transform: [{ rotate: '7deg' }] }]} />
          <Animated.View style={[styles.face, { borderColor: ['equipment', 'weapon'].includes(top.category) ? '#54819B' : '#996B40', transform: [{ translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }, { rotate: drop.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '8deg'] }) }], opacity: drop.interpolate({ inputRange: [0, 1], outputRange: [1, .35] }) }]}>
            <Text style={[styles.rank, { color: red ? '#A33327' : '#35291F' }]}>{rank(top.rank)}{SUITS[top.suit]}</Text>
            <Text numberOfLines={3} style={styles.name}>{top.name}</Text>
            <Text style={[styles.suit, { color: red ? '#A33327' : '#35291F' }]}>{SUITS[top.suit]}</Text>
          </Animated.View>
        </> : <View style={styles.empty}><Text style={styles.emptyText}>—</Text><Text style={styles.emptyCaption}>VIDE</Text></View>}
      </View>
      <Text style={styles.label}>DÉFAUSSE</Text>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 18, alignItems: 'center', justifyContent: 'center' },
  pile: { alignItems: 'center', gap: 11, width: 56 },
  cards: { width: 56, height: 80 },
  back: { width: 56, height: 80, borderRadius: 6, borderWidth: 2, borderColor: '#AC8450', backgroundColor: '#347B76', padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: .35, shadowRadius: 3, elevation: 3 },
  layer: { position: 'absolute', left: 0 },
  backInner: { flex: 1, borderWidth: 1, borderColor: '#886442', borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  brand: { color: '#E4BC73', fontFamily: serif, fontSize: 16 },
  star: { color: '#D8AE6C', fontSize: 25 },
  ornament: { color: '#AC8450', fontSize: 8 },
  face: { width: 56, height: 80, borderRadius: 6, borderWidth: 2, backgroundColor: '#FFF5DB', padding: 4, justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: .35, shadowRadius: 3, elevation: 3 },
  rank: { fontFamily: sansBold, fontSize: 10 },
  name: { fontFamily: sansBold, fontSize: 9, textAlign: 'center', color: '#352619' },
  suit: { fontSize: 17, textAlign: 'right' },
  counter: { position: 'absolute', right: -7, top: -7, minWidth: 24, height: 24, paddingHorizontal: 4, borderRadius: 12, backgroundColor: '#E4BC73', borderWidth: 2, borderColor: '#327971', alignItems: 'center', justifyContent: 'center' },
  counterText: { color: '#302417', fontSize: 10, fontFamily: sansBold },
  label: { color: '#FFF2CF', fontSize: 8, letterSpacing: 1, fontFamily: sansBold },
  empty: { width: 56, height: 80, borderRadius: 6, borderWidth: 1, borderStyle: 'dashed', borderColor: '#92744C', backgroundColor: '#28645E', alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#E7D49F', fontSize: 23 },
  emptyCaption: { color: '#E7D49F', fontSize: 8 },
});

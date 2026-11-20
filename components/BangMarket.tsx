import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import BangCard from './BangCard';
import Text from './Text';
import { BangCard as Card } from '../game/bang';
import { sansBold, serif } from '../game/theme';

function MarketSlot({ card, available, chooser, enabled, onChoose }: { card: Card; available: boolean; chooser: string; enabled: boolean; onChoose: () => void }) {
  const opacity = useRef(new Animated.Value(available ? 1 : 0)).current;
  const previousChooser = useRef(chooser);
  const [takenBy, setTakenBy] = useState('');
  useEffect(() => {
    if (!available) {
      setTakenBy(previousChooser.current);
      Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }).start();
    } else previousChooser.current = chooser;
  }, [available, chooser, opacity]);
  return <View style={s.slot}>
    {!available && <View style={s.taken}><Text style={s.tick}>✓</Text><Text numberOfLines={2} style={s.caption}>{takenBy}</Text></View>}
    <Animated.View pointerEvents={available ? 'auto' : 'none'} accessibilityElementsHidden={!available} importantForAccessibility={available ? 'auto' : 'no-hide-descendants'} style={{ opacity, transform: [{ translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }] }}>
      <BangCard card={card} compact onPress={available && enabled ? onChoose : undefined}/>
    </Animated.View>
  </View>;
}

export default function BangMarket({ cards, chooser, mine, disabled, onChoose }: { cards: Card[]; chooser: string; mine: boolean; disabled: boolean; onChoose: (id: string) => void }) {
  const [slots] = useState(cards);
  return <View style={s.market}>
    <Text style={s.title}>LE MAGASIN</Text>
    <Text accessibilityLiveRegion="polite" style={s.status}>{mine ? 'À vous de choisir une carte' : chooser + ' choisit sa carte'} · {cards.length} restante{cards.length > 1 ? 's' : ''}</Text>
    <View style={s.grid}>{slots.map(card => <MarketSlot key={card.id} card={card} available={cards.some(c => c.id === card.id)} chooser={chooser} enabled={mine && !disabled} onChoose={() => onChoose(card.id)}/>)}</View>
    <Text style={s.caption}>Chacun choisit à son tour. Les cartes prises quittent le Magasin.</Text>
  </View>;
}
const s = StyleSheet.create({
  market: { padding: 12, gap: 12, alignItems: 'center', backgroundColor: '#FFF1D1', borderWidth: 3, borderColor: '#493022', borderRadius: 20 },
  title: { fontFamily: serif, color: '#92491F', fontSize: 28 },
  status: { fontFamily: sansBold, color: '#493022', fontSize: 12, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 9 },
  slot: { width: 76, height: 112, borderRadius: 8, backgroundColor: '#E2CC9E' },
  taken: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', padding: 4, gap: 5 },
  tick: { color: '#286F6B', fontSize: 23 },
  caption: { color: '#785B45', fontSize: 10, textAlign: 'center', lineHeight: 15 },
});

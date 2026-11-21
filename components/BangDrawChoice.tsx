import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Text from './Text';
import BangCard from './BangCard';
import { BangCard as Card } from '../game/bang';
import { sansBold } from '../game/theme';

/** No command leaves this component until the explicit confirmation. */
export default function BangDrawChoice({ cards, kit, disabled, onConfirm }: {
  cards: Card[]; kit: boolean; disabled: boolean; onConfirm: (id: string) => void;
}) {
  const [chosen, setChosen] = useState<string[]>([]);
  const required = kit ? Math.max(0, cards.length - 1) : 1;
  const selected = chosen.filter(id => cards.some(c => c.id === id));
  const returned = cards.find(c => !selected.includes(c.id));
  const valid = selected.length === required && (!kit || !!returned);
  return <View style={{ gap: 14 }}>
    <Text style={{ color: '#493022', fontSize: 14, lineHeight: 22 }}>
      {kit ? `Sélectionnez les ${required} cartes à GARDER. La carte restante retournera sur la pioche après confirmation.` : 'Sélectionnez le résultat à conserver, puis confirmez.'}
    </Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, paddingTop: 8 }}>
      {cards.map(c => <View key={c.id} style={{ width: 150, gap: 8 }}>
        <BangCard card={c} selected={selected.includes(c.id)} expanded onPress={disabled ? undefined : () => setChosen(old => old.includes(c.id) ? old.filter(id => id !== c.id) : required === 1 ? [c.id] : old.length < required ? [...old, c.id] : [...old.slice(1), c.id])}/>
        <Text style={{ fontFamily: sansBold, color: selected.includes(c.id) ? '#286F6B' : '#785B45', textAlign: 'center', fontSize: 12 }}>
          {selected.includes(c.id) ? '✓ À GARDER' : kit && valid ? '↥ SUR LA PIOCHE' : 'TOUCHER POUR CHOISIR'}
        </Text>
      </View>)}
    </View>
    <Text accessibilityLiveRegion="polite" style={{ color: '#493022', fontSize: 13, lineHeight: 20 }}>
      {kit ? `${selected.length} / ${required} à garder${valid ? ' · À remettre : ' + returned?.name : ''}` : valid ? 'Résultat : ' + cards.find(c => c.id === selected[0])?.name : 'Aucune carte sélectionnée'}
    </Text>
    <Pressable accessibilityRole="button" accessibilityLabel={kit ? 'Confirmer les cartes à garder' : 'Confirmer le résultat'} disabled={disabled || !valid} onPress={() => valid && onConfirm(kit ? returned!.id : selected[0])} style={({ pressed }) => ({ padding: 15, borderRadius: 14, borderWidth: 2, borderColor: '#493022', backgroundColor: '#F2C358', opacity: disabled || !valid ? .4 : pressed ? .7 : 1 })}>
      <Text style={{ fontFamily: sansBold, color: '#493022', textAlign: 'center' }}>{kit ? 'Confirmer les cartes à garder' : 'Confirmer le résultat'}</Text>
    </Pressable>
  </View>;
}

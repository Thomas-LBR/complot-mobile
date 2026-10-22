import React from 'react';
import { View } from 'react-native';
import { PublicPlayer } from '../game/types';
import { C, ui } from '../game/theme';
import Card from './Card';
import Text from './Text';
import { Coins, Icon } from './Visuals';
import { Sheet } from './GameUI';
export default function PlayerDetails({ player, onClose }: { player?: PublicPlayer; onClose: () => void }) {
  return <Sheet visible={!!player} title={player?.username || ''} subtitle="Informations publiques de ce joueur." onClose={onClose}>
    {player && <>
      <View style={[ui.row, { justifyContent: 'space-between' }]}><Coins amount={player.coins} large/><Text style={ui.badge}>{!player.connected ? 'Hors ligne' : player.alive ? player.influenceCount + ' influence(s) en jeu' : 'Éliminé'}</Text></View>
      <Text style={ui.eyebrow}>SES INFLUENCES</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 18 }}>
        {player.revealedInfluences.map((card, i) => <View key={'revealed-' + i} style={{ alignItems: 'center', gap: 9, width: 120 }}><Card role={card.role} revealed width={120} height={180}/><Text style={[ui.label, { color: C.red }]}>{card.role}</Text><Text style={{ color: C.muted, fontSize: 11 }}>Révélée · perdue</Text></View>)}
        {Array.from({ length: player.influenceCount }, (_, i) => <View key={'hidden-' + i} style={{ alignItems: 'center', gap: 9, width: 120 }}><Card faceDown width={120} height={180}/><Text style={ui.label}>Carte cachée</Text><Text style={{ color: C.muted, fontSize: 11 }}>Toujours en jeu</Text></View>)}
      </View>
      {!player.revealedInfluences.length && <Text style={ui.body}>Ce joueur n’a encore révélé aucune carte.</Text>}
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><Icon name="lock" size={15}/><Text style={[ui.body, { flex: 1 }]}>Seules les cartes révélées sont visibles ici. Les cartes cachées restent secrètes.</Text></View>
    </>}
  </Sheet>;
}


import React from 'react';
import { View } from 'react-native';
import { PublicPlayer } from '../game/types';
import { C, sansBold } from '../game/theme';
import { colorFromUsername, initials } from '../game/utils';
import Card from './Card';
import { Coins } from './Visuals';
import Text from './Text';
export default function PlayerBoard({ player, isActive, isTarget, isMe }: { player: PublicPlayer; isActive?: boolean; isTarget?: boolean; isMe?: boolean }) {
  return <View style={{ alignItems: 'center', gap: 6, opacity: player.alive ? 1 : 0.5, width: '100%' }}>
    <View style={{ borderWidth: isActive || isTarget ? 2 : 1, borderColor: isTarget ? C.red : isActive ? C.gold : '#53634F', borderRadius: 30, padding: 3, backgroundColor: '#0B1A14', boxShadow: isActive ? '0px 0px 20px rgba(220,188,116,0.25)' : undefined }}>
      <View style={{ width: 36, height: 36, borderRadius: 24, backgroundColor: colorFromUsername(player.username), alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.text, fontSize: 12, fontFamily: sansBold }}>{initials(player.username)}</Text></View>
      {isMe && <View style={{ position: 'absolute', right: -3, bottom: -2, borderRadius: 8, width: 15, height: 15, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.bg, fontSize: 9 }}>★</Text></View>}
    </View>
    <Text numberOfLines={2} style={{ color: isActive ? '#F4D696' : C.text, fontFamily: sansBold, fontSize: 11, textAlign: 'center', maxWidth: 125 }}>{player.username}{isMe ? ' · vous' : ''}</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
      {Array.from({ length: 2 }, (_, i) => { const c = player.revealedInfluences[i]; return <Card key={i} role={c?.role} revealed={!!c} faceDown={!c} width={32} height={47} style={{ transform: [{ rotate: i === 0 ? '-7deg' : '7deg' }] }} />; })}
    </View>
    <Coins amount={player.coins}/>
    <Text style={{ color: !player.connected ? C.red : isActive ? C.gold : C.muted, fontSize: 8, textAlign: 'center' }}>{!player.connected ? 'DÉCONNECTÉ' : !player.alive ? 'ÉLIMINÉ' : isTarget ? 'CIBLE DE L’ACTION' : isActive ? 'À SON TOUR' : player.influenceCount + ' INFLUENCES'}</Text>
  </View>;
}


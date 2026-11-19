import React, { useEffect, useRef } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withDelay, withSequence, withTiming, useReducedMotion } from 'react-native-reanimated';
import { PublicPlayer, RoleName, TableEvent } from '../game/types';
import { C, sansBold } from '../game/theme';
import { colorFromUsername, initials } from '../game/utils';
import Card from './Card';
import { Coins } from './Visuals';
import Text from './Text';
import { SeatAnchors } from './TableEffects';
function Influence({ role, index }: { role?: RoleName; index: number }) {
  const previous = useRef(role), flip = useSharedValue(role ? 1 : 0);
  const reduced = useReducedMotion();
  useEffect(() => { if (!previous.current && role) { flip.value = 0; flip.value = withTiming(1, { duration: reduced ? 0 : 600 }); } else flip.value = role ? 1 : 0; previous.current = role; }, [role, flip, reduced]);
  const front = useAnimatedStyle(() => ({ transform: [{ perspective: 500 }, { translateY: -Math.sin(flip.value * Math.PI) * 10 }, { rotateY: `${180 - flip.value * 180}deg` }], opacity: flip.value < .5 ? 0 : 1 }));
  const back = useAnimatedStyle(() => ({ transform: [{ perspective: 500 }, { translateY: -Math.sin(flip.value * Math.PI) * 10 }, { rotateY: `${-flip.value * 180}deg` }], opacity: flip.value >= .5 ? 0 : 1 }));
  return <View style={{ width: 32, height: 47, transform: [{ rotate: index ? '7deg' : '-7deg' }] }}><Animated.View style={[{ position: 'absolute', backfaceVisibility: 'hidden' }, back]}><Card faceDown width={32} height={47}/></Animated.View>{role && <Animated.View style={[{ position: 'absolute', backfaceVisibility: 'hidden' }, front]}><Card role={role} revealed width={32} height={47}/></Animated.View>}</View>;
}
export default function PlayerBoard({ player, isActive, isTarget, isMe, event, onAnchor }: { player: PublicPlayer; isActive?: boolean; isTarget?: boolean; isMe?: boolean; event?: TableEvent; onAnchor?: (kind: keyof SeatAnchors, e: LayoutChangeEvent) => void }) {
  const pulse = useSharedValue(0), shake = useSharedValue(0), life = useSharedValue(player.alive ? 1 : .45);
  const reduced = useReducedMotion();
  useEffect(() => { cancelAnimation(pulse); pulse.value = isActive && !reduced ? withRepeat(withSequence(withTiming(1, { duration: 1000 }), withTiming(0, { duration: 1000 })), -1) : 0; return () => cancelAnimation(pulse); }, [isActive, reduced, pulse]);
  useEffect(() => { life.value = withTiming(player.alive ? 1 : .45, { duration: 500 }); }, [player.alive, life]);
  useEffect(() => { if (event?.targetId === player.id && event.kind === 'attack' && !reduced) shake.value = withDelay(520, withSequence(withTiming(-4, { duration: 60 }), withRepeat(withTiming(4, { duration: 65 }), 4, true), withTiming(0, { duration: 60 }))); }, [event, player.id, reduced, shake]);
  const area = useAnimatedStyle(() => ({ opacity: life.value, transform: [{ translateX: shake.value }] }));
  const halo = useAnimatedStyle(() => ({ opacity: .3 + pulse.value * .5, transform: [{ scale: 1 + pulse.value * .13 }] }));
  const involved = event && (event.actorId === player.id || event.targetId === player.id);
  return <Animated.View style={[{ alignItems: 'center', gap: 6, width: '100%' }, area]}>
    <View onLayout={e => onAnchor?.('avatar', e)} style={{ borderWidth: isActive || isTarget ? 2 : 1, borderColor: involved ? (event.kind === 'block' ? '#79D7FF' : C.gold) : isTarget ? C.red : isActive ? C.gold : '#53634F', borderRadius: 30, padding: 3, backgroundColor: '#0B1A14' }}>
      {isActive && <Animated.View style={[{ position: 'absolute', inset: -5, borderRadius: 35, borderColor: C.gold, borderWidth: 2 }, halo]}/>}
      <View style={{ width: 36, height: 36, borderRadius: 24, backgroundColor: player.alive ? colorFromUsername(player.username) : '#626962', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.text, fontSize: 12, fontFamily: sansBold }}>{initials(player.username)}</Text></View>
      {isMe && <View style={{ position: 'absolute', right: -3, bottom: -2, borderRadius: 8, width: 15, height: 15, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.bg, fontSize: 9 }}>★</Text></View>}
    </View>
    <Text numberOfLines={2} style={{ color: isActive ? '#F4D696' : C.text, fontFamily: sansBold, fontSize: 11, textAlign: 'center', maxWidth: 125 }}>{player.username}{isMe ? ' · vous' : ''}</Text>
    <View onLayout={e => onAnchor?.('cards', e)} style={{ flexDirection: 'row', justifyContent: 'center', gap: 5 }}>{Array.from({ length: 2 }, (_, i) => <Influence key={i} role={player.revealedInfluences[i]?.role} index={i}/>)}</View>
    <View onLayout={e => onAnchor?.('coins', e)}><Coins amount={player.coins}/></View>
    <Text style={{ color: !player.connected ? C.red : isActive ? C.gold : C.muted, fontSize: 8, textAlign: 'center' }}>{!player.connected ? 'DÉCONNECTÉ' : !player.alive ? 'ÉLIMINÉ' : isTarget ? 'CIBLE DE L’ACTION' : isActive ? isMe ? 'À TON TOUR' : 'À SON TOUR' : player.influenceCount + ' INFLUENCES'}</Text>
  </Animated.View>;
}

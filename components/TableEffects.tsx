import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming, useReducedMotion, SharedValue } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Line } from 'react-native-svg';
import { TableEvent } from '../game/types';
import { eventDuration } from '../game/useTableTimeline';
import { sansBold } from '../game/theme';
import Text from './Text';
import Card from './Card';
export type Point = { x: number; y: number };
export type SeatAnchors = { avatar: Point; coins: Point; cards: Point };
const gold = '#F5D284', red = '#FF6472', blue = '#79D7FF';
type SymbolName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
function Flight({ from, to, symbol, color, index = 0, count = 1, duration, reduced, returnTrip = false }: { from: Point; to: Point; symbol: SymbolName; color: string; index?: number; count?: number; duration: number; reduced: boolean; returnTrip?: boolean }) {
  const progress = useSharedValue(0);
  useEffect(() => { progress.value = withTiming(1, { duration, easing: Easing.inOut(Easing.cubic) }); }, [duration, progress]);
  const style = useAnimatedStyle(() => {
    const t = Math.max(0, Math.min(1, (progress.value - index * .035) / (1 - count * .035)));
    const travel = returnTrip ? Math.sin(t * Math.PI) : t;
    return { opacity: reduced ? 0 : interpolate(t, [0, .08, .86, 1], [0, 1, 1, 0]), transform: [
      { translateX: from.x + (to.x - from.x) * travel - 15 },
      { translateY: from.y + (to.y - from.y) * travel - Math.sin(t * Math.PI) * (28 + index * 5) - 15 },
      { rotate: symbol === 'cards-playing-outline' ? `${Math.sin(t * Math.PI * 4) * 15}deg` : symbol === 'circle-multiple' ? `${t * 360}deg` : `${Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI + 45}deg` },
      { scale: symbol === 'circle-multiple' ? 1 : 1.2 },
    ] };
  });
  return <Animated.View style={[styles.token, style]}><View style={{ alignItems: 'center' }}>{symbol === 'cards-playing-outline' ? <Card faceDown width={26} height={38}/> : symbol === 'circle-multiple' ? <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#FFF1BC', backgroundColor: gold, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#705019', fontFamily: sansBold, fontSize: 14 }}>C</Text></View> : <MaterialCommunityIcons name={symbol} size={30} color={color}/>}</View></Animated.View>;
}
function Burst({ point, color, symbol, label, duration, reduced, strong = false, broken = false, particles = false, delay = 0 }: { point: Point; color: string; symbol?: SymbolName; label?: string; duration: number; reduced: boolean; strong?: boolean; broken?: boolean; particles?: boolean; delay?: number }) {
  const p = useSharedValue(0);
  useEffect(() => { p.value = withTiming(1, { duration }); }, [duration, p]);
  const ring = useAnimatedStyle(() => ({ opacity: reduced || p.value < delay ? 0 : (1 - (p.value - delay) / (1 - delay)) * .9, transform: [{ scale: .5 + p.value * (strong ? 3 : 1.8) }, { rotate: broken ? `${p.value * 90}deg` : '0deg' }] }));
  const badge = useAnimatedStyle(() => ({ opacity: interpolate(p.value, [0, Math.max(.01, delay), Math.min(.85, delay + .12), .9, 1], [0, 0, 1, 1, 0]), transform: [{ translateY: reduced ? 0 : -12 * p.value }, { scale: reduced ? 1 : interpolate(p.value, [0, .2, 1], [.85, 1.08, 1]) }] }));
  return <View style={{ position: 'absolute', left: point.x, top: point.y }}>
    <Animated.View style={[{ position: 'absolute', width: 62, height: 62, left: -31, top: -31, borderRadius: 40, borderWidth: broken ? 3 : 2, borderStyle: broken ? 'dashed' : 'solid', borderColor: color }, ring]}/>
    {particles && !reduced && Array.from({ length: 6 }, (_, i) => <Spark key={i} index={i} progress={p}/>)}
    <Animated.View style={[{ position: 'absolute', width: 170, left: -85, top: -24, alignItems: 'center', gap: 5 }, badge]}>
      {symbol && <MaterialCommunityIcons name={symbol} size={strong ? 48 : 34} color={color}/>}
      {label && <Text style={{ color, fontFamily: sansBold, fontSize: 11, textAlign: 'center', backgroundColor: '#081C17EB', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 }}>{label}</Text>}
    </Animated.View>
  </View>;
}
function Spark({ index, progress }: { index: number; progress: SharedValue<number> }) {
  const s = useAnimatedStyle(() => ({ opacity: 1 - progress.value, transform: [{ translateX: Math.cos(index * Math.PI / 3) * progress.value * 65 }, { translateY: Math.sin(index * Math.PI / 3) * progress.value * 65 }, { scale: 1 - progress.value * .6 }] }));
  return <Animated.View style={[{ position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: gold }, s]}/>;
}
const actionNames: Record<string, string> = { duchess: 'TAXE ANNONCÉE', foreign_aid: 'AIDE ÉTRANGÈRE', steal: 'VOL ANNONCÉ', assassinate: 'ASSASSIN ANNONCÉ', coup: 'ATTAQUE À 7 PIÈCES', exchange: 'ÉCHANGE ANNONCÉ', inspect: 'INSPECTION' };
export default function TableEffects({ event: e, anchors, deck, myId }: { event?: TableEvent; anchors: Record<string, SeatAnchors>; deck: Point; myId: string | null }) {
  const reduced = useReducedMotion();
  if (!e) return null;
  const actor = e.actorId ? anchors[e.actorId] : undefined, target = e.targetId ? anchors[e.targetId] : undefined;
  if (!actor && !target) return null;
  const duration = eventDuration(e), ap = actor?.avatar || deck, tp = target?.avatar || ap;
  const common = { duration, reduced };
  const block = e.kind === 'block', attack = e.kind === 'attack', coins = e.kind === 'coins', cards = e.kind === 'cards';
  const shieldPoint = e.action === 'foreign_aid' ? ap : tp;
  const from = coins ? ((e.amount || 0) < 0 ? actor?.coins : e.fromId ? anchors[e.fromId]?.coins : deck) : cards ? (e.outcome === 'return' || e.outcome === 'replace' ? actor?.cards : e.fromId ? anchors[e.fromId]?.cards : deck) : block && e.action === 'foreign_aid' ? deck : block && e.action === 'steal' ? target?.coins : ap;
  const to = coins ? ((e.amount || 0) < 0 ? deck : actor?.coins) : cards ? (e.outcome === 'return' || e.outcome === 'replace' ? deck : actor?.cards) : tp;
  return <View accessibilityLiveRegion="polite" style={[StyleSheet.absoluteFill, { pointerEvents: 'none', zIndex: 20 }]}>
    {attack && !reduced && <View style={[StyleSheet.absoluteFill, { backgroundColor: '#10091045' }]}/>}
    {!reduced && (e.kind === 'challenge' || (coins && e.action === 'steal')) && <Svg style={StyleSheet.absoluteFill} width="100%" height="100%"><Line x1={from?.x || ap.x} y1={from?.y || ap.y} x2={to?.x || tp.x} y2={to?.y || tp.y} stroke={coins ? gold : red} strokeWidth={2} opacity={.6}/></Svg>}
    {((coins && !!e.amount) || cards || attack || (block && e.outcome === 'confirmed')) && Array.from({ length: coins ? Math.max(1, Math.min(7, Math.abs(e.amount || 0))) : cards ? e.amount || 1 : block && ['foreign_aid', 'steal'].includes(e.action || '') ? 2 : 1 }, (_, i) => <Flight key={i} {...common} from={from || deck} to={block ? shieldPoint : to || deck} index={i} count={coins ? Math.min(7, Math.abs(e.amount || 1)) : 2} symbol={cards ? 'cards-playing-outline' : coins || e.action === 'steal' || e.action === 'foreign_aid' ? 'circle-multiple' : 'sword'} color={cards ? '#DDCBA1' : coins ? gold : block ? blue : red} returnTrip={block || (cards && e.outcome === 'replace')}/>)}
    {coins && <Burst {...common} point={actor?.coins || ap} color={gold} label={`${(e.amount || 0) >= 0 ? '+' : ''}${e.amount || 0}`} particles={(e.amount || 0) >= 3}/>}
    {coins && e.action === 'duchess' && <Burst {...common} point={{ x: ap.x, y: ap.y - 25 }} color={gold} symbol="crown" particles/>}
    {coins && e.fromId && anchors[e.fromId] && <Burst {...common} point={anchors[e.fromId].coins} color={red} label={`−${e.amount}`}/>}
    {attack && <Burst {...common} delay={.62} point={tp} color={red} symbol={e.action === 'coup' ? 'target' : 'sword-cross'} strong={e.action === 'coup'} label={e.outcome === 'hit' ? 'TOUCHÉ' : 'RÔLE ABSENT · RATÉ'}/>}
    {block && <Burst {...common} point={shieldPoint} color={e.outcome === 'broken' ? red : blue} symbol={e.outcome === 'broken' ? 'shield-off-outline' : 'shield-check-outline'} broken={e.outcome === 'broken'} label={e.outcome === 'confirmed' ? 'ACTION BLOQUÉE' : e.outcome === 'broken' ? 'BOUCLIER BRISÉ' : 'BLOCAGE ANNONCÉ'}/>}
    {e.kind === 'challenge' && <Burst {...common} point={{ x: (ap.x + tp.x) / 2, y: (ap.y + tp.y) / 2 }} color={red} symbol="alert-circle-outline" label="CONTESTATION"/>}
    {e.kind === 'verdict' && <Burst {...common} point={e.outcome === 'success' ? tp : ap} color={e.outcome === 'success' ? gold : red} symbol={e.outcome === 'success' ? 'check-decagram-outline' : 'close-circle-outline'} label={e.outcome === 'success' ? 'BLUFF DÉMASQUÉ' : 'CONTESTATION PERDUE'}/>}
    {e.kind === 'announce' && <Burst {...common} point={ap} color={e.action === 'assassinate' || e.action === 'coup' ? red : gold} symbol={e.action === 'assassinate' ? 'sword' : e.action === 'duchess' ? 'crown' : undefined} label={actionNames[e.action || '']}/>}
    {e.kind === 'eliminate' && <Burst {...common} point={tp} color="#BCC1BC" symbol="account-off-outline" label="ÉLIMINÉ"/>}
    {e.kind === 'turn' && e.fromId && anchors[e.fromId] && <Flight {...common} from={anchors[e.fromId].avatar} to={ap} symbol="circle-outline" color={gold}/>}
    {e.kind === 'turn' && <Burst {...common} point={ap} color={gold} label={e.actorId === myId ? 'À TON TOUR' : 'NOUVEAU TOUR'}/>}
    {e.kind === 'inspect' && <Burst {...common} point={tp} color={blue} symbol="eye-outline" label="INSPECTION PRIVÉE"/>}
  </View>;
}
const styles = StyleSheet.create({ token: { position: 'absolute', top: 0, left: 0, width: 30, height: 30 } });

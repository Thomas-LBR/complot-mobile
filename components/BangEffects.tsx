import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import Text from './Text';
import BangArt from './BangArt';
import { BangState } from '../game/bang';
import { BangVisual, BangVisualQueue, visualPresentation } from '../game/bang-visuals';
import { sansBold } from '../game/theme';

export type Point = { x: number; y: number };
export function useBangEffects(room: BangState['room'] | undefined, connected: boolean) {
  const queue = useRef(new BangVisualQueue()).current;
  const progress = useRef(new Animated.Value(0)).current;
  const [event, setEvent] = useState<BangVisual | null>(null);
  const running = useRef(false), fresh = useRef(true), mounted = useRef(true), reduced = useRef(false);
  const pump = useCallback(function playNext() {
    if (!mounted.current || running.current) return;
    const next = queue.next();
    if (!next) { setEvent(null); return; }
    running.current = true; setEvent(next); progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: reduced.current ? 350 : next.kind === 'attack' ? 950 : 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
      running.current = false;
      if (finished && mounted.current) playNext();
    });
  }, [queue, progress]);
  useEffect(() => {
    mounted.current = true;
    AccessibilityInfo.isReduceMotionEnabled().then(v => { reduced.current = v; });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', v => { reduced.current = v; });
    return () => { mounted.current = false; progress.stopAnimation(); subscription.remove(); };
  }, [progress]);
  useEffect(() => {
    if (!connected || !room) { fresh.current = true; queue.pending = []; progress.stopAnimation(); running.current = false; setEvent(null); return; }
    const game = room.phase === 'waiting' ? 'lobby' : room.gameId || room.code;
    if (queue.game !== game) { progress.stopAnimation(); running.current = false; setEvent(null); }
    queue.ingest(game, room.visuals || [], fresh.current);
    fresh.current = false; pump();
  }, [room, connected, queue, progress, pump]);
  return { event, progress, reduced: reduced.current };
}

export function BangActionToast({ event, players }: { event: BangVisual | null; players: BangState['room']['players'] }) {
  if (!event) return null;
  const { label, color } = visualPresentation(event);
  const actor = players.find(p => p.id === event.actorId)?.name;
  const target = players.find(p => p.id === event.targetId)?.name;
  return <View pointerEvents="none" style={styles.toast}>
    <View style={[styles.message, { borderColor: color }]} accessibilityLiveRegion="polite">
      <Text style={{ color, fontFamily: sansBold, fontSize: 18 }}>{label}</Text>
      <Text style={{ color: '#FFF2CF', fontSize: 13 }}>{actor && target && actor !== target ? `${actor} → ${target}` : target || actor || 'La table'}</Text>
    </View>
  </View>;
}

export default function BangEffects({ event, progress, anchors, size, reduced }: {
  event: BangVisual | null; progress: Animated.Value; anchors: Record<string, Point>; size: { width: number; height: number }; reduced: boolean;
}) {
  if (!event || !size.width) return null;
  const center = { x: size.width / 2, y: size.height / 2 };
  const deck = { x: center.x - 35, y: center.y };
  const actor = anchors[event.actorId || ''] || center;
  const target = anchors[event.targetId || ''] || center;
  const from = event.kind === 'draw' ? deck : actor;
  const to = ['return', 'discard'].includes(event.kind) ? deck : target;
  const transfer = ['attack', 'draw', 'return', 'discard', 'steal', 'transfer'].includes(event.kind);
  const cards = ['draw', 'return', 'discard', 'steal'].includes(event.kind);
  const { color, label } = visualPresentation(event);
  const opacity = progress.interpolate({ inputRange: [0, .12, .78, 1], outputRange: [0, 1, 1, 0] });
  const destination = event.kind === 'play' || event.kind === 'equip' ? actor : to;
  const x = Math.max(55, Math.min(size.width - 55, destination.x));
  const y = Math.max(45, Math.min(size.height - 45, destination.y));
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 30, overflow: 'hidden', borderRadius: 70 }]}>
    {event.kind === 'attack' && <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}><Svg width={size.width} height={size.height}><Line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={3} strokeDasharray="7 7"/></Svg></Animated.View>}
    {transfer && <Animated.View style={{ position: 'absolute', left: 0, top: 0, opacity, transform: [{ translateX: reduced ? to.x - 20 : progress.interpolate({ inputRange: [0, .8, 1], outputRange: [from.x - 20, to.x - 20, to.x - 20] }) }, { translateY: reduced ? to.y - 25 : progress.interpolate({ inputRange: [0, .8, 1], outputRange: [from.y - 25, to.y - 25, to.y - 25] }) }, { scale: reduced ? 1 : progress.interpolate({ inputRange: [0, .4, 1], outputRange: [.6, 1.2, .8] }) }] }}>
      {cards ? <View style={styles.card}><Text style={{ color: '#FFF2CF', fontFamily: sansBold, fontSize: 9 }}>BANG!</Text><Text style={{ color: '#F2C358', fontSize: 20 }}>✦</Text><Text style={{ color: '#FFF2CF', fontSize: 10 }}>×{event.count}</Text></View> : <View style={[styles.projectile, { backgroundColor: color }]}><BangArt kind={event.cardType || 'bang'} size={44}/></View>}
    </Animated.View>}
    <Animated.View style={{ position: 'absolute', left: x - 44, top: y - 44, width: 88, height: 88, borderRadius: 44, borderWidth: event.kind === 'damage' ? 6 : 3, borderColor: color, opacity, transform: [{ scale: reduced ? 1 : progress.interpolate({ inputRange: [0, .45, 1], outputRange: [.7, 1.35, 1.7] }) }] }}/>
    {!transfer && <Animated.View style={{ position: 'absolute', left: x - 32, top: y - 44, opacity, transform: [{ translateY: reduced ? 0 : progress.interpolate({ inputRange: [0, 1], outputRange: [12, -22] }) }] }}>
      {event.kind === 'prison' ? <Text style={{ color: '#D8F0F2', fontFamily: sansBold, fontSize: 62 }}>▥</Text> : event.kind === 'damage' ? <Text style={{ color: '#FFE6C4', fontFamily: sansBold, fontSize: 38 }}>−{event.count}♥</Text> : event.kind === 'defense' ? <Text style={{ color: '#C9FAF0', fontSize: 50 }}>↗</Text> : <BangArt kind={event.cardType || (event.kind === 'heal' ? 'beer' : 'hat')} size={64}/>}
    </Animated.View>}
    <Animated.View style={{ position: 'absolute', left: Math.max(0, Math.min(size.width - 130, x - 65)), top: Math.min(size.height - 40, y + 40), width: 130, alignItems: 'center', opacity }}><Text style={{ color: '#FFF8E8', backgroundColor: '#493022', borderRadius: 7, padding: 6, fontFamily: sansBold, fontSize: 11 }}>{label}</Text></Animated.View>
  </View>;
}
const styles = StyleSheet.create({ toast: { position: 'absolute', left: 12, right: 12, bottom: 16, alignItems: 'center', zIndex: 100 }, message: { backgroundColor: '#30251EF2', borderWidth: 2, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 22, gap: 3, maxWidth: 440, alignItems: 'center' }, card: { width: 40, height: 58, backgroundColor: '#347B76', borderWidth: 2, borderColor: '#F2C358', borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, projectile: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#FFF2CF', alignItems: 'center', justifyContent: 'center' } });

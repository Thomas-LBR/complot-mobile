import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';
import Text from './Text';
import { GameRoom, TableEvent } from '../game/types';
import { SeatAnchors } from './TableEffects';
import { sansBold } from '../game/theme';
export default function ActionTargets({ room, event, anchors }: { room: GameRoom; event?: TableEvent; anchors: Record<string, SeatAnchors> }) {
  const a = room.pendingAction;
  const lastActionEvent = room.visualEvents?.filter(e => e.actionId === a?.id).at(-1);
  const challenge = event?.kind === 'challenge' || event?.kind === 'verdict' ? event : a?.stage === 'awaitingReveal' && lastActionEvent && ['verdict', 'cards', 'block'].includes(lastActionEvent.kind) ? room.visualEvents?.filter(e => e.actionId === a.id && e.kind === 'challenge').at(-1) : undefined;
  const badges = new Map<string, { label: string; color: string }>();
  const links: { from: string; to: string; color: string }[] = [];
  if (a) {
    badges.set(a.actorId, { label: 'JOUE L’ACTION', color: '#F5D284' });
    if (a.targetId) { badges.set(a.targetId, { label: 'CIBLE', color: '#FF8791' }); links.push({ from: a.actorId, to: a.targetId, color: '#FF8791' }); }
    if (a.blockedBy) { badges.set(a.blockedBy, { label: 'BLOQUE', color: '#83D7FF' }); links.push({ from: a.blockedBy, to: a.actorId, color: '#83D7FF' }); }
  } else if (event) {
    if (event.actorId) badges.set(event.actorId, { label: event.kind === 'turn' ? 'À SON TOUR' : 'AGIT', color: '#F5D284' });
    if (event.targetId) { badges.set(event.targetId, { label: event.kind === 'reveal' ? 'RÉVÈLE' : 'CIBLE', color: '#FF8791' }); if (event.actorId && event.actorId !== event.targetId) links.push({ from: event.actorId, to: event.targetId, color: '#FF8791' }); }
  }
  if (challenge?.actorId && challenge.targetId) {
    badges.set(challenge.actorId, { label: 'CONTESTE', color: '#FF8791' });
    badges.set(challenge.targetId, { label: 'EST CONTESTÉ', color: '#FF8791' });
    links.push({ from: challenge.actorId, to: challenge.targetId, color: '#FF8791' });
  }
  if (!badges.size) return null;
  return <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none', zIndex: 10 }]}>
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>{links.map((link, i) => {
      const from = anchors[link.from]?.avatar, to = anchors[link.to]?.avatar;
      if (!from || !to) return null;
      const dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy) || 1, ux = dx / length, uy = dy / length;
      const tip = { x: to.x - ux * 34, y: to.y - uy * 34 };
      return <React.Fragment key={i}><Line x1={from.x + ux * 30} y1={from.y + uy * 30} x2={tip.x} y2={tip.y} stroke={link.color} strokeWidth={2} strokeDasharray="7 6" opacity={.65}/><Polygon points={`${tip.x},${tip.y} ${tip.x - ux * 12 - uy * 6},${tip.y - uy * 12 + ux * 6} ${tip.x - ux * 12 + uy * 6},${tip.y - uy * 12 - ux * 6}`} fill={link.color}/></React.Fragment>;
    })}</Svg>
    {[...badges].map(([id, badge]) => { const point = anchors[id]?.avatar; return point && <React.Fragment key={id}>
      <View style={{ position: 'absolute', left: point.x - 27, top: point.y - 27, width: 54, height: 54, borderRadius: 30, borderWidth: 3, borderColor: badge.color }}/>
      <View style={{ position: 'absolute', left: point.x - 48, top: Math.max(3, point.y - 43), width: 96, alignItems: 'center' }}><Text style={{ color: '#092018', fontFamily: sansBold, fontSize: 8, paddingHorizontal: 5, paddingVertical: 3, backgroundColor: badge.color, borderRadius: 4 }}>{badge.label}</Text></View>
    </React.Fragment>; })}
  </View>;
}

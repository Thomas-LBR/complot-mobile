import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Path, Rect, Text as T } from "react-native-svg";
import { ROLES } from "../game/cards";
import { RoleName } from "../game/types";

interface CardProps {
  role?: RoleName | null;
  revealed?: boolean;
  faceDown?: boolean;
  width?: number;
  height?: number;
  glowing?: boolean;
  dimmed?: boolean;
}

// ── Face d'une carte ──────────────────────────────────────────────────────────
function CardFace({ role, w, h, dead }: { role: RoleName; w: number; h: number; dead?: boolean }) {
  const r = ROLES[role];
  const op = dead ? 0.5 : 1;
  const fs = Math.max(8, w * 0.13);
  const sym = Math.max(10, w * 0.55);

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* fond */}
      <Rect width={w} height={h} fill={r.bg} />
      {/* cadres gravure */}
      <Rect x={2} y={2} width={w-4} height={h-4} rx={3} fill="none" stroke={r.border} strokeWidth={1} opacity={0.6 * op} />
      <Rect x={4.5} y={4.5} width={w-9} height={h-9} rx={2} fill="none" stroke={r.border} strokeWidth={0.4} opacity={0.3 * op} />
      {/* coin haut gauche */}
      <T x={6} y={14} fontSize={fs*0.9} fill={r.color} opacity={0.9 * op} fontFamily="serif">{r.symbol}</T>
      {/* symbole central */}
      <T x={w/2} y={h*0.58} textAnchor="middle" fontSize={sym} fill={r.color} opacity={0.85 * op} fontFamily="serif">{r.symbol}</T>
      {/* nom */}
      <T x={w/2} y={h-7} textAnchor="middle" fontSize={fs} fill={r.color} opacity={0.8 * op} fontFamily="serif" letterSpacing={0.8}>
        {role.toUpperCase()}
      </T>
      {/* coin bas droit retourné */}
      <T x={w-6} y={h-5} textAnchor="end" fontSize={fs*0.9} fill={r.color} opacity={0.9 * op}
        fontFamily="serif" rotation={180} origin={`${w-6},${h-5}`}>{r.symbol}</T>
      {/* hachures d'élimination */}
      {dead && <>
        <Line x1={w*0.1} y1={h*0.1} x2={w*0.9} y2={h*0.9} stroke="#cc2222" strokeWidth={2.5} strokeLinecap="round" opacity={0.9}/>
        <Line x1={w*0.9} y1={h*0.1} x2={w*0.1} y2={h*0.9} stroke="#cc2222" strokeWidth={2.5} strokeLinecap="round" opacity={0.9}/>
      </>}
    </Svg>
  );
}

// ── Dos de carte ─────────────────────────────────────────────────────────────
function CardBack({ w, h }: { w: number; h: number }) {
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect width={w} height={h} fill="#1a0e06" />
      <Rect x={2} y={2} width={w-4} height={h-4} rx={3} fill="none" stroke="#a06820" strokeWidth={1} opacity={0.5}/>
      <Rect x={5} y={5} width={w-10} height={h-10} rx={2} fill="none" stroke="#a06820" strokeWidth={0.5} opacity={0.25}/>
      {/* motif losanges */}
      {[h*0.25, h*0.5, h*0.75].map((cy, i) => (
        <Path key={i}
          d={`M${w/2} ${cy-8} L${w/2+8} ${cy} L${w/2} ${cy+8} L${w/2-8} ${cy} Z`}
          fill="none" stroke="#a06820" strokeWidth={0.7} opacity={0.25}/>
      ))}
      <T x={w/2} y={h/2+7} textAnchor="middle" fontSize={w*0.4} fill="#a06820" fontFamily="serif" opacity={0.2}>⚓</T>
    </Svg>
  );
}

// ── Export principal ──────────────────────────────────────────────────────────
export default function Card({ role, revealed = false, faceDown = false, width = 54, height = 76, glowing = false, dimmed = false }: CardProps) {
  const w = width, h = height;
  const r = role ? ROLES[role] : null;

  const shadow = glowing && r
    ? { shadowColor: r.glow, shadowOpacity: 0.9, shadowRadius: 14, elevation: 10 }
    : { shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 4, elevation: 3 };

  const borderColor = glowing && r ? r.border : (r ? r.border + "99" : "#333");

  return (
    <View style={[
      styles.base,
      { width: w, height: h, borderRadius: Math.max(4, w*0.08), borderColor, ...shadow, opacity: dimmed ? 0.35 : 1 },
    ]}>
      {faceDown || !role
        ? <CardBack w={w} h={h} />
        : <CardFace role={role} w={w} h={h} dead={revealed} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
  },
});
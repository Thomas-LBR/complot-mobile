import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ROLES } from '../game/cards';
import { RoleName } from '../game/types';
import { C, sansBold, serif } from '../game/theme';
import { Emblem, Ornament, RoleIcon } from './Visuals';
import Text from './Text';
export const portraits: Record<RoleName, number> = {
  Duchesse: require('../assets/art/duchesse.png'), Assassin: require('../assets/art/assassin.png'),
  Capitaine: require('../assets/art/capitaine.png'), Comtesse: require('../assets/art/comtesse.png'),
  Ambassadeur: require('../assets/art/ambassadeur.png'), Inquisiteur: require('../assets/art/inquisiteur.png'),
};
export default function Card({ role, revealed = false, faceDown = false, width = 100, height = 148, glowing = false, dimmed = false, style }: { role?: RoleName | null; revealed?: boolean; faceDown?: boolean; width?: number; height?: number; glowing?: boolean; dimmed?: boolean; style?: StyleProp<ViewStyle> }) {
  const hidden = faceDown || !role, compact = width < 80;
  const accent = hidden ? C.gold : ROLES[role!].color;
  return <View accessibilityLabel={hidden ? 'Influence cachée' : role + (revealed ? ', révélée' : '')} style={[{
    width, height, borderRadius: width * 0.055, borderWidth: glowing ? 2 : 1, borderColor: glowing ? '#F6D99E' : hidden ? '#7F704C' : '#887750',
    backgroundColor: '#0C201A', opacity: dimmed ? 0.4 : 1, boxShadow: glowing ? '0px 0px 22px rgba(217,185,121,0.25)' : '0px 8px 18px rgba(0,0,0,0.32)',
  }, style]}>
    <View style={{ flex: 1, overflow: 'hidden', borderRadius: width * 0.045 }}>
      {hidden ? <>
        <LinearGradient colors={['#254336', '#0C201A', '#1A342B']} style={StyleSheet.absoluteFill} />
        <Ornament opacity={0.15}/>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: width * 0.08 }}><Emblem size={width * 0.65} />{!compact && <Text style={{ fontFamily: serif, color: C.gold, letterSpacing: 2, fontSize: width * 0.11 }}>COMPLOT</Text>}</View>
      </> : <>
        <Image source={portraits[role!]} style={StyleSheet.absoluteFill} contentFit="cover" transition={0} cachePolicy="memory-disk" aria-hidden={true} />
        <LinearGradient colors={['transparent', 'rgba(5,13,10,0.15)', '#06100D']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
        {!compact && <><View style={{ position: 'absolute', top: 9, left: 9, width: width * 0.22, height: width * 0.22, borderWidth: 1, borderColor: '#8C7953', borderRadius: width, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,20,16,0.85)' }}><RoleIcon role={role!} size={width * 0.13} /></View>
          <View style={{ position: 'absolute', bottom: height * 0.07, left: 6, right: 6, alignItems: 'center', gap: 3 }}><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: C.text, fontFamily: serif, fontSize: width * (role!.length > 10 ? 0.16 : 0.19) }}>{role}</Text><View style={{ width: width * 0.22, height: 1, backgroundColor: accent, marginVertical: 2 }}/><Text style={{ color: accent, fontSize: width * 0.052, letterSpacing: width * 0.012, fontFamily: sansBold }}>{ROLES[role!].subtitle}</Text></View></>}
      </>}
      <View style={{ pointerEvents: 'none', position: 'absolute', inset: width * 0.04, borderWidth: 1, borderColor: hidden ? '#7E704E' : 'rgba(229,201,149,0.5)', borderRadius: width * 0.015 }} />
      {revealed && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8,15,12,0.55)', alignItems: 'center', justifyContent: 'center' }]}><View style={{ paddingVertical: 5, paddingHorizontal: compact ? 3 : 10, backgroundColor: '#542C27', borderColor: '#C67B65', borderTopWidth: 1, borderBottomWidth: 1, transform: [{ rotate: '-12deg' }] }}><Text style={{ color: '#FFD3C6', fontSize: compact ? 7 : width * 0.072, letterSpacing: 1, fontFamily: sansBold }}>RÉVÉLÉE</Text></View></View>}
    </View>
  </View>;
}



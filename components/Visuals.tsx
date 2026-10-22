import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import { C, sansBold, serif } from '../game/theme';
import { RoleName } from '../game/types';
import { ROLES } from '../game/cards';
import Text from './Text';
export function Icon({ name, size = 18, color = C.gold }: { name: React.ComponentProps<typeof Feather>['name']; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} aria-hidden={true} />;
}
const roleIcons: Record<RoleName, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  Duchesse: 'crown-outline', Assassin: 'sword', Capitaine: 'anchor', Comtesse: 'shield-crown-outline', Ambassadeur: 'script-text-outline', Inquisiteur: 'eye-outline',
};
export function RoleIcon({ role, size = 24 }: { role: RoleName; size?: number }) {
  return <MaterialCommunityIcons name={roleIcons[role]} size={size} color={ROLES[role].color} aria-hidden={true} />;
}
export function Emblem({ size = 48, color = C.gold }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 100 100" aria-hidden={true}>
    <Circle cx="50" cy="50" r="45" fill="none" stroke={color} opacity={0.5} />
    <Circle cx="50" cy="50" r="38" fill="none" stroke={color} opacity={0.25} />
    <Path d="M50 3 L55 37 L77 23 L63 45 L97 50 L63 55 L77 77 L55 63 L50 97 L45 63 L23 77 L37 55 L3 50 L37 45 L23 23 L45 37Z" fill={color} opacity={0.2}/>
    <Path d="M30 37 L38 56 L62 56 L70 37 L57 44 L50 30 L43 44Z M38 65 L62 65" stroke={color} strokeWidth="3" strokeLinejoin="round" fill="none" />
    <Circle cx="50" cy="76" r="2" fill={color} />
  </Svg>;
}
export function Ornament({ opacity = 0.08 }: { opacity?: number }) {
  return <Svg width="100%" height="100%" style={[StyleSheet.absoluteFill, { opacity }]} aria-hidden={true}>
    <Defs><Pattern id="weave" width="48" height="48" patternUnits="userSpaceOnUse"><Path d="M24 1 L47 24 L24 47 L1 24Z" fill="none" stroke={C.gold} strokeWidth="0.5" /><Circle cx="24" cy="24" r="1" fill={C.gold}/></Pattern></Defs>
    <Rect width="100%" height="100%" fill="url(#weave)"/>
  </Svg>;
}
export function Atmosphere() {
  return <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
    <LinearGradient colors={['#173328', '#0B1B16', '#081612']} locations={[0, 0.5, 1]} start={{ x: 1, y: 0 }} end={{ x: 0.1, y: 1 }} style={StyleSheet.absoluteFill} />
    <Ornament opacity={0.035} />
  </View>;
}
export function Coins({ amount, large = false }: { amount: number; large?: boolean }) {
  const size = large ? 31 : 20;
  return <View accessibilityLabel={amount + ' pièces'} style={{ flexDirection: 'row', alignItems: 'center', gap: large ? 9 : 6 }}>
    <View style={{ width: size, height: size, borderRadius: size / 2, borderColor: '#9E7C3F', borderWidth: 1, padding: 2, backgroundColor: '#D7B46A', transform: [{ rotate: '-12deg' }] }}><View style={{ flex: 1, borderRadius: size, borderWidth: 1, borderColor: '#8B6B33', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#61471E', fontSize: large ? 20 : 12, lineHeight: large ? 24 : 14, fontFamily: serif }}>C</Text></View></View>
    <Text style={{ color: C.gold, fontFamily: sansBold, fontSize: large ? 26 : 16 }}>{amount}</Text>
  </View>;
}
export function Divider() {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, width: '100%' }}><View style={{ height: 1, flex: 1, backgroundColor: C.line }} /><Svg width={12} height={12} viewBox="0 0 12 12"><Path d="M6 1 L11 6 L6 11 L1 6Z" stroke={C.gold} fill="none"/></Svg><View style={{ height: 1, flex: 1, backgroundColor: C.line }}/></View>;
}



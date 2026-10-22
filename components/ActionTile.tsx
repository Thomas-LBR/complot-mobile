import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { actionInfo, ROLES } from '../game/cards';
import { ActionType, Variant } from '../game/types';
import { C, sansBold, serif } from '../game/theme';
import { Icon, RoleIcon } from './Visuals';
import Text from './Text';
export default function ActionTile({ type, variant, disabled, wide, onPress }: { type: ActionType; variant: Variant; disabled: boolean; wide: boolean; onPress: () => void }) {
  const [hovered, setHovered] = useState(false);
  const info = actionInfo[type], role = type === 'exchange' ? variant : info.role;
  const cost = type === 'coup' ? 7 : type === 'assassinate' ? 3 : 0;
  const accent = role ? ROLES[role].color : type === 'coup' ? C.red : C.gold;
  return <Pressable accessibilityRole="button" accessibilityLabel={info.name + ' ' + info.amount} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)} onFocus={() => setHovered(true)} onBlur={() => setHovered(false)} style={({ pressed }) => ({
    flexBasis: wide ? '30%' : '46%', flexGrow: 1, minWidth: 125, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: hovered && !disabled ? accent : C.line, opacity: disabled ? 0.45 : 1, transform: [{ translateY: pressed ? 1 : hovered ? -3 : 0 }],
  })}>
    <LinearGradient colors={hovered && !disabled ? ['#284233', '#1A3026'] : ['#182F25', '#0D2119']} style={{ flex: 1, padding: 16, gap: 9, minHeight: 142 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#0B1E17', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#344B39' }}>{role ? <RoleIcon role={role} size={20}/> : <Icon name={type === 'income' ? 'sun' : type === 'coup' ? 'crosshair' : 'gift'} color={accent} size={18}/>}</View><Text style={{ color: accent, fontSize: 23, fontFamily: serif }}>{info.amount}</Text></View>
      <Text style={{ color: C.text, fontFamily: sansBold, fontSize: 12 }}>{info.name}</Text>
      <Text style={{ color: C.muted, fontSize: 10, lineHeight: 17 }}>{disabled && cost ? cost + ' pièces nécessaires' : info.detail}</Text>
      <Text style={{ color: accent, fontSize: 8, letterSpacing: 1, marginTop: 'auto' }}>{role ? role.toUpperCase() : 'ACTION LIBRE'}</Text>
    </LinearGradient>
  </Pressable>;
}


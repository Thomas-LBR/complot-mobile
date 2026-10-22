import React from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, serif, ui } from '../game/theme';

import { Emblem, Icon } from './Visuals';
import { Entrance } from './Motion';
import Text from './Text';
export function Header({ connected, onRules, right }: { connected: boolean; onRules: () => void; right?: React.ReactNode }) {
  const wide = useWindowDimensions().width > 700;
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: wide ? 16 : 9, paddingVertical: 4, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: C.line, flexWrap: 'wrap' }}>
    <Emblem size={wide ? 43 : 33} />
    <View style={{ gap: 1 }}><Text style={{ fontFamily: serif, color: C.text, fontSize: wide ? 29 : 24, letterSpacing: 4 }}>COMPLOT</Text>{wide && <Text style={{ fontSize: 8, letterSpacing: 2.5, color: C.gold }}>CHAQUE SOURIRE CACHE UN SECRET</Text>}</View>
    <View style={{ flex: 1 }} />
    <View accessibilityLabel={connected ? 'Connecté' : 'Reconnexion'} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: connected ? C.mint : C.red }}/>{wide && <Text style={{ fontSize: 10, color: C.muted }}>{connected ? 'En ligne' : 'Reconnexion…'}</Text>}</View>
    {right}<Pressable accessibilityRole="button" accessibilityLabel="Règles du jeu" onPress={onRules} style={{ flexDirection: 'row', gap: 9, alignItems: 'center', minHeight: 44, paddingHorizontal: 10, borderWidth: 1, borderRadius: 7, borderColor: C.line }}><Icon name="book-open" size={15} color={C.text}/>{wide && <Text style={{ color: C.text, fontSize: 11 }}>Règles du jeu</Text>}</Pressable>
  </View>;
}
export function Sheet({ visible, title, subtitle, children, onClose }: { visible: boolean; title: string; subtitle?: string; children: React.ReactNode; onClose?: () => void }) {
  if (!visible) return null;
  return <Modal visible transparent animationType="fade" onRequestClose={onClose || (() => {})}>
    <View style={{ flex: 1, backgroundColor: 'rgba(3,10,7,0.88)', padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Entrance style={{ width: '100%', maxWidth: 680, maxHeight: '92%', backgroundColor: C.panel, borderRadius: 16, borderWidth: 1, borderColor: '#6B664A', overflow: 'hidden', boxShadow: '0px 24px 100px rgba(0,0,0,0.5)' }}>
        <LinearGradient colors={['#21392C', '#11261F']} style={{ padding: 24, paddingBottom: 20, gap: 9, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <View style={ui.row}><Text accessibilityRole="header" style={[ui.title, { flex: 1, fontSize: 34 }]}>{title}</Text>{onClose && <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={onClose} style={{ padding: 12 }}><Icon name="x" color={C.muted}/></Pressable>}</View>
          {!!subtitle && <Text style={ui.body}>{subtitle}</Text>}
        </LinearGradient>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 18 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </Entrance>
    </View>
  </Modal>;
}
export function Notice({ text, danger, onClose }: { text: string; danger?: boolean; onClose?: () => void }) {
  return <View accessibilityRole="alert" style={{ backgroundColor: danger ? '#382820' : '#1B3025', padding: 14, borderRadius: 8, borderLeftWidth: 2, borderLeftColor: danger ? C.red : C.gold, flexDirection: 'row', gap: 12, alignItems: 'center' }}><Icon name={danger ? 'alert-circle' : 'info'} color={danger ? C.red : C.gold} size={17}/><Text style={{ color: danger ? C.red : '#D9CBAC', flex: 1, fontSize: 12, lineHeight: 20 }}>{text}</Text>{onClose && <Pressable accessibilityRole="button" accessibilityLabel="Fermer le message" onPress={onClose} style={{ padding: 8 }}><Icon name="x" size={15} color={C.muted}/></Pressable>}</View>;
}



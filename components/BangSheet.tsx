import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from './Text';
import { sansBold, serif } from '../game/theme';

export function Sheet({ visible, onClose, title, subtitle, children }: { visible: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode }) {
  return <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={s.overlay}><Pressable accessibilityRole="button" accessibilityLabel="Fermer la fenêtre" onPress={onClose} style={StyleSheet.absoluteFill}/>
      <View accessibilityViewIsModal style={s.sheet}><View style={s.header}><Text accessibilityRole="header" style={s.title}>{title}</Text><Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={onClose} style={s.close}><Text style={s.cross}>×</Text></Pressable></View>
        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}<ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </View>
    </SafeAreaView>
  </Modal>;
}
const s = StyleSheet.create({ overlay: { flex: 1, backgroundColor: '#30251ECC', justifyContent: 'center', padding: 16 }, sheet: { width: '100%', maxWidth: 680, maxHeight: '90%', alignSelf: 'center', backgroundColor: '#FFF8E8', borderRadius: 24, borderWidth: 3, borderColor: '#493022', padding: 20 }, header: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 }, title: { flex: 1, fontFamily: serif, fontSize: 30, color: '#493022' }, close: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F2C358', borderWidth: 2, borderColor: '#493022', alignItems: 'center', justifyContent: 'center' }, cross: { fontFamily: sansBold, fontSize: 25, color: '#493022' }, subtitle: { fontSize: 13, lineHeight: 20, color: '#785B45', marginBottom: 16 } });

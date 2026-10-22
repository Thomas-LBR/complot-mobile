import { StyleSheet } from 'react-native';
export const C = {
  bg: '#081612', panel: '#10241E', raised: '#1A3329', line: '#304439',
  text: '#F5EEDF', muted: '#A7B4A8', gold: '#D9B979', goldDark: '#332D1D',
  mint: '#A7D6B1', red: '#ED9B8A', blue: '#9FBBD0',
};
export const serif = 'CormorantGaramond_600SemiBold';
export const serifItalic = 'CormorantGaramond_600SemiBold_Italic';
export const sans = 'Manrope_400Regular';
export const sansBold = 'Manrope_700Bold';
export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  container: { width: '100%', maxWidth: 1440, alignSelf: 'center', padding: 24, gap: 26, paddingBottom: 48 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  panel: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 22, gap: 16 },
  eyebrow: { color: C.gold, fontFamily: sansBold, fontSize: 10, letterSpacing: 2.3, textTransform: 'uppercase' },
  title: { color: C.text, fontSize: 38, fontFamily: serif },
  body: { color: C.muted, fontFamily: sans, fontSize: 13, lineHeight: 22 },
  label: { color: C.text, fontSize: 13, fontFamily: sansBold },
  input: { borderWidth: 1, borderColor: '#465347', borderRadius: 8, backgroundColor: '#0A1914', color: C.text, fontFamily: sans, padding: 15, fontSize: 16, minHeight: 53 },
  divider: { height: 1, backgroundColor: C.line },
  badge: { backgroundColor: C.raised, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 5, color: C.muted, fontSize: 10, fontFamily: sans },
});


import React, { useEffect, useState } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ActionButton from '../components/ActionButton';
import Card from '../components/Card';
import Text from '../components/Text';
import { Header, Notice } from '../components/GameUI';
import { Atmosphere, Divider, Emblem, Icon } from '../components/Visuals';
import { Entrance } from '../components/Motion';
import RulesSheet from '../components/RulesSheet';
import { useEngine } from '../game/EngineContext';
import { C, serif, serifItalic, ui } from '../game/theme';
import { ALL_ROLES, ROLES } from '../game/cards';

export default function Home() {
  const e = useEngine(), params = useLocalSearchParams<{ code?: string }>();
  const width = useWindowDimensions().width, wide = width >= 900;
  const [name, setName] = useState(''), [code, setCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create'), [rules, setRules] = useState(false), [validation, setValidation] = useState('');
  useEffect(() => {
    try { if (Platform.OS === 'web') setName(window.localStorage.getItem('complot.name') || ''); } catch { /* Optional preference. */ }
    if (params.code) { setCode(String(params.code).slice(0, 5).toUpperCase()); setMode('join'); }
  }, [params.code]);
  const submit = () => {
    if (!name.trim()) return setValidation('Choisissez votre nom de joueur.');
    if (mode === 'join' && code.trim().length !== 5) return setValidation('Le code de la salle contient 5 caractères.');
    setValidation('');
    try { if (Platform.OS === 'web') window.localStorage.setItem('complot.name', name.trim()); } catch { /* Optional preference. */ }
    if (mode === 'create') e.createRoom(name.trim()); else e.joinRoom(code.trim().toUpperCase(), name.trim());
  };
  if (e.room) return <Redirect href={e.room.phase === 'waiting' ? '/lobby' : '/game'} />;
  const cardW = wide ? 165 : Math.min(130, (width - 90) / 2);
  return <SafeAreaView style={ui.page}><Atmosphere/><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[ui.container, { paddingHorizontal: wide ? 48 : 20, maxWidth: 1320 }]}>
      <Header connected={e.connected} onRules={() => setRules(true)} />
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 70 : 26, paddingTop: wide ? 22 : 6, paddingBottom: 16, alignItems: 'center' }}>
        <Entrance style={{ flex: wide ? 1.25 : undefined, width: wide ? undefined : '100%', gap: 19 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><View style={{ width: 24, height: 1, backgroundColor: C.gold }}/><Text style={ui.eyebrow}>BLUFF. AUDACE. TRAHISON.</Text></View>
          <Text accessibilityRole="header" style={{ fontSize: wide ? 74 : 52, lineHeight: wide ? 73 : 54, color: C.text, fontFamily: serif }}>Les apparences{ '\n' }sont <Text style={{ color: C.gold, fontFamily: serifItalic }}>trompeuses.</Text></Text>
          <Text style={[ui.body, { maxWidth: 390, fontSize: 14, lineHeight: 24 }]}>Deux cartes en main. Mille façons de mentir.{ '\n' }Entrez dans le cercle et faites tomber les masques.</Text>
          <View style={{ flexDirection: 'row', gap: 22, alignItems: 'center' }}><View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}><Icon name="users" size={14}/><Text style={{ fontSize: 10, color: C.muted }}>2 à 8 joueurs</Text></View><View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}><Icon name="monitor" size={14}/><Text style={{ fontSize: 10, color: C.muted }}>PC & mobile</Text></View><View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}><Icon name="unlock" size={14}/><Text style={{ fontSize: 10, color: C.muted }}>Sans compte</Text></View></View>
          <View accessibilityLabel="Les personnages de Complot" style={{ height: cardW * 1.75, alignItems: 'center', justifyContent: 'center', marginTop: wide ? 14 : 5 }}>
            <View style={{ pointerEvents: 'none', position: 'absolute', top: -20, opacity: 0.1 }}><Emblem size={cardW * 1.9}/></View>
            <View style={{ position: 'absolute', transform: [{ translateX: -cardW * 0.72 }, { rotate: '-14deg' }], top: 16 }}><Card role="Assassin" width={cardW} height={cardW * 1.5}/></View>
            <View style={{ position: 'absolute', transform: [{ translateX: cardW * 0.72 }, { rotate: '14deg' }], top: 16 }}><Card role="Duchesse" width={cardW} height={cardW * 1.5}/></View>
            <View style={{ position: 'absolute', top: 0, transform: [{ rotate: '-2deg' }] }}><Card role="Capitaine" width={cardW * 1.08} height={cardW * 1.62} glowing/></View>
          </View>
        </Entrance>
        <Entrance style={{ flex: wide ? 0.9 : undefined, width: '100%', maxWidth: 440 }}>
          <LinearGradient colors={['#263D2C', '#11261D']} style={{ borderRadius: 18, borderWidth: 1, borderColor: '#687050', padding: wide ? 32 : 24, gap: 23, boxShadow: '0px 24px 64px rgba(0,0,0,0.25)' }}>
            <View style={{ gap: 9 }}><Emblem size={40}/><Text style={ui.eyebrow}>UNE PLACE VOUS ATTEND</Text><Text style={[ui.title, { fontSize: 36 }]}>Entrez dans le cercle.</Text><Text style={ui.body}>Invitez vos amis. Gardez vos secrets.</Text></View>
            <View style={{ flexDirection: 'row', padding: 4, borderRadius: 8, backgroundColor: '#091A12', borderWidth: 1, borderColor: C.line }}>
              {(['create', 'join'] as const).map(m => <Pressable accessibilityRole="tab" accessibilityState={{ selected: m === mode }} key={m} onPress={() => { setMode(m); setValidation(''); e.clearError(); }} style={{ flex: 1, padding: 13, borderRadius: 5, backgroundColor: mode === m ? '#2A4331' : 'transparent' }}><Text style={{ textAlign: 'center', color: mode === m ? C.text : C.muted, fontSize: 12 }}>{m === 'create' ? 'Créer une salle' : 'Rejoindre'}</Text></Pressable>)}
            </View>
            <View style={{ gap: 9 }}><Text style={ui.label}>Votre nom de joueur</Text><TextInput accessibilityLabel="Votre nom de joueur" style={ui.input} placeholder="Ex. Capitaine Lune" placeholderTextColor="#899686" value={name} onChangeText={setName} maxLength={20} autoComplete="off" returnKeyType="go" onSubmitEditing={submit}/></View>
            {mode === 'join' && <View style={{ gap: 9 }}><Text style={ui.label}>Code de la salle</Text><TextInput accessibilityLabel="Code de la salle" style={[ui.input, { letterSpacing: 6 }]} placeholder="A1B2C" placeholderTextColor="#899686" value={code} onChangeText={s => setCode(s.replace(/[^a-z0-9]/gi, '').toUpperCase())} maxLength={5} autoCapitalize="characters" autoCorrect={false} onSubmitEditing={submit}/></View>}
            {!!(validation || e.error) && <Notice text={validation || e.error!} danger onClose={() => { setValidation(''); e.clearError(); }}/>}
            <ActionButton label={mode === 'create' ? 'Créer mon équipage  →' : 'Rejoindre la table  →'} onPress={submit} disabled={!e.connected} loading={e.busy}/>
            <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' }}><Icon name="lock" size={12} color={C.muted}/><Text style={{ color: C.muted, textAlign: 'center', fontSize: 10, lineHeight: 17 }}>{e.connected ? 'Salle privée · Un code suffit pour vous rejoindre' : 'Le serveur doit être démarré pour jouer.'}</Text></View>
          </LinearGradient>
        </Entrance>
      </View>
      <Divider/>
      <View style={{ gap: 22, paddingVertical: 8 }}><View style={[ui.row, { justifyContent: 'space-between' }]}><View style={{ gap: 5 }}><Text style={ui.eyebrow}>LA GALERIE DES SUSPECTS</Text><Text style={[ui.title, { fontSize: 34 }]}>Tous ont quelque chose à cacher.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Découvrir les rôles" onPress={() => setRules(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 44 }}><Text style={{ color: C.gold, fontSize: 12 }}>Découvrir les rôles</Text><Icon name="arrow-up-right" size={16}/></Pressable></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18, paddingBottom: 18, paddingTop: 3 }}>{ALL_ROLES.map((role, i) => <Pressable accessibilityRole="button" accessibilityLabel={'Comprendre le rôle ' + role} key={role} onPress={() => setRules(true)} style={({ pressed }) => ({ width: wide ? 210 : 165, gap: 11, opacity: pressed ? 0.75 : 1 })}><Card role={role} width={wide ? 210 : 165} height={wide ? 286 : 228}/><View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><Text style={{ color: '#7D8C78', fontSize: 9 }}>0{i + 1}</Text><Text style={{ fontFamily: serif, color: C.text, fontSize: 24 }}>{role}</Text></View><Text style={{ color: C.muted, lineHeight: 19, fontSize: 11 }}>{ROLES[role].desc}</Text></Pressable>)}</ScrollView>
      </View>
      <Divider/>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 26, paddingVertical: 8 }}>{[['01', 'Invitez votre cercle', 'Une salle, un code, et vos meilleurs adversaires.'], ['02', 'Cultivez le doute', 'Annoncez un rôle. Tentez un bluff. Observez les réactions.'], ['03', 'Faites tomber les masques', 'Devinez les cartes adverses et restez le dernier en jeu.']].map(([n, title, body]) => <View key={n} style={{ flex: 1, flexDirection: 'row', gap: 17 }}><Text style={{ fontFamily: serif, color: C.gold, fontSize: 33 }}>{n}</Text><View style={{ flex: 1, gap: 5 }}><Text style={ui.label}>{title}</Text><Text style={{ color: C.muted, fontSize: 11, lineHeight: 19 }}>{body}</Text></View></View>)}</View>
      <Text style={{ textAlign: 'center', color: '#8A9987', fontSize: 9, letterSpacing: 2, paddingTop: 12 }}>COMPLOT · NE VOUS FIEZ À PERSONNE.</Text>
    </ScrollView>
    <RulesSheet visible={rules} onClose={() => setRules(false)}/>
  </KeyboardAvoidingView></SafeAreaView>;
}



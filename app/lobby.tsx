import React, { useState } from 'react';
import { Redirect } from 'expo-router';
import Constants from 'expo-constants';
import { Platform, Pressable, ScrollView, Share, useWindowDimensions, View } from 'react-native';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionButton from '../components/ActionButton';
import Card from '../components/Card';
import { Atmosphere, Emblem } from '../components/Visuals';
import { Header, Notice, Sheet } from '../components/GameUI';
import RulesSheet from '../components/RulesSheet';
import { useEngine } from '../game/EngineContext';
import { C, serif, ui } from '../game/theme';
import { colorFromUsername, initials } from '../game/utils';

export default function Lobby() {
  const e = useEngine(), wide = useWindowDimensions().width >= 850;
  const [rules, setRules] = useState(false), [leaving, setLeaving] = useState(false), [shared, setShared] = useState('');
  const r = e.room; if (!r) return <Redirect href="/" />;
  if (r.phase !== 'waiting') return <Redirect href="/game" />;
  const me = r.players.find(p => p.id === e.myId), host = r.host === e.myId;
  const allReady = r.players.length >= 2 && r.players.every(p => p.ready && p.connected);
  const share = async () => {
    const hostUri = Constants.expoConfig?.hostUri;
    const origin = hostUri ? `http://${hostUri}` : Platform.OS === 'web' ? window.location.origin : '';
    const message = `Rejoins mon équipage sur Complot ! Code : ${r.code}${origin ? `\n${origin}/?code=${r.code}` : ''}`;
    try {
      if (Platform.OS === 'web' && navigator.clipboard) { await navigator.clipboard.writeText(message); setShared('Invitation copiée. Envoyez-la à vos amis sur le même réseau.'); }
      else { await Share.share({ message }); setShared('Code prêt à partager.'); }
    } catch { setShared(`Partagez ce code à vos amis : ${r.code}`); }
  };
  return <SafeAreaView style={ui.page}><Atmosphere/><ScrollView contentContainerStyle={ui.container}>
    <Header connected={e.connected} onRules={() => setRules(true)} right={<ActionButton small label="Quitter" variant="ghost" onPress={() => setLeaving(true)} />} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}><View style={{ flex: 1, gap: 8 }}><Text style={ui.eyebrow}>LE SALON PRIVÉ</Text><Text style={[ui.title, { fontSize: wide ? 50 : 36 }]}>L’équipage se rassemble.</Text><Text style={ui.body}>Prenez place. La première alliance commence ici.</Text></View>{wide && <View style={{ flexDirection: 'row', paddingHorizontal: 35 }}><Card role="Comtesse" width={65} height={98} style={{ transform: [{ rotate: '-12deg' }] }}/><Card faceDown width={65} height={98} style={{ marginLeft: -12, transform: [{ rotate: '10deg' }] }}/></View>}</View>
    {!!e.error && <Notice text={e.error} danger onClose={e.clearError} />}
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: 24 }}>
      <View style={{ flex: 1.6, gap: 22 }}>
        <View style={[ui.panel, { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', borderColor: '#706747', backgroundColor: '#1B3225' }]}><Emblem size={50}/><View style={{ flex: 1, gap: 8 }}><Text style={ui.eyebrow}>VOTRE CODE PRIVÉ</Text><Text selectable style={{ color: C.gold, fontFamily: serif, fontSize: wide ? 50 : 39, letterSpacing: 8 }}>{r.code}</Text></View><ActionButton label="Copier l’invitation" variant="ghost" onPress={share} /></View>
        {!!shared && <Notice text={shared} onClose={() => setShared('')} />}
        <View style={ui.row}><Text style={[ui.label, { flex: 1, fontSize: 17 }]}>À bord</Text><Text style={ui.badge}>{r.players.length} / 8 joueurs</Text><Text style={{ color: C.mint, fontSize: 12 }}>{r.players.filter(p => p.ready).length} prêts</Text></View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {Array.from({ length: 8 }, (_, i) => { const p = r.players[i]; return <View key={p?.id || i} style={{ width: wide ? '48%' : '100%', borderWidth: 1, borderStyle: p ? 'solid' : 'dashed', borderColor: p?.ready ? '#39564F' : C.line, borderRadius: 10, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 77, backgroundColor: p ? C.panel : 'transparent' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: p ? colorFromUsername(p.username) : C.panel, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: p ? C.text : '#526570', fontWeight: '600' }}>{p ? initials(p.username) : '+'}</Text></View>
            <View style={{ flex: 1, gap: 5 }}><Text numberOfLines={1} style={{ color: p ? C.text : '#71848D', fontSize: 13 }}>{p ? `${p.username}${p.id === e.myId ? ' · vous' : ''}` : 'Place disponible'}</Text>{p && <Text style={{ color: C.muted, fontSize: 10 }}>{p.id === r.host ? 'Hôte de la table' : p.wins ? `${p.wins} victoire${p.wins > 1 ? 's' : ''}` : 'Membre de l’équipage'}</Text>}</View>
            {p && <Text style={{ color: !p.connected ? C.red : p.ready ? C.mint : C.muted, fontSize: 11 }}>{!p.connected ? 'Hors ligne' : p.ready ? '✓ Prêt' : 'En attente'}</Text>}
            {p && host && !p.connected && <ActionButton small label="Retirer" variant="danger" onPress={() => e.removeDisconnected(p.id)} />}
          </View>; })}
        </View>
      </View>
      <View style={{ flex: 1, gap: 20 }}><View style={ui.panel}>
        <Text style={ui.eyebrow}>LES RÈGLES DE LA TABLE</Text><Text style={[ui.title, { fontSize: 24 }]}>Choisissez votre intrigue.</Text>
        {(['Ambassadeur', 'Inquisiteur'] as const).map(v => <Pressable accessibilityRole="radio" accessibilityState={{ selected: r.variant === v, disabled: !host }} disabled={!host || e.busy} key={v} onPress={() => { if (v !== r.variant) e.setVariant(v); }} style={{ padding: 16, borderRadius: 12, borderWidth: 1, borderColor: r.variant === v ? C.gold : C.line, backgroundColor: r.variant === v ? '#253A28' : C.bg, gap: 7 }}><Text style={{ color: C.text, fontWeight: '600' }}>{r.variant === v ? '◉' : '○'} {v === 'Ambassadeur' ? 'Classique' : 'Inquisiteur'}</Text><Text style={{ color: C.muted, fontSize: 12, lineHeight: 19 }}>{v === 'Ambassadeur' ? 'L’Ambassadeur échange deux cartes. Idéal pour découvrir le jeu.' : 'Inspectez une carte adverse ou échangez avec une carte de la Cour.'}</Text></Pressable>)}
        <View style={ui.divider} /><Text style={ui.body}>{r.players.length === 2 ? 'Duel : une carte au hasard et une carte choisie. Le premier joueur reçoit 1 pièce.' : 'Deux influences, deux pièces. À 7 ou 8 joueurs, le paquet passe à 20 cartes.'}</Text>
        <Text style={{ color: C.muted, fontSize: 11 }}>{host ? 'Changer de variante réinitialise les confirmations.' : 'L’hôte choisit la variante de cette manche.'}</Text>
      </View><View style={ui.panel}>
        <ActionButton label={me?.ready ? '✓ Je suis prêt' : 'Je suis prêt à jouer'} variant={me?.ready ? 'success' : 'primary'} onPress={e.setReady} disabled={!e.connected} loading={e.busy} />
        {host ? <ActionButton label="Lancer la partie  →" onPress={e.startGame} disabled={!allReady || !e.connected || e.busy} /> : <Text style={[ui.body, { textAlign: 'center' }]}>L’hôte lance la partie une fois l’équipage prêt.</Text>}
        {host && !allReady && <Text style={{ color: C.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>{r.players.length < 2 ? 'Invitez au moins un autre joueur.' : 'Tout le monde doit confirmer avant le départ.'}</Text>}
      </View></View>
    </View>
    <RulesSheet visible={rules} onClose={() => setRules(false)} variant={r.variant} />
    <Sheet visible={leaving} title="Quitter l’équipage ?" subtitle="Votre place dans cette salle sera libérée." onClose={() => setLeaving(false)}><ActionButton label="Quitter la salle" variant="danger" onPress={e.leave} loading={e.busy} /></Sheet>
  </ScrollView></SafeAreaView>;
}

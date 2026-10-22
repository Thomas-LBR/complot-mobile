import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionButton from '../components/ActionButton';
import Card from '../components/Card';
import TableBoard from '../components/TableBoard';
import PlayerDetails from '../components/PlayerDetails';
import ActionTile from '../components/ActionTile';
import { Atmosphere, Coins, Divider, Icon, RoleIcon } from '../components/Visuals';
import { Header, Notice, Sheet } from '../components/GameUI';
import RulesSheet from '../components/RulesSheet';
import { actionInfo, blockRoles, ROLES, tableRoles } from '../game/cards';
import { useEngine } from '../game/EngineContext';
import { C, serif, ui } from '../game/theme';
import { ActionType, RoleName } from '../game/types';
import { isMyTurn, pendingLabel, stageLabel } from '../game/utils';

export default function Game() {
  const e = useEngine(), wide = useWindowDimensions().width >= 1000;
  const [actionGroup, setActionGroup] = useState(0), [reactionOpen, setReactionOpen] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null), [actionsOpen, setActionsOpen] = useState(false), [handOpen, setHandOpen] = useState(false);
  const [rules, setRules] = useState(false), [hidden, setHidden] = useState(false);
  const [choice, setChoice] = useState<ActionType | null>(null), [target, setTarget] = useState('');
  const [targetRole, setTargetRole] = useState<RoleName | null>(null);
  const [selected, setSelected] = useState<number[]>([]), [confirmChallenge, setConfirmChallenge] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false), [removeId, setRemoveId] = useState<string | null>(null);
  useEffect(() => { setSelected([]); }, [e.room?.pendingAction?.id, e.room?.pendingAction?.stage]);
  useEffect(() => { setActionsOpen(false); setReactionOpen(false); setHandOpen(false); setPlayerId(null); setChoice(null); setTarget(''); setTargetRole(null); setConfirmChallenge(null); }, [e.room?.turn, e.room?.pendingAction?.id, e.room?.pendingAction?.stage]);
  const r = e.room; if (!r) return <Redirect href="/" />;
  if (r.phase === 'waiting') return <Redirect href="/lobby" />;
  const me = r.players.find(p => p.id === e.myId), host = r.host === e.myId, a = r.pendingAction;
  const myTurn = isMyTurn(r, e.myId), forced = (me?.coins || 0) >= 10;
  const active = r.players[r.currentPlayerIndex];
  const eligible = !!a && a.eligibleIds.includes(e.myId || '') && !a.respondedIds.includes(e.myId || '');
  const unavailable = e.busy || !e.connected || r.paused;
  const needsTarget = choice && ['steal', 'assassinate', 'coup', 'inspect'].includes(choice);
  const needsRole = choice === 'assassinate' || choice === 'coup';
  const keep = e.exchangeOptions?.currentCards.length || 0;
  const pool = e.exchangeOptions ? [...e.exchangeOptions.currentCards, ...e.exchangeOptions.drawnCards] : [];
  const revealReasons = { challenge_lost: 'Le rôle annoncé a été prouvé. Votre contestation vous coûte une influence.', challenge_failed: 'Votre bluff a été démasqué. Choisissez l’influence que vous perdez.', assassinated: 'L’Assassin a deviné votre rôle. Vous devez révéler la carte visée.', coup: 'Votre adversaire a deviné votre rôle. Vous devez révéler la carte visée.' };
  const history = <View style={[ui.panel, { backgroundColor: '#0D211A' }]}><View style={ui.row}><Text style={[ui.eyebrow, { flex: 1 }]}>JOURNAL DE BORD</Text><Text style={{ color: C.muted, fontSize: 10 }}>PUBLIC</Text></View><ScrollView style={{ maxHeight: 300 }} contentContainerStyle={{ gap: 15 }}>{r.history.length ? [...r.history].reverse().slice(0, 30).map((entry, i) => <View key={entry.id} style={{ flexDirection: 'row', gap: 12 }}><Text style={{ color: i === 0 ? C.gold : '#71848D', fontSize: 10, width: 26, paddingTop: 3 }}>T{entry.turn}</Text><Text style={{ color: i === 0 ? C.text : C.muted, flex: 1, fontSize: 12, lineHeight: 19 }}>{entry.text}</Text></View>) : <Text style={ui.body}>Les actions de la partie apparaîtront ici.</Text>}</ScrollView></View>;
  const privateCards = <View style={[ui.panel, { borderColor: '#736747', backgroundColor: '#142A20' }]}>
    <View style={ui.row}><View style={{ flex: 1, gap: 4 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon name="lock" size={13}/><Text style={ui.eyebrow}>VOTRE MAIN SECRÈTE</Text></View><Text style={{ color: C.muted, fontSize: 11 }}>Ces cartes ne sont visibles que par vous.</Text></View><ActionButton label={hidden ? 'Afficher' : 'Masquer'} variant="ghost" small onPress={() => setHidden(!hidden)} /></View>
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18, paddingVertical: 8 }}>{e.myCards.map((c, i) => <View key={i} style={{ alignItems: 'center', gap: 9 }}><Card role={c.role} faceDown={hidden && !c.revealed} revealed={c.revealed} width={120} height={180} glowing={myTurn && !hidden && !c.revealed} /><Text style={{ fontSize: 10, color: c.revealed ? C.red : C.mint }}>{c.revealed ? 'Influence perdue' : hidden ? 'À l’abri des regards' : 'Influence en jeu'}</Text></View>)}</View>
    <Divider/><View style={[ui.row, { justifyContent: 'space-between' }]}><View style={{ gap: 4 }}><Text style={ui.eyebrow}>VOTRE TRÉSOR</Text><Text style={{ color: C.muted, fontSize: 10 }}>Faites-en bon usage.</Text></View><Coins amount={me?.coins || 0} large/></View>
  </View>;

  const pendingPanel = a ? <View style={[ui.panel, { borderColor: '#6F6248' }]}>
            <Text style={ui.eyebrow}>ACTION EN COURS</Text><Text style={[ui.title, { fontSize: 24 }]}>{pendingLabel(a, r.players)}</Text><Text style={ui.body}>{stageLabel(a)}</Text>
            {['challengeAction', 'challengeBlock', 'blockWindow'].includes(a.stage) && <View style={ui.row}>{a.eligibleIds.map(id => <Text key={id} style={[ui.badge, { color: a.respondedIds.includes(id) ? C.mint : C.muted }]}>{a.respondedIds.includes(id) ? '✓' : '○'} {r.players.find(p => p.id === id)?.username}</Text>)}</View>}
            {eligible && ['challengeAction', 'challengeBlock'].includes(a.stage) && <><Text style={ui.body}>En contestant, vous risquez une influence. Le bluff fait partie du jeu.</Text><View style={ui.row}><ActionButton label="J’accepte" variant="success" onPress={e.pass} disabled={unavailable} /><ActionButton label="Mettre en doute" variant="danger" onPress={() => { setReactionOpen(false); setConfirmChallenge(a.id); }} disabled={unavailable} /></View></>}
            {eligible && a.stage === 'blockWindow' && <View style={ui.row}><ActionButton label="Laisser passer" variant="ghost" onPress={e.pass} disabled={unavailable} />{blockRoles(a.type, r.variant).map(role => <ActionButton key={role} label={`Contrer · ${role}`} variant="purple" onPress={() => e.block(role)} disabled={unavailable} />)}</View>}
            {!eligible && a.stage !== 'awaitingReveal' && <Text style={{ color: C.gold, fontSize: 12 }}>{a.respondedIds.includes(e.myId || '') ? 'Votre réponse est enregistrée.' : `En attente ${a.awaitingId ? `de ${r.players.find(p => p.id === a.awaitingId)?.username}` : 'des autres joueurs'}…`}</Text>}
          </View> : null;

  return <SafeAreaView style={ui.page}><Atmosphere/><ScrollView contentContainerStyle={[ui.container, { padding: wide ? 28 : 16 }]}>
    <Header connected={e.connected} onRules={() => setRules(true)} right={<ActionButton label="Quitter" variant="ghost" small onPress={() => setLeaving(true)} />} />
    {!!e.error && <Notice danger text={e.error} onClose={e.clearError} />}
    {!e.connected && <Notice danger text="Connexion perdue. Votre place et vos cartes sont conservées pendant la reconnexion." />}
    {r.paused && <View style={ui.panel}><Notice text="Partie en pause : un joueur se reconnecte. Les cartes et le tour sont conservés." />{r.players.filter(p => !p.connected && (p.alive || r.phase === 'drafting')).map(p => <View key={p.id} style={ui.row}><Text style={[ui.body, { flex: 1 }]}>{p.username} est hors ligne.</Text>{host && <ActionButton label={`Retirer ${p.username}`} variant="danger" small onPress={() => setRemoveId(p.id)} />}</View>)}</View>}

    {r.phase === 'finished' ? <>
      <View style={[ui.panel, { alignItems: 'center', paddingVertical: 36 }]}><RoleIcon role="Duchesse" size={60}/><Text style={ui.eyebrow}>FIN DE LA MANCHE {r.round}</Text><Text style={[ui.title, { fontSize: 38, textAlign: 'center' }]}>{r.winnerId === e.myId ? 'La victoire est à vous.' : `${r.players.find(p => p.id === r.winnerId)?.username || 'Personne'} remporte la partie.`}</Text><Text style={[ui.body, { textAlign: 'center' }]}>Les alliances passent. La réputation reste.</Text>
        {host ? <ActionButton label="Préparer la revanche  →" onPress={e.rematch} loading={e.busy} disabled={!e.connected} /> : <Text style={ui.body}>L’hôte peut proposer une revanche dans cette salle.</Text>}
      </View><View style={{ gap: 10 }}><Text style={ui.eyebrow}>CLASSEMENT DE LA MANCHE</Text>{[...r.players].sort((p, q) => (p.id === r.winnerId ? -1 : q.id === r.winnerId ? 1 : (q.eliminatedAt || 0) - (p.eliminatedAt || 0))).map((p, i) => <View key={p.id} style={[ui.panel, { flexDirection: 'row', alignItems: 'center', padding: 16 }]}><Text style={{ color: C.gold, fontFamily: serif, fontSize: 25, width: 32 }}>{i + 1}</Text><Text style={[ui.label, { flex: 1 }]}>{p.username}</Text><Text style={{ color: C.muted, fontSize: 12 }}>{p.wins} victoire{p.wins > 1 ? 's' : ''}</Text></View>)}</View>{history}
    </> : r.phase === 'drafting' ? <>
      <View style={{ gap: 8 }}><Text style={ui.eyebrow}>DUEL · PRÉPARATION SECRÈTE</Text><Text style={ui.title}>Choisissez votre seconde influence.</Text><Text style={ui.body}>Vous avez reçu une carte au hasard. Complétez votre main avec le personnage de votre choix.</Text></View>
      {privateCards}
      {e.draftRoles.length ? <View style={[ui.panel, { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }]}>{e.draftRoles.map(role => <Pressable accessibilityRole="button" accessibilityLabel={`Choisir ${role}`} disabled={unavailable} key={role} onPress={() => e.draftRole(role)} style={{ gap: 10, alignItems: 'center', padding: 7, opacity: unavailable ? 0.4 : 1 }}><Card role={role} width={100} height={148} /><Text style={{ color: ROLES[role].color, fontSize: 12 }}>{role}</Text></Pressable>)}</View> : <Notice text="Votre choix est enregistré. En attente de votre adversaire…" />}
      <Text style={ui.body}>Premier joueur : {active?.username} · 1 pièce. L’autre joueur commence avec 2 pièces.</Text>
    </> : <>
      <View style={ui.row}><View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%', gap: 6 }}><Text style={ui.eyebrow}>TABLE {r.code} · MANCHE {r.round}</Text><Text style={[ui.title, { fontSize: wide ? 40 : 32 }]}>{a ? 'Les intentions se dévoilent.' : myTurn ? 'À vous de jouer.' : `Au tour de ${active?.username}.`}</Text></View><Text style={ui.badge}>Tour {r.turn}</Text><Text style={ui.badge}>{r.players.filter(p => p.alive).length} survivants</Text><Text style={ui.badge}>{r.deckCount} cartes à la Cour</Text></View>
      {!me?.alive && <Notice text="Vous êtes éliminé·e. Suivez la suite de la partie et le journal en attendant la revanche." />}
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 24 }}>
        <View style={{ flex: 2.1, gap: 22 }}>
          <TableBoard room={r} myId={e.myId} onPlayerPress={setPlayerId}/><Text style={{ color: C.muted, fontSize: 11, textAlign: 'center' }}>Touchez un joueur pour voir ses cartes révélées.</Text>

          {a ? pendingPanel : !myTurn ? <Notice text={`${active?.username} choisit son action. Vous pourrez réagir aux annonces de personnages.`} /> : null}
          {!wide && history}
        </View>
        {wide && <View style={{ flex: 1, gap: 20 }}>{privateCards}{history}<View style={ui.panel}><Text style={ui.eyebrow}>LE CONSEIL DU QUART</Text><Text style={ui.body}>{a?.type === 'assassinate' ? 'Contester un Assassin peut coûter deux influences : le défi perdu, puis l’assassinat.' : 'Gardez un œil sur les pièces adverses. À 7, une influence peut tomber. À 10, l’assassinat devient obligatoire.'}</Text><ActionButton label="Consulter les rôles" variant="ghost" small onPress={() => setRules(true)} /></View></View>}
      </View>
    </>}

    <Sheet visible={reactionOpen && eligible && !!a} title="Votre réponse" onClose={() => setReactionOpen(false)}>{pendingPanel}</Sheet>
    <PlayerDetails player={!e.mustReveal && !e.exchangeOptions && !e.inspection ? r.players.find(p => p.id === playerId) : undefined} onClose={() => setPlayerId(null)}/>
    <Sheet visible={handOpen && !wide && !e.mustReveal && !e.exchangeOptions && !e.inspection} title="Votre main" onClose={() => setHandOpen(false)}>{privateCards}</Sheet>
    <Sheet visible={actionsOpen && myTurn && !a} title="À vous de choisir." subtitle={forced ? 'À 10 pièces, l’attaque à 7 pièces est obligatoire.' : 'Choisissez votre objectif. Vous pourrez ensuite préciser votre action.'} onClose={() => setActionsOpen(false)}>
      <View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={ui.eyebrow}>VOTRE TRÉSOR</Text><Coins amount={me?.coins || 0}/></View>
      {!forced && <View style={{ flexDirection: 'row', gap: 7 }}>{['Pièces', 'Attaque', 'Main & enquête'].map((label, i) => <Pressable key={label} accessibilityRole="tab" accessibilityState={{ selected: actionGroup === i }} onPress={() => setActionGroup(i)} style={{ flex: 1, minHeight: 44, padding: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: actionGroup === i ? C.gold : C.raised }}><Text style={{ color: actionGroup === i ? C.bg : C.text, fontSize: 11 }}>{label}</Text></Pressable>)}</View>}
      {([
        ['Gagner des pièces', ['income', 'foreign_aid', 'duchess', 'steal']],
        ['Attaquer un adversaire', ['assassinate', 'coup']],
        ['Changer sa main ou enquêter', ['exchange', 'inspect']],
      ] as [string, ActionType[]][]).map(([label, types], group) => {
        if (!forced && group !== actionGroup) return null;
        const visible = types.filter(type => (type !== 'inspect' || r.variant === 'Inquisiteur') && (!forced || type === 'coup'));
        return visible.length > 0 && <View key={label} style={{ gap: 10 }}><Text style={ui.label}>{label}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{visible.map(type => {
          const cost = type === 'coup' ? 7 : type === 'assassinate' ? 3 : 0;
          return <ActionTile key={type} type={type} variant={r.variant} wide={false} disabled={unavailable || (me?.coins || 0) < cost} onPress={() => { setActionsOpen(false); if(type === 'income') e.act(type); else { setChoice(type); setTarget(''); setTargetRole(null); } }}/>;
        })}</View></View>;
      })}
    </Sheet>
    <Sheet visible={!!choice && myTurn} title={choice ? actionInfo[choice].name : ''} subtitle={choice ? `${actionInfo[choice].detail}${actionInfo[choice].role ? ' Votre annonce peut être contestée.' : ''}` : ''} onClose={() => setChoice(null)}>
      {needsTarget && <View style={{ gap: 10 }}><Text style={ui.label}>Choisissez votre cible</Text>{r.players.filter(p => p.id !== e.myId && p.alive).map(p => <Pressable accessibilityRole="radio" accessibilityLabel={`Cibler ${p.username}`} accessibilityState={{ selected: target === p.id }} key={p.id} onPress={() => setTarget(p.id)} style={{ padding: 16, borderRadius: 10, borderWidth: 1, borderColor: target === p.id ? C.gold : C.line, backgroundColor: target === p.id ? C.raised : C.bg, flexDirection: 'row', gap: 10 }}><Text style={[ui.label, { flex: 1 }]}>{target === p.id ? '◉' : '○'} {p.username}</Text><Text style={{ color: C.gold, fontSize: 12 }}>{p.coins} ◉ · {p.influenceCount} influences</Text></Pressable>)}</View>}
      {needsRole && <View style={{ gap: 12 }}><Text style={ui.label}>Quel rôle pensez-vous qu’il cache ?</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{tableRoles(r.variant).map(role => <Pressable accessibilityRole="radio" accessibilityLabel={`Viser ${role}`} accessibilityState={{ checked: targetRole === role }} onPress={() => setTargetRole(role)} key={role} style={{ flexBasis: '45%', flexGrow: 1, padding: 14, borderWidth: 1, borderColor: targetRole === role ? C.gold : C.line, backgroundColor: targetRole === role ? C.raised : C.bg, borderRadius: 10, gap: 5 }}><RoleIcon role={role} size={24}/><Text style={{ color: C.text, fontSize: 13 }}>{targetRole === role ? '◉ ' : '○ '}{role}</Text></Pressable>)}</View></View>}
      {needsRole && <Notice text={`Coût : ${choice === 'coup' ? '7' : '3'} pièces. Si le rôle visé est absent ou déjà révélé, vous perdez vos pièces sans éliminer de carte.${choice === 'assassinate' ? ' La Comtesse peut contrer ; un bluff d’Assassin démasqué ne coûte pas les 3 pièces.' : ' Aucun contre possible.'}`} />}
      {needsRole && !!target && !!targetRole && <Text style={[ui.label, { color: C.gold }]}>Vous visez {targetRole} chez {r.players.find(p => p.id === target)?.username}.</Text>}
      <ActionButton label={needsRole ? 'Confirmer l’attaque' : 'Confirmer l’action'} disabled={unavailable || (!!needsTarget && !target) || (needsRole && !targetRole)} loading={e.busy} onPress={() => { if (choice) e.act(choice, target || undefined, needsRole ? targetRole || undefined : undefined); setChoice(null); }} />
    </Sheet>
    <Sheet visible={!!confirmChallenge && confirmChallenge === a?.id && eligible && ['challengeAction', 'challengeBlock'].includes(a?.stage || '')} title="Mettre cette parole en doute ?" subtitle="Si ce personnage est présent, vous perdez une influence. Sinon, le joueur qui bluffe en perd une." onClose={() => setConfirmChallenge(null)}><ActionButton label="Oui, je conteste" variant="danger" disabled={unavailable} onPress={() => { e.challenge(); setConfirmChallenge(null); }} /></Sheet>
    <Sheet visible={!!e.mustReveal && !r.paused} title={e.mustReveal?.targetRole ? `${e.mustReveal.targetRole} a été trouvé !` : 'Une influence doit tomber.'} subtitle={e.mustReveal ? revealReasons[e.mustReveal.reason] : ''}>
      <View style={{ flexDirection: 'row', gap: 18, justifyContent: 'center' }}>{e.myCards.map((c, i) => { const wrongRole = !!e.mustReveal?.targetRole && c.role !== e.mustReveal.targetRole; return !c.revealed && <Pressable accessibilityRole="button" accessibilityLabel={`Révéler ${c.role}`} accessibilityState={{ disabled: unavailable || wrongRole }} disabled={unavailable || wrongRole} key={i} onPress={() => e.reveal(i)} style={{ alignItems: 'center', gap: 10 }}><Card role={c.role} width={110} height={163} dimmed={wrongRole} /><Text style={{ color: wrongRole ? C.muted : C.red, fontSize: 12 }}>{wrongRole ? 'Ce rôle n’est pas visé' : `Révéler ${c.role}`}</Text></Pressable>; })}</View>
    </Sheet>
    <Sheet visible={!!e.exchangeOptions && !r.paused} title={`Gardez ${keep} influence${keep > 1 ? 's' : ''}.`} subtitle="Sélectionnez les cartes que vous souhaitez conserver. Les autres retournent à la Cour, qui est mélangée.">
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>{pool.map((c, i) => <Pressable accessibilityRole="checkbox" accessibilityLabel={`Garder ${c.role}, carte ${i + 1}`} accessibilityState={{ checked: selected.includes(i) }} disabled={unavailable} key={i} onPress={() => setSelected(s => s.includes(i) ? s.filter(n => n !== i) : s.length < keep ? [...s, i] : s)} style={{ padding: 6, borderRadius: 12, backgroundColor: selected.includes(i) ? '#355044' : 'transparent', gap: 7, alignItems: 'center' }}><Card role={c.role} width={96} height={142} glowing={selected.includes(i)} /><Text style={{ color: selected.includes(i) ? C.mint : C.muted, fontSize: 10 }}>{selected.includes(i) ? '✓ Sélectionnée' : i >= keep ? 'Piochée' : 'Votre main'}</Text></Pressable>)}</View>
      <ActionButton label={`Conserver ces cartes (${selected.length}/${keep})`} onPress={() => e.exchange(selected)} disabled={selected.length !== keep || unavailable} />
    </Sheet>
    <Sheet visible={a?.stage === 'inspectChoose' && a.targetId === e.myId && !r.paused} title="Montrez une carte à l’Inquisiteur." subtitle="Vous choisissez. Cette carte reste secrète pour tous les autres joueurs."><View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18 }}>{e.myCards.map((c, i) => !c.revealed && <Pressable accessibilityRole="button" accessibilityLabel={`Montrer ${c.role}`} disabled={unavailable} key={i} onPress={() => e.inspectChoose(i)}><Card role={c.role} width={110} height={163} /></Pressable>)}</View></Sheet>
    <Sheet visible={!!e.inspection && !r.paused} title={`La carte de ${e.inspection?.targetName || ''}`} subtitle="Gardez ce secret. Vous pouvez rendre cette carte ou imposer son remplacement.">{e.inspection && <View style={{ alignItems: 'center' }}><Card role={e.inspection.role} width={120} height={178} /></View>}<ActionButton label="Rendre la carte" variant="ghost" disabled={unavailable} onPress={() => e.inspectDecide(false)} /><ActionButton label="Faire remplacer la carte" disabled={unavailable} onPress={() => e.inspectDecide(true)} /></Sheet>
    <Sheet visible={leaving} title="Quitter la partie ?" subtitle={r.phase === 'finished' ? 'Vos victoires sont liées à votre place dans cette salle.' : 'Vous abandonnez cette manche. Vos influences seront révélées et vos pièces rendues au Trésor.'} onClose={() => setLeaving(false)}><ActionButton label="Quitter la table" variant="danger" onPress={e.leave} loading={e.busy} /></Sheet>
    <Sheet visible={!!removeId} title="Retirer ce joueur ?" subtitle="Ses influences seront perdues. Il ne pourra pas reprendre sa place dans cette manche." onClose={() => setRemoveId(null)}><ActionButton label="Retirer le joueur déconnecté" variant="danger" onPress={() => { if (removeId) e.removeDisconnected(removeId); setRemoveId(null); }} /></Sheet>
    <RulesSheet visible={rules} onClose={() => setRules(false)} variant={r.variant} />
  </ScrollView>
    {r.phase === 'playing' && <View style={{ backgroundColor: '#10251C', borderTopWidth: 1, borderColor: '#6B6346', paddingHorizontal: wide ? 28 : 14, paddingVertical: 12 }}>
      <View style={{ width: '100%', maxWidth: 1384, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {wide ? <View style={{ flex: 1, gap: 4 }}><Text style={ui.eyebrow}>{myTurn && !a ? 'À VOUS DE JOUER' : a ? 'ACTION EN COURS' : 'LA TABLE JOUE'}</Text><Text style={{ color: C.muted, fontSize: 11 }}>{myTurn && !a ? 'Choisissez votre prochaine action.' : 'Cliquez sur un joueur pour consulter ses cartes révélées.'}</Text></View> : <ActionButton label="Ma main" variant="ghost" onPress={() => setHandOpen(true)} disabled={!!e.mustReveal || !!e.exchangeOptions || !!e.inspection}/>}
        <Coins amount={me?.coins || 0}/>
        <ActionButton label={myTurn && !a ? forced ? 'Attaque obligatoire' : 'Jouer mon tour' : eligible ? 'Répondre' : a ? 'Action en cours' : 'En attente'} style={{ flex: wide ? undefined : 1 }} onPress={() => { if (eligible) setReactionOpen(true); else { setActionGroup(0); setActionsOpen(true); } }} disabled={unavailable || (!(myTurn && !a) && !eligible)}/>
      </View>
    </View>}
  </SafeAreaView>;
}

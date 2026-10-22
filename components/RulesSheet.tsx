import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Text from './Text';
import { ROLES, tableRoles } from '../game/cards';
import { C, ui } from '../game/theme';
import { Variant } from '../game/types';
import Card from './Card';
import { Sheet } from './GameUI';
export default function RulesSheet({ visible, onClose, variant = 'Ambassadeur' }: { visible: boolean; onClose: () => void; variant?: Variant }) {
  const [tab, setTab] = useState('Le tour');
  const sections: Record<string, [string, string][]> = {
    'Le tour': [
      ['Votre objectif', 'Soyez le dernier joueur à conserver au moins une influence cachée. Une influence révélée est perdue pour le reste de la manche.'],
      ['Une seule action à votre tour', 'Revenu : +1 pièce, sans contre. Aide étrangère : +2 pièces, contrable par la Duchesse. Ou annoncez le pouvoir d’un personnage, même si vous ne le possédez pas : le bluff est permis.'],
      ['Votre variante : deviner pour éliminer', 'Pour l’Assassin à 3 pièces comme pour l’assassinat à 7 pièces, choisissez un adversaire ET le rôle caché que vous visez. Exemple : « Je tue ton Assassin ». S’il possède ce rôle caché, il doit le révéler. Sinon, vous perdez vos pièces sans éliminer de carte. Un rôle déjà révélé ne compte pas.'],
      ['L’assassinat à 7 pièces', 'Payez 7 pièces et annoncez le rôle visé. L’action ne peut être contestée ni contrée, mais elle échoue si ce rôle est absent. À 10 pièces ou plus au début du tour, cette attaque devient obligatoire.'],
      ['Les cartes restent secrètes', 'Le montant des pièces et les influences perdues sont publics. Gardez les cartes de votre main à l’abri des regards. Le bouton Masquer permet de cacher votre main.'],
    ],
    'Le bluff': [
      ['Mettre en doute', 'Tout adversaire encore en jeu peut contester un rôle annoncé. Seul le premier à le faire déclenche le défi. Si vous acceptez, attendez l’étape suivante.'],
      ['Le personnage est bien présent', 'Le joueur le prouve, le mélange à la Cour et reçoit une nouvelle carte. Le contestataire perd une influence de son choix. L’action continue.'],
      ['Le joueur bluffait', 'Il perd une influence de son choix et son action échoue. Un Assassin démasqué ne paie pas les 3 pièces.'],
      ['Contrer une action', 'La Duchesse contre l’aide étrangère. La Comtesse contre l’Assassin. Le Capitaine et l’Ambassadeur ou l’Inquisiteur contrent le vol. Pour un vol ou un Assassin, seule la cible peut contrer. Un contre peut lui aussi être contesté.'],
      ['Attention à l’Assassin', 'Les 3 pièces sont dépensées si la Comtesse contre ou si le rôle visé est absent. Une contestation perdue peut être suivie d’une attaque réussie sur le rôle annoncé : vous pouvez perdre deux influences dans le même tour.'],
    ],
    'La table': [
      ['De 3 à 6 joueurs', 'Deux influences et deux pièces chacun. Le paquet contient trois exemplaires de chacun des cinq personnages.'],
      ['Duel à 2 joueurs', 'Chacun reçoit une carte au hasard puis choisit une seconde carte parmi les cinq rôles. La Cour contient trois cartes. Le premier joueur commence avec une seule pièce.'],
      ['À 7 ou 8 joueurs', 'Le paquet contient quatre exemplaires de chaque rôle : vingt cartes au total.'],
      ['Variante Inquisiteur', 'L’hôte peut remplacer l’Ambassadeur par l’Inquisiteur. Il échange avec une carte piochée, ou inspecte une carte choisie par un adversaire. Il décide de la rendre ou de la faire remplacer.'],
      ['La manche suivante', 'Le vainqueur commence la revanche. Les victoires restent affichées tant que vous conservez la même salle.'],
      ['Une déconnexion ?', 'La partie se met en pause. Reconnectez-vous pour retrouver votre place. Si le joueur ne revient pas, l’hôte peut le retirer : ses influences sont alors perdues.'],
    ],
  };
  return <Sheet visible={visible} title="Le carnet de bord" subtitle="Un doute ? Toutes les règles essentielles, à portée de main." onClose={onClose}>
    <View style={ui.row}>{['Le tour', 'Les rôles', 'Le bluff', 'La table'].map(t => <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === t }} onPress={() => setTab(t)} key={t} style={{ borderRadius: 8, padding: 12, backgroundColor: tab === t ? C.gold : C.raised }}><Text style={{ color: tab === t ? C.bg : C.muted, fontWeight: '600', fontSize: 12 }}>{t}</Text></Pressable>)}</View>
    {tab === 'Les rôles' ? tableRoles(variant).map(role => <View key={role} style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}><Card role={role} width={66} height={98} /><View style={{ flex: 1, gap: 5 }}><Text style={[ui.label, { color: ROLES[role].color, fontSize: 17 }]}>{role}</Text><Text style={ui.body}>{ROLES[role].desc}</Text><Text style={{ color: C.gold, fontSize: 12, lineHeight: 18 }}>{ROLES[role].blockDesc}</Text></View></View>) : sections[tab].map(([title, body]) => <View key={title} style={{ gap: 6 }}><Text style={ui.label}>{title}</Text><Text style={ui.body}>{body}</Text></View>)}
    <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16 }}>Base : Complots · Rikki Tahta · Ferti. Variante de cette table : les attaques à 3 et 7 pièces doivent deviner le rôle adverse. Illustrations originales de cette application.</Text>
  </Sheet>;
}

import React from 'react';
import { View } from 'react-native';
import { ROLES } from '../game/cards';
import { RoleName } from '../game/types';
import { ui } from '../game/theme';
import Card from './Card';
import Text from './Text';
export default function RoleHelp({ role }: { role: RoleName }) {
  const info = ROLES[role];
  return <View style={{ gap: 20 }}>
    <View style={{ alignItems: 'center' }}><Card role={role} width={120} height={180}/></View>
    <View style={{ gap: 7 }}><Text style={ui.eyebrow}>SON POUVOIR</Text><Text style={ui.body}>{info.desc}</Text></View>
    {!!info.blockDesc && <View style={{ gap: 7 }}><Text style={ui.eyebrow}>{role === 'Assassin' ? 'COMMENT LE CONTRER' : 'SES CONTRES'}</Text><Text style={ui.body}>{info.blockDesc}</Text></View>}
    {role === 'Assassin' && <Text style={ui.body}>Les 3 pièces sont perdues si le rôle visé est absent ou si la Comtesse contre. Si votre bluff d’Assassin est démasqué, vous ne payez pas les 3 pièces.</Text>}
    {role === 'Comtesse' && <Text style={ui.body}>La Comtesse protège contre l’Assassin : elle n’a pas d’action à effectuer pendant votre tour.</Text>}
    <View style={ui.divider}/><Text style={ui.body}>Le bluff est permis : vous pouvez annoncer un rôle sans le posséder. Votre annonce peut être contestée.</Text>
  </View>;
}


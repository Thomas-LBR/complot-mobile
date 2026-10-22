import { ActionType, RoleName, Variant } from './types';
export interface RoleInfo { bg: string; border: string; glow: string; symbol: string; color: string; desc: string; blockDesc?: string; subtitle: string }
export const ROLES: Record<RoleName, RoleInfo> = {
  Duchesse: { bg: '#302539', border: '#BFA1D3', glow: '#BFA1D3', color: '#D9C4E8', symbol: '♛', subtitle: 'LE POUVOIR', desc: 'Prenez 3 pièces au Trésor.', blockDesc: 'Contre l’aide étrangère.', },
  Assassin: { bg: '#3A2428', border: '#C7877D', glow: '#C7877D', color: '#EDB0A4', symbol: '†', subtitle: 'LA MENACE', desc: 'Payez 3 pièces et devinez un rôle caché adverse. Mauvaise cible : pièces perdues.', blockDesc: 'Peut être contré par la Comtesse.' },
  Capitaine: { bg: '#1E3546', border: '#7CA9C7', glow: '#7CA9C7', color: '#B0CFE3', symbol: '⚓', subtitle: 'LA CONVOITISE', desc: 'Prenez jusqu’à 2 pièces à un adversaire.', blockDesc: 'Contre le vol.' },
  Comtesse: { bg: '#3D3030', border: '#C7A080', glow: '#C7A080', color: '#E9C5A1', symbol: '♜', subtitle: 'LA PROTECTION', desc: 'Protégez-vous de l’Assassin en annonçant la Comtesse.', blockDesc: 'Contre l’Assassin, jamais l’assassinat à 7 pièces.' },
  Ambassadeur: { bg: '#203A35', border: '#82B6A3', glow: '#82B6A3', color: '#B3D9C7', symbol: '♧', subtitle: 'LE SECRET', desc: 'Piochez 2 cartes, puis gardez autant de cartes que d’influences cachées.', blockDesc: 'Contre le vol.' },
  Inquisiteur: { bg: '#2D3243', border: '#A8AFD0', glow: '#A8AFD0', color: '#CCD0E7', symbol: '◈', subtitle: 'LA VÉRITÉ', desc: 'Échangez avec 1 carte piochée, ou inspectez une carte adverse et faites-la remplacer ou rendez-la.', blockDesc: 'Remplace l’Ambassadeur et contre le vol.' },
};
export const ALL_ROLES: RoleName[] = ['Duchesse', 'Assassin', 'Capitaine', 'Comtesse', 'Ambassadeur'];
export const tableRoles = (variant: Variant): RoleName[] => [...ALL_ROLES.slice(0, 4), variant];
export const actionInfo: Record<ActionType, { name: string; detail: string; amount: string; role?: RoleName }> = {
  income: { name: 'Revenu', detail: 'Sûr. Aucun contre possible.', amount: '+1' },
  foreign_aid: { name: 'Aide étrangère', detail: 'La Duchesse peut vous contrer.', amount: '+2' },
  duchess: { name: 'Duchesse', detail: 'Annoncez ce rôle, avec ou sans la carte.', amount: '+3', role: 'Duchesse' },
  steal: { name: 'Vol', detail: 'Prenez jusqu’à 2 pièces à une cible.', amount: '+2', role: 'Capitaine' },
  assassinate: { name: 'Assassin', detail: 'Devinez le rôle caché à éliminer.', amount: '−3', role: 'Assassin' },
  coup: { name: 'Assassinat', detail: 'Visez un rôle. Sans contre, mais peut rater.', amount: '−7' },
  exchange: { name: 'Échange', detail: 'Renouvelez votre main avec la Cour.', amount: '↔', role: 'Ambassadeur' },
  inspect: { name: 'Inspection', detail: 'Regardez une carte choisie par la cible.', amount: '◈', role: 'Inquisiteur' },
};
export const blockRoles = (type: ActionType, variant: Variant): RoleName[] => type === 'foreign_aid' ? ['Duchesse'] : type === 'assassinate' ? ['Comtesse'] : type === 'steal' ? ['Capitaine', variant] : [];

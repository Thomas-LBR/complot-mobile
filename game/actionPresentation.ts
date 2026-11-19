import type { GameRoom, TableEvent } from './types';
export const ACTION_TITLES = { income: 'REVENU', foreign_aid: 'AIDE ÉTRANGÈRE', duchess: 'TAXE · DUCHESSE', steal: 'VOL · CAPITAINE', assassinate: 'ASSASSIN · 3 PIÈCES', coup: 'ATTAQUE · 7 PIÈCES', exchange: 'ÉCHANGE', inspect: 'INSPECTION' };
export function describeEvent(e: TableEvent, room: GameRoom) {
  const name = (id?: string) => room.players.find(p => p.id === id)?.username || 'Un joueur';
  const actor = name(e.actorId), target = name(e.targetId);
  switch (e.kind) {
    case 'challenge': return `${actor} accuse ${target} de bluffer`;
    case 'verdict': return e.outcome === 'success' ? `${target} bluffait : ${actor} avait raison` : `${target} a prouvé son rôle : ${actor} perd la contestation`;
    case 'block': return e.outcome === 'broken' ? `Le blocage de ${target} est démasqué` : e.outcome === 'confirmed' ? `${target} bloque l’action de ${actor}` : `${target} annonce un blocage contre ${actor}`;
    case 'coins': return e.fromId ? `${actor} prend ${e.amount} pièce(s) à ${name(e.fromId)}` : (e.amount || 0) < 0 ? `${actor} paie ${Math.abs(e.amount || 0)} pièces` : `${actor} reçoit ${e.amount} pièce(s)`;
    case 'attack': return e.outcome === 'hit' ? `${actor} touche ${target} : une influence doit tomber` : `${actor} rate ${target} : rôle absent, pièces perdues`;
    case 'cards': return e.outcome === 'return' ? `${actor} rend ses cartes à la Cour` : e.outcome === 'replace' ? `${actor} remplace une carte en secret` : `${actor} reçoit des cartes en secret`;
    case 'reveal': return `${target} révèle ${e.role} et perd cette influence`;
    case 'eliminate': return `${target} est éliminé de la manche`;
    case 'turn': return `Au tour de ${actor}`;
    case 'inspect': return `${actor} inspecte une carte de ${target}`;
    default: return `${actor} annonce ${e.action ? ACTION_TITLES[e.action].toLowerCase() : 'son action'}${e.targetId ? ' contre ' + target : ''}`;
  }
}
export function describePending(room: GameRoom, myId: string | null) {
  const a = room.pendingAction;
  if (!a) return null;
  const name = (id: string | null) => room.players.find(p => p.id === id)?.username || 'Un joueur';
  const actor = name(a.actorId), target = name(a.targetId);
  const action = `${actor}${a.targetId ? ' → ' + target : ''} · ${ACTION_TITLES[a.type]}${a.targetRole ? ' · ' + a.targetRole + ' visé' : ''}`;
  const eligible = a.eligibleIds.includes(myId || '') && !a.respondedIds.includes(myId || '');
  const responders = a.eligibleIds.filter(id => !a.respondedIds.includes(id)).map(id => name(id)).join(', ');
  if (room.paused) return { title: action, instruction: 'Partie en pause : un joueur se reconnecte.', tag: 'PAUSE' };
  switch (a.stage) {
    case 'challengeAction': return { title: action, instruction: eligible ? 'À VOUS : acceptez ou accusez ce joueur de bluffer.' : `Annonce en attente de ${responders || 'validation'}.`, tag: 'ANNONCE' };
    case 'challengeBlock': return { title: `${name(a.blockedBy)} bloque ${actor} avec ${a.blockRole}`, instruction: eligible ? 'À VOUS : acceptez ou contestez ce blocage.' : `Blocage en attente de ${responders || 'validation'}.`, tag: 'BLOCAGE' };
    case 'blockWindow': return { title: action, instruction: eligible ? 'À VOUS : bloquez cette action ou laissez passer.' : `En attente d’un éventuel blocage${responders ? ' de ' + responders : ''}.`, tag: 'DÉFENSE' };
    case 'awaitingReveal': return { title: `${name(a.awaitingId)} doit révéler une influence`, instruction: a.awaitingId === myId ? 'À VOUS : choisissez la carte à perdre.' : 'La partie attend sa carte révélée.', tag: 'PERTE D’INFLUENCE' };
    case 'exchange': return { title: `${actor} choisit ses cartes en secret`, instruction: a.actorId === myId ? 'À VOUS : conservez vos influences.' : 'Les cartes non conservées retourneront à la Cour.', tag: 'ÉCHANGE' };
    case 'inspectChoose': return { title: `${actor} inspecte ${target}`, instruction: a.targetId === myId ? 'À VOUS : choisissez une carte à montrer.' : `${target} choisit la carte à montrer en privé.`, tag: 'INSPECTION' };
    case 'inspectDecision': return { title: `${actor} examine la carte de ${target}`, instruction: a.actorId === myId ? 'À VOUS : rendez la carte ou faites-la remplacer.' : `${actor} décide de rendre ou remplacer la carte.`, tag: 'INSPECTION' };
  }
}

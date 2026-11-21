export type BangVisual = { id: number; at: number; kind: string; actorId?: string | null; targetId?: string | null; cardType?: string | null; count: number };

/** A snapshot is a replayable public feed. Baseline on entry/reconnect, never replay old actions. */
export class BangVisualQueue {
  game: string | null = null;
  last = 0;
  pending: BangVisual[] = [];
  ingest(game: string, events: BangVisual[], fresh = false, now = Date.now()) {
    const newest = events.at(-1)?.id || 0;
    if (fresh || this.game === null || (this.game !== game && this.game !== 'lobby')) {
      this.game = game; this.last = newest; this.pending = []; return;
    }
    if (this.game !== game) { this.game = game; this.last = 0; this.pending = []; }
    this.pending.push(...events.filter(e => e.id > this.last && now - e.at < 12000));
    this.last = Math.max(this.last, newest);
    // Avoid a long backlog during initial dealing or a burst of automatic consequences.
    this.pending = this.pending.slice(-18);
  }
  next(now = Date.now()) { this.pending = this.pending.filter(e => now - e.at < 12000); return this.pending.shift(); }
}

export function visualPresentation(e: BangVisual) {
  const kind = e.kind;
  const colors = { red: '#C74D36', blue: '#389BA3', gold: '#E7B346', green: '#58A874' };
  const labels: Record<string, string> = { attack: e.cardType === 'indians' ? 'INDIENS !' : e.cardType === 'gatling' ? 'GATLING !' : e.cardType === 'duel' ? 'DUEL !' : 'BANG !', damage: `−${e.count} VIE${e.count > 1 ? 'S' : ''}`, defense: 'DÉFENSE !', check: e.count ? 'DÉGAINE RÉUSSI' : 'ÉCHEC DU DÉGAINE', explosion: 'BOUM !', victory: 'FIN DE PARTIE', draw: `+${e.count} CARTE${e.count > 1 ? 'S' : ''}`, return: 'CARTE REMISE', discard: 'DÉFAUSSE', prison: 'EN PRISON', escape: 'LIBÉRÉ !', heal: `+${e.count} VIE`, turn: 'À TOI DE JOUER', elimination: 'ÉLIMINÉ', steal: 'CARTE VOLÉE', transfer: 'DYNAMITE !', equip: 'ÉQUIPEMENT', play: 'CARTE JOUÉE' };
  const cardLabels: Record<string, string> = { indians: 'INDIENS !', gatling: 'GATLING !', market: 'MAGASIN', saloon: 'SALOON', stagecoach: 'CONVOI', wells: 'DILIGENCE', panic: 'BRAQUAGE !', cat: 'COUP DE FOUDRE', beer: 'BIÈRE', dynamite: 'DYNAMITE', jail: 'PRISON' };
  return { label: kind === 'play' ? cardLabels[e.cardType || ''] || labels.play : labels[kind] || 'ACTION', color: (['attack', 'damage', 'elimination', 'explosion'].includes(kind) || (kind === 'check' && !e.count)) ? colors.red : ['defense', 'prison', 'escape'].includes(kind) ? colors.blue : kind === 'heal' ? colors.green : colors.gold };
}

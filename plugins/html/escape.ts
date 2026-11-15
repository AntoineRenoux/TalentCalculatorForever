/** Échappement HTML pour les valeurs insérées dans les gabarits. */
const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c);
}

/** Attributs HTML à partir d'un objet (les valeurs vides ou fausses sont omises). */
export function attrs(map: Record<string, string | number | boolean | undefined>): string {
  return Object.entries(map)
    .filter(([, v]) => v !== undefined && v !== false && v !== '')
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${escapeHtml(v)}"`))
    .join('');
}

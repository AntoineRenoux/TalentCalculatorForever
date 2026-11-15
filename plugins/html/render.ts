/**
 * Moteur de gabarits minimal, exécuté à la compilation :
 *   {{t clé param=valeur}}   texte traduit, échappé
 *   {{h clé}}                texte traduit contenant du HTML de confiance (gras, code, liens)
 *   {{cfg chemin.config}}    valeur de configuration, échappée
 *   {{> partiel arg nom=val}} HTML produit par un partiel (plugins/partials)
 */
import { siteConfig } from '../../config/site.config.ts';
import { tDynamic, type Params } from '../../src/shared/i18n.ts';
import { escapeHtml } from './escape.ts';
import type { PartialRegistry } from './types.ts';

const MARKER = /\{\{\s*(>|t|h|cfg)\s+([^}]+?)\s*\}\}/g;
const TOKEN = /(\w[\w-]*)=("[^"]*"|\S+)|("[^"]*"|\S+)/g;

function parseArgs(raw: string): { named: Record<string, string>; positional: string[] } {
  const named: Record<string, string> = {};
  const positional: string[] = [];
  for (const m of raw.matchAll(TOKEN)) {
    const unquote = (s: string) => s.replace(/^"|"$/g, '');
    if (m[1]) named[m[1]] = unquote(m[2] ?? '');
    else if (m[3]) positional.push(unquote(m[3]));
  }
  return { named, positional };
}

export function configValue(path: string): unknown {
  const value = path.split('.').reduce<unknown>((node, k) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[k] : undefined), siteConfig);
  if (value === undefined) throw new Error(`gabarit : config inconnue « ${path} »`);
  return value;
}

export function renderTemplate(html: string, partials: PartialRegistry): string {
  return html.replace(MARKER, (_all, kind: string, raw: string) => {
    const { named, positional } = parseArgs(raw);
    const [head, ...rest] = positional;
    if (!head) throw new Error(`gabarit : marqueur vide « {{${kind} ${raw}}} »`);
    switch (kind) {
      case 't': return escapeHtml(tDynamic(head, named as Params));
      case 'h': return tDynamic(head, named as Params);
      case 'cfg': return escapeHtml(configValue(head));
      default: {
        const partial = partials[head];
        if (!partial) throw new Error(`gabarit : partiel inconnu « ${head} »`);
        return partial({ named, positional: rest });
      }
    }
  });
}

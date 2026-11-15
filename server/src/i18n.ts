/**
 * Textes du serveur : t('clé.pointée', { param }) renvoie le message de server/src/locales.
 * Interpolation : « HTTP {status} » + { status: 502 }.
 */
import { messages } from './locales/fr.ts';

export type Messages = typeof messages;

/** Toutes les clés pointées qui mènent à un texte (ex. « http.unknownRoute »). */
type KeyPaths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends object ? KeyPaths<T[K], `${P}${K}.`> : never;
}[keyof T & string];

export type MessageKey = KeyPaths<Messages>;
export type Params = Record<string, string | number>;

const PLACEHOLDER = /\{(\w+)\}/g;

function lookup(key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), messages);
}

export function t(key: MessageKey, params: Params = {}): string {
  return tDynamic(key, params);
}

/** Variante pour une clé construite à l'exécution (vérifiée seulement à l'exécution). */
export function tDynamic(key: string, params: Params = {}): string {
  const value = lookup(key);
  if (typeof value !== 'string') throw new Error(`i18n: clé manquante « ${key} »`);
  return value.replace(PLACEHOLDER, (all, name: string) => (name in params ? String(params[name]) : all));
}

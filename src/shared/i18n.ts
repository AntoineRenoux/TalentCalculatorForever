/**
 * Traductions : t('clé.pointée', { param }) renvoie le texte de la langue du site.
 * Utilisable côté navigateur et dans le plugin de compilation (aucune dépendance au DOM).
 *
 * - Interpolation : « Niveau {level} » + { level: 12 }.
 * - Pluriel : une valeur { one, other } est choisie selon params.count (règles Intl de la langue).
 */
import { siteConfig } from '../../config/site.config.ts';
import { messages } from '../locales/index.ts';

export type Messages = typeof messages;
type Leaf = string | PluralForms;
interface PluralForms { one: string; other: string; zero?: string }

/** Toutes les clés pointées qui mènent à un texte (ex. « nav.home »). */
type KeyPaths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends Leaf
    ? `${P}${K}`
    : T[K] extends object ? KeyPaths<T[K], `${P}${K}.`> : never;
}[keyof T & string];

export type MessageKey = KeyPaths<Messages>;
export type Params = Record<string, string | number>;

const PLACEHOLDER = /\{(\w+)\}/g;
const pluralRules = new Intl.PluralRules(siteConfig.lang);

function lookup(key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), messages);
}

function isPlural(v: unknown): v is PluralForms {
  return !!v && typeof v === 'object' && 'one' in v && 'other' in v;
}

export function t(key: MessageKey, params: Params = {}): string {
  return tDynamic(key, params);
}

/** Variante pour une clé construite à l'exécution (vérifiée seulement à l'exécution). */
export function tDynamic(key: string, params: Params = {}): string {
  let value = lookup(key);
  if (isPlural(value)) {
    const count = Number(params.count ?? 0);
    const form = count === 0 && value.zero !== undefined ? 'zero' : pluralRules.select(count);
    value = form in value ? value[form as keyof PluralForms] : value.other;
  }
  if (typeof value !== 'string') throw new Error(`i18n: clé manquante « ${key} »`);
  return value.replace(PLACEHOLDER, (all, name: string) => (name in params ? String(params[name]) : all));
}

/** Indique si une clé existe (utile pour des contenus optionnels). */
export function hasKey(key: string): boolean {
  return lookup(key) !== undefined;
}

/** Formate un nombre selon la langue du site. */
export function formatNumber(n: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(siteConfig.lang, options).format(n);
}

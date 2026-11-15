/** Appels à l'API de l'armurerie (serveur du site, voir server/). */
import { siteConfig } from '../../../config/site.config.ts';
import { armoryConfig } from '../../../config/armory.config.ts';
import { t } from '../../shared/i18n.ts';

export interface Member {
  slug: string; name: string; surname: string; level: number;
  classId: number; classKey: string | null; raceId: number; rank: number; avatar?: string | null;
}
export interface Guild { name: string; faction?: string; ruleset?: string; memberCount: number; members: Member[] }
export interface ItemLine { text: string; cls?: string }
export interface Item { slot: string; slotName?: string; id: number; name: string; quality: string; icon: string | null; lines: ItemLine[] }
export interface Character {
  slug: string; name: string; surname: string; level: number; race?: string; raceId: number;
  className?: string; classKey: string; rank: number; guild: string; avatar: string | null; render: string | null;
  items: Item[]; talentGroups: { active: boolean; talents: [number, number][] }[];
  stats: Record<string, number | string | null> | null;
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${siteConfig.api.base}/${path}`);
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? t('armory.errors.http', { status: response.status }));
  return body as T;
}

let guildPromise: Promise<Guild> | null = null;

/** Liste de la guilde (chargée une seule fois par page). */
export function loadGuild(): Promise<Guild> {
  guildPromise ??= get<Guild>(armoryConfig.api.guild).catch((e: unknown) => { guildPromise = null; throw e; });
  return guildPromise;
}

export const loadCharacter = (slug: string): Promise<Character> =>
  get<Character>(`${armoryConfig.api.character}/${encodeURIComponent(slug)}`);

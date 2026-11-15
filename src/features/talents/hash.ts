/**
 * Liens partagés : #<classe>/<rangs arbre 1>-<arbre 2>-<arbre 3>/r<race>
 * Chaque arbre est la suite des rangs de ses talents (ordre des données), zéros finaux retirés.
 */
import { talentsConfig } from '../../../config/talents.config.ts';
import type { ClassData } from '../../data/index.ts';

const { segmentSeparator, treeSeparator, racePrefix } = talentsConfig.hash;
const TRAILING_ZEROS = /0+$/;
const RACE_SEGMENT = new RegExp(`^${racePrefix}(\\d+)$`);

/** Encode les rangs (fonction rang(talent) fournie) d'une classe. */
export function encodeBuild(cls: ClassData, rank: (talentId: number) => number, race: number | null): string {
  const trees = cls.trees.map((tr) => tr.talents.map((t) => rank(t.id)).join('').replace(TRAILING_ZEROS, ''));
  while (trees.length && !trees[trees.length - 1]) trees.pop();
  const parts: string[] = [cls.key];
  if (trees.length) parts.push(trees.join(treeSeparator));
  if (race !== null) parts.push(`${racePrefix}${race}`);
  return `#${parts.join(segmentSeparator)}`;
}

export interface ParsedHash { classKey: string; trees: number[][]; race: number | null }

/** Décode un hash ; les rangs sont ensuite rejoués avec les règles du jeu. */
export function parseBuild(hash: string): ParsedHash {
  const [classKey = '', ...rest] = hash.replace(/^#/, '').split(segmentSeparator);
  let race: number | null = null;
  let build = '';
  for (const seg of rest) {
    const m = RACE_SEGMENT.exec(seg);
    if (m?.[1]) race = Number(m[1]);
    else if (!build) build = seg;
  }
  const trees = build ? build.split(treeSeparator).map((s) => [...s].map((ch) => Number(ch) || 0)) : [];
  return { classKey, trees, race };
}

/** Expression qui reconnaît un lien de build (utilisée par la redirection des anciens liens). */
export function buildHashPattern(classKeys: string[], extra: string[] = []): RegExp {
  return new RegExp(`^#(${[...classKeys, ...extra].join('|')})\\b`);
}

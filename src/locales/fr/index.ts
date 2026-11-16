/** Textes français, regroupés par zone du site (un fichier par zone). */
import { common } from './common.ts';
import { home } from './home.ts';
import { recruitment } from './recruitment.ts';
import { boss } from './boss.ts';
import { addon } from './addon.ts';
import { talents } from './talents.ts';
import { leveling } from './leveling.ts';

export const fr = {
  ...common,
  home,
  recruitment,
  boss,
  addon,
  talents,
  leveling,
} as const;

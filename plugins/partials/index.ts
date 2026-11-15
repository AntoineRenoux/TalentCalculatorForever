/** Registre de tous les partiels disponibles dans les gabarits ({{> nom ...}}). */
import type { PartialRegistry } from '../html/types.ts';
import { commonPartials } from './common.ts';
import { guildPartials } from './guild.ts';
import { addonPartials } from './addon.ts';
import { talentsPartials } from './talents.ts';

export const partials: PartialRegistry = {
  ...commonPartials,
  ...guildPartials,
  ...addonPartials,
  ...talentsPartials,
};

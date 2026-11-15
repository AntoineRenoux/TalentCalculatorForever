/** Progression par niveau, grimoire et traits raciaux. */
import type { ChangeKind } from '../src/data/index.ts';

export const levelingConfig = {
  /** Badge affiché pour chaque type de changement Forever : clé de texte + classe CSS. */
  changes: {
    introduced: { labelKey: 'leveling.changes.introduced', className: 'new' },
    nowTrainable: { labelKey: 'leveling.changes.nowTrainable', className: 'train' },
    changedLevels: { labelKey: 'leveling.changes.changedLevels', className: 'moved' },
  } satisfies Record<ChangeKind, { labelKey: string; className: string }>,

  /** Filtres cochés à l'ouverture. */
  defaults: { foreverOnly: false, untilLevel: false, allRanks: false },
} as const;

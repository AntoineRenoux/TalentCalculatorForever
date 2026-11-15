/** Textes de la progression par niveau, du grimoire et des traits raciaux. */
export const leveling = {
  racials: {
    title: 'Traits raciaux',
    raceAria: 'Race',
  },
  timeline: {
    title: 'Progression par niveau',
    schoolsAria: 'Écoles',
    foreverOnly: 'Nouveautés Forever uniquement',
    untilLevel: "Jusqu'à mon niveau",
    searchPlaceholder: 'Rechercher un sort',
    levelShort: 'Niv.',
    noMatch: 'Aucun sort ne correspond aux filtres.',
    talentPointBadge: '+1',
    talentPointFree: 'Point de talent disponible',
    talentPointRank: 'Rang {rank}/{max} · {tree}',
    talentTag: 'Talent',
  },
  book: {
    title: 'Grimoire au niveau {level}',
    titlePrefix: 'Grimoire au niveau',
    tabsAria: 'Écoles du grimoire',
    all: 'Toutes',
    allRanks: 'Afficher tous les rangs',
    spellCount: { one: '{count} sort', other: '{count} sorts' },
    level: 'Niveau {level}',
    rankAndLevel: '{rank} · Niveau {level}',
    empty: 'Aucun sort connu à ce niveau.',
  },
  tooltip: {
    schoolAndLevel: '{school} · Niveau {level}',
  },
  changes: {
    introduced: 'Nouveau (Forever)',
    nowTrainable: 'Désormais chez le maître',
    changedLevels: 'Niveau modifié (Forever)',
  },
} as const;

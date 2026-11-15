/** Réglages de la page d'accueil. Les textes sont dans src/locales/fr/home.ts. */
export const homeConfig = {
  /** Lignes de la fiche de la guilde, dans l'ordre (textes : home.sheet.rows.<id>.term / .value). */
  sheetRows: ['faction', 'server', 'raidDays', 'hours', 'voice'],

  /** Champs de la « semaine chez nous », dans l'ordre (textes : home.week.fields.<id>). */
  weekFields: ['before', 'tuesday', 'between', 'sunday'],

  /** Marqueur des emplacements d'avatar dans la phrase d'accroche (home.statement). */
  statementSlot: '{slot}',

  /** Ancre de la section du roster (bouton du héros). */
  rosterAnchor: 'roster',

  /** Bande de membres (recrutement, boss) : nombre de personnages montrés, du plus haut niveau au plus bas. */
  strip: { count: 6 },

  roster: {
    /** L'API donne l'avatar ; le rendu en pied a la même adresse avec un autre suffixe. */
    avatarSuffix: '-avatar.jpg',
    renderSuffix: '-main-raw.png',
    /** Membres mis en avant au premier affichage de l'aperçu (rang le plus haut d'abord). */
    previewIndex: 0,
  },
} as const;

export type HomeConfig = typeof homeConfig;

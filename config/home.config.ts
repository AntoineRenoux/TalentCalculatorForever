/** Réglages de la page d'accueil. Les textes sont dans src/locales/fr/home.ts. */
export const homeConfig = {
  /** Lignes de la fiche de la guilde, dans l'ordre (textes : home.sheet.rows.<id>.term / .value). */
  sheetRows: ['faction', 'server', 'raidDays', 'hours', 'voice'],

  /** Bande de membres : nombre de personnages montrés, du plus haut niveau au plus bas. */
  strip: { count: 6 },

  roster: {
    /** L'API donne l'avatar ; le rendu en pied a la même adresse avec un autre suffixe. */
    avatarSuffix: '-avatar.jpg',
    renderSuffix: '-main-raw.png',
  },
} as const;

export type HomeConfig = typeof homeConfig;

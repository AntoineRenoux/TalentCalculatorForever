/** Réglages de la page d'accueil. Les textes sont dans src/locales/fr/home.ts. */
export const homeConfig = {
  /** Lignes de la fiche de la guilde, dans l'ordre (textes : home.sheet.rows.<id>.term / .value). */
  sheetRows: ['faction', 'server', 'raidDays', 'hours', 'voice'],
} as const;

export type HomeConfig = typeof homeConfig;

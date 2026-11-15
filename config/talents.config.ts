/**
 * Calculateur de talents : règles du jeu (WoW Forever / Classic+), icônes, géométrie de la grille,
 * format des liens partagés et délais d'interface.
 */
export const talentsConfig = {
  rules: {
    /** Niveau du premier point de talent. */
    minLevel: 10,
    maxLevel: 60,
    /** Points à investir dans un arbre pour débloquer chaque nouvelle rangée. */
    pointsPerRow: 5,
    rows: 7,
    columns: 4,
    /** Points gagnés par niveau à partir de minLevel. */
    pointsPerLevel: 1,
  },

  icons: {
    /** CDN des icônes du jeu : <base>/<taille>/<nom>.jpg */
    cdnBase: 'https://wow.zamimg.com/images/wow/icons',
    extension: '.jpg',
    sizes: { small: 'small', medium: 'medium', large: 'large' },
    classIconPrefix: 'classicon_',
    /** Icône affichée quand le jeu n'en fournit pas (valeur « temp » dans les données). */
    fallback: 'inv_misc_questionmark',
    placeholder: 'temp',
  },

  /** Géométrie des flèches de prérequis (en px, la grille lit --cell et --icon dans tokens/talents.css). */
  arrows: {
    thickness: 6,
    headGap: 10,
  },

  /** Les icônes et les flèches sont centrées dans leur case (moitié de la case). */
  geometry: { centerRatio: 0.5 },

  tooltip: {
    /** Écart entre l'élément survolé et l'infobulle, et marge minimale avec le bord de l'écran. */
    offset: 10,
    verticalNudge: 4,
    viewportMargin: 8,
    /** Sur écran tactile, l'infobulle se ferme seule après ce délai. */
    touchAutoHideMs: 3500,
  },

  toastMs: 2200,

  /** Liens partagés : #<classe>/<rangs-arbre1>-<arbre2>-<arbre3>/r<race> */
  hash: {
    segmentSeparator: '/',
    treeSeparator: '-',
    racePrefix: 'r',
    /** Ancre de l'armurerie (talents.html#armory). */
    armory: 'armory',
  },

  /** Clés CSS lues par le JS pour placer les talents. */
  cssVars: { cell: '--cell', icon: '--icon', classColor: '--c' },
} as const;

export type TalentsConfig = typeof talentsConfig;

/** Textes du calculateur de talents (page talents.html). */
export const talents = {
  hero: {
    title: 'Calculateur de talents',
    intro: 'Talents, sorts appris à chaque niveau, traits raciaux et armurerie des membres de la guilde.',
  },
  tabs: {
    ariaLabel: 'Sections de l’outil',
    calc: 'Calculateur',
    armory: 'Armurerie',
  },
  toolbar: {
    classesAria: 'Classes',
    levelAria: 'Niveau du personnage',
    levelDown: 'Niveau -1',
    levelUp: 'Niveau +1',
    removeMode: 'Mode retrait (mobile) : un clic retire un point',
    resetAll: 'Tout réinitialiser',
    copyLink: 'Copier le lien du build',
  },
  heading: 'Talents — {className}',
  headingEmpty: 'Talents',
  documentTitle: 'Calculateur de talents — {className}',
  search: {
    placeholder: 'Rechercher parmi tous les talents',
  },
  summary: {
    spreadSeparator: ' / ',
    requiredLevel: 'Niveau requis :',
    requiredLevelNone: '—',
    remaining: 'Points restants :',
  },
  tree: {
    points: '{spent} / {available}',
    reset: '✕ Réinitialiser',
  },
  talentRank: '{rank}/{max}',
  hint: 'Clic gauche : ajouter un point · Clic droit ou Maj+clic : retirer un point',
  order: {
    title: 'Ordre des talents',
    empty: 'Aucun point dépensé.',
    rank: '{rank}/{max}',
  },
  welcomeTitle: 'Quelle classe jouez-vous ?',
  welcome: 'Choisissez une classe pour ouvrir ses trois arbres de talents, ses sorts niveau par niveau et ses traits raciaux.',
  tooltip: {
    rank: 'Rang {rank}/{max}',
    requiresTree: 'Nécessite {points} points en {tree}',
    requiresTalent: { one: 'Nécessite {count} point en {talent}', other: 'Nécessite {count} points en {talent}' },
    nextRank: 'Rang suivant :',
    canAdd: 'Cliquez pour apprendre',
    canRemove: 'Clic droit pour désapprendre',
  },
  toast: {
    levelTooLow: 'Ce build demande au moins le niveau {level}.',
    removeOn: 'Mode retrait activé',
    removeOff: 'Mode ajout activé',
    linkCopied: 'Lien copié !',
  },
} as const;

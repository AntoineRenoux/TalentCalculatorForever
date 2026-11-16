/** Textes partagés par toutes les pages : en-tête, menu, thème, pied de page, titres. */
export const common = {
  brand: {
    tagline: "Unis par l'aventure, guidés par l'envie.",
    emblemAlt: 'Emblème de Former Hope',
  },

  pages: {
    home: { title: 'Former Hope — Guilde' },
    recruitment: { title: 'Recrutement — Former Hope' },
    boss: { title: 'Guide des boss — Former Hope' },
    addon: { title: 'GuildProfessions — Former Hope' },
    talents: { title: 'Calculateur de talents — Former Hope' },
  },

  nav: {
    ariaLabel: 'Navigation principale',
    home: 'Accueil',
    recruitment: 'Recrutement',
    tools: 'Outils & Guides',
    boss: 'Guide des boss',
    bossFooter: 'Guide boss raid',
    addon: 'Addon de guilde',
    talents: 'Calculateur de talents',
    armory: 'Armurerie',
  },

  theme: {
    defaultLabel: 'Changer le thème',
    toDark: 'Thème jour — activer le thème nuit',
    toLight: 'Thème nuit — activer le thème jour',
  },

  footer: {
    about: {
      title: 'Former Hope',
      text: 'Guilde PvE francophone, Alliance. Raids mardi et dimanche, de 21h00 à 00h00.',
    },
    navTitle: 'Navigation',
    contact: {
      title: 'Nous contacter',
      discord: 'Discord :',
      officers: 'Officiers recrutement : Auby et bloodtry',
      delay: 'Réponse sous 48 heures',
    },
    copyright: '© {year} Former Hope',
    signature: 'Fait à la main, entre deux pulls.',
  },
} as const;

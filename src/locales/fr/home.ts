/** Textes de la page d'accueil. */
export const home = {
  hero: {
    logoAlt: "Logo de la guilde Former Hope : écu bleu au lion d'argent, marteaux croisés et bannières",
    lede: "Guilde PvE francophone de l'Alliance sur WoW Forever, fondée en {year}. On clean chaque patch sans en faire un second travail.",
    ctaRecruitment: 'Rejoindre la guilde',
    ctaRoster: 'Voir le roster',
  },

  /** Phrase d'accroche : chaque {slot} est remplacé par l'avatar d'un membre, en forme d'écu. */
  statement: "Des adultes {slot} qui raident deux soirs {slot}, rigolent beaucoup {slot} et ne lâchent rien.",
  statementSlotAlt: 'Avatar d’un membre de la guilde',

  about: {
    title: 'Une équipe qui tient bon',
    sealAlt: 'Sceau de la guilde Former Hope',
    origins: {
      title: 'D’où l’on vient',
      text: 'Former Hope est née d’un noyau de joueurs venus de serveurs privés, habitués à clean le contenu et à tenir bon là où d’autres abandonnent. Cette endurance, cette stabilité, c’est ce qui nous définit.',
    },
    values: {
      title: 'Respect, entraide, bonne humeur',
      text: 'Nous voulons un environnement où chacun peut jouer, progresser, échanger et prendre du plaisir sans pression inutile. Une communauté soudée, mature et agréable, qui avance sérieusement dans le contenu PvE.',
    },
    cta: 'Voir les postes ouverts',
  },

  roster: {
    title: 'Le roster',
    count: { one: '{count} aventurier', other: '{count} aventuriers' },
    intro: 'Les personnages de la guilde, en direct depuis l’armurerie. Survolez un nom pour voir le personnage.',
    loading: 'Chargement du roster…',
    error: 'Le roster est indisponible pour le moment.',
    member: 'Niv. {level} · {className}',
    previewAlt: 'Rendu du personnage {name}',
    all: 'Ouvrir l’armurerie complète',
    stripMember: 'Niv. {level} · {className}',
  },

  week: {
    title: 'Une semaine chez nous',
    fields: {
      before: {
        clause: 'Avant le raid, on lit les tactiques.',
        text: "Connaître les tactiques avant le soir du raid, accepter les retours sans les prendre personnellement, et prévenir sur Discord quand tu ne peux pas venir. C'est tout.",
      },
      tuesday: {
        clause: 'Mardi, de 21h à minuit, on raide.',
        text: 'Heure de Paris, vocal Discord obligatoire. Présence attendue sur deux soirs minimum.',
      },
      between: {
        clause: 'Entre deux, on joue ensemble.',
        text: 'Rerolls, donjons, optimisation, et des soirées qui durent bien plus longtemps que prévu.',
      },
      sunday: {
        clause: 'Dimanche, on remet ça.',
        text: 'Potions, flacons et nourritures de raid fournis par la banque de guilde : tu viens avec ton stuff optimisé et ta bonne humeur.',
      },
    },
  },

  cta: {
    lead: 'Une candidature, un passage sur Discord, et on se retrouve en raid.',
    word: 'Postuler',
  },

  sheet: {
    title: 'Fiche',
    rows: {
      faction: { term: 'Faction', value: 'Alliance' },
      server: { term: 'Serveur', value: 'Inconnu pour l’instant' },
      raidDays: { term: 'Soirs de raid', value: 'Mardi et dimanche' },
      hours: { term: 'Horaires', value: '21h00 – 00h00' },
      voice: { term: 'Vocal', value: 'Discord obligatoire' },
    },
  },
} as const;

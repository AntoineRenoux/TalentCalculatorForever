/** Textes du serveur de l'API : messages renvoyés aux visiteurs, embed Discord et sorties console. */
export const messages = {
  http: {
    invalidAddress: 'Adresse invalide',
    methodNotAllowed: 'Méthode non autorisée',
    unknownRoute: 'Route inconnue',
    internalError: 'Erreur interne',
  },
  blizzard: {
    authRefused: 'Authentification Blizzard refusée (HTTP {status})',
    notFound: 'Introuvable sur l’API Blizzard',
    httpError: 'API Blizzard : HTTP {status}',
  },
  armory: {
    notInGuild: 'Ce personnage ne fait pas partie de la guilde {guild}.',
    characterNotVisible: 'Personnage pas encore visible sur l’API Blizzard : il faut être niveau 10 ou plus et s’être déconnecté au moins une fois.',
  },
  recruitment: {
    unreadable: 'Candidature illisible.',
    tooLarge: 'Candidature trop longue.',
    missingFields: 'Champs manquants : {fields}',
    missingFieldsSeparator: ', ',
    notConfigured: 'Envoi automatique non configuré sur ce site.',
    ipCooldown: 'Une candidature vient déjà de partir, réessaie plus tard.',
    globalLimit: 'Trop de candidatures en ce moment, réessaie plus tard.',
    discordRefused: 'Discord a refusé l’envoi (HTTP {status}).',
  },
  discord: {
    username: 'Recrutement {guild}',
    title: '📋 Nouvelle candidature — {name}',
    footer: 'Candidature envoyée depuis le site {guild}',
    empty: {
      none: '',
      dash: '—',
      notProvided: 'Non renseigné',
    },
    fields: {
      prenom: 'Prénom IRL',
      pseudo: 'Pseudo en jeu',
      discord: 'Pseudo Discord',
      classe: 'Classe',
      spe: 'Spécialisation',
      role: 'Rôle visé',
      logs: 'Logs / armurerie',
      motivation: 'Pourquoi nous rejoindre',
      experience: 'Expérience en jeu',
    },
  },
  console: {
    listening: 'armurerie {guild} : port {port}',
  },
  probe: {
    credentialsRequired: 'BNET_CLIENT_ID et BNET_CLIENT_SECRET sont requis.',
    tokenOk: 'token OK',
    tokenError: 'token: HTTP {status}',
    summary: '\n{count} perso(s) testé(s). Réponses dans ./{dir}/',
  },
} as const;

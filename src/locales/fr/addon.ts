/** Textes de la page « GuildProfessions » (addon de guilde). */
export const addon = {
  meta: {
    description: 'Retrouve les métiers et recettes de la guilde FORMER HOPE en jeu et sur Discord grâce à GuildProfessions.',
  },

  menu: {
    open: 'Ouvrir le menu',
    close: 'Fermer le menu',
    label: 'Menu',
  },

  brand: 'FORMER HOPE',

  nav: {
    ariaLabel: 'Navigation de la page',
    back: 'Retour à l’accueil',
    home: 'GuildProfessions',
    how: 'Fonctionnement',
    downloads: 'Téléchargements',
    install: 'Installation',
    discord: 'Discord',
    faq: 'FAQ',
  },

  hero: {
    eyebrow: 'FORMER HOPE · WoW: Forever',
    titleLine1: 'Tous les métiers',
    titleLine2: 'de la guilde,',
    titleAccent: 'dans ta poche.',
    description: 'Qui peut craft le Flacon des Titans ? Quel enchanteur connaît Croisé ? GuildProfessions répond en jeu comme sur Discord — et se met à jour tout seul.',
    download: 'Télécharger',
    guide: 'Guide d’installation',
    art: {
      title: 'GuildProfessions',
      status: '● Synchronisé',
      professions: {
        alchemy: 'Alchimie',
        enchanting: 'Enchantement',
        blacksmithing: 'Forge',
      },
      crafters: { one: '{count} artisan', other: '{count} artisans' },
      found: 'Recette trouvée',
      available: '✓ disponible',
    },
  },

  how: {
    eyebrow: 'Simple, automatique, partagé',
    titleLine1: 'Trois pièces,',
    titleAccent: 'un annuaire.',
    copy: 'Un addon ne peut ni accéder à Internet ni écrire sur ton disque. GuildProfessions relie donc le jeu, ton ordinateur et Discord pour partager les métiers de la guilde.',
    cards: {
      addon: {
        title: 'L’addon, en jeu',
        text: 'Tape <code>/gp</code> pour parcourir les métiers, filtrer par niveau ou recette et consulter les recettes connues d’un artisan. L’addon scanne aussi tes métiers et tes patrons.',
      },
      companion: {
        title: 'Le compagnon, sur ton PC',
        text: 'Il transmet tes scans au serveur de la guilde et récupère les données des autres joueurs. Lance-le une fois : il fonctionne ensuite en arrière-plan.',
      },
      bot: {
        title: 'Le bot, sur Discord',
        text: 'Trouve un artisan avec <code>/metier who</code>, passe une commande avec <code>/craft order</code> ou déclare un métier manuellement avec <code>/metier set</code>.',
      },
    },
    flowLabel: 'Étapes de synchronisation',
    flow: {
      play: 'Tu joues',
      scan: 'L’addon scanne',
      sync: 'Le compagnon synchronise',
      consult: 'La guilde consulte les données',
    },
  },

  manual: {
    eyebrow: 'Sans compagnon',
    titleLine1: 'Le canal manuel,',
    titleAccent: 'en deux commandes.',
    copy: 'Tu peux aussi synchroniser les données par copier-coller. Le compagnon automatise ces échanges, mais il n’est pas obligatoire.',
    export: {
      title: 'Envoyer tes métiers vers Discord',
      steps: {
        open: 'En jeu, tape <code>/gp</code>, puis choisis « Exporter ».',
        copy: 'Copie la chaîne qui commence par <code>GP1!</code>.',
        paste: 'Sur Discord, utilise <code>/import</code> et colle-la.',
      },
    },
    import: {
      title: 'Importer l’annuaire dans le jeu',
      steps: {
        export: 'Sur Discord, utilise <code>/export-addon</code>.',
        fetch: 'Récupère la chaîne envoyée par le bot.',
        open: 'En jeu, tape <code>/gp</code>, puis choisis « Importer ».',
      },
    },
  },

  downloads: {
    eyebrow: 'Choisis ton installation',
    title: 'Téléchargements',
    copy: 'Le pack tout-en-un installe l’addon et son compagnon. Tu peux aussi télécharger chaque élément séparément.',
    featured: {
      badge: 'Recommandé · Pack tout-en-un',
      title: 'Une installation, et c’est prêt.',
      text: 'Le compagnon trouve ton dossier World of Warcraft, installe l’addon et synchronise tes métiers en arrière-plan. Il met également à jour l’addon et le compagnon.',
      points: {
        install: 'Installation automatique dans <code>Interface/AddOns</code>',
        detect: 'Détection du dossier World of Warcraft',
        sync: 'Synchronisation des métiers de la guilde',
        updates: 'Mises à jour automatiques',
      },
      choose: 'Choisir mon système',
    },
    version: 'Version actuelle : <strong>{version}</strong> · publiée le {date}',
    platforms: {
      windows: { name: 'Windows', detail: 'win-x64 · exécutable autonome', short: 'Windows' },
      macArm: { name: 'Mac · Apple Silicon', detail: 'osx-arm64 · Mac M1 à M4', short: 'Mac Apple Silicon' },
      macIntel: { name: 'Mac · Intel', detail: 'osx-x64 · Mac d’avant 2021', short: 'Mac Intel' },
      linux: { name: 'Linux', detail: 'linux-x64 · Steam/Proton et Lutris', short: 'Linux' },
    },
    downloadPack: 'Télécharger le pack',
    linkSeparator: ' ·',
    separate: {
      eyebrow: 'À la carte',
      titleLine1: 'Addon et compagnon,',
      titleAccent: 'séparément.',
      addon: {
        title: 'L’addon — obligatoire',
        text: 'Le même fichier pour tous les systèmes. Dézippe-le et place le dossier <code>GuildProfessions</code> dans <code>Interface/AddOns</code>.',
        download: 'Télécharger l’addon',
      },
      companion: {
        title: 'Le compagnon — au choix',
        text: 'Choisis le fichier qui correspond à ton ordinateur. Le compagnon synchronise les données et met à jour l’addon automatiquement.',
      },
    },
    privacy: 'Le compagnon lit les fichiers de données écrits par WoW et dépose un fichier de données pour l’addon. Il ne demande ni mot de passe, ni adresse e-mail, ni création de compte.',
    sourceCode: 'Consulter le code source sur GitHub',
  },

  install: {
    eyebrow: 'Guide pas à pas',
    title: 'Installation',
    copy: 'Choisis ton système pour afficher les instructions correspondantes.',
    tabsLabel: 'Instructions d’installation',
    panels: {
      windows: {
        tab: 'Windows',
        title: 'Windows',
        steps: {
          pack: '<strong>Pack tout-en-un :</strong> dézippe le fichier, puis lance <code>GuildProfessionsCompanion.exe</code>. Le programme installe l’addon et se lance au démarrage de Windows.',
          separate: '<strong>À la carte :</strong> place le dossier <code>GuildProfessions</code> dans le dossier <code>Interface/AddOns</code> de WoW, puis lance le compagnon.',
          scan: 'En jeu, ouvre chaque fenêtre de métier une fois pour scanner tes recettes. Les données seront envoyées à ta prochaine déconnexion.',
        },
        note: 'Si Windows affiche « Windows a protégé votre PC », clique sur « Informations complémentaires », puis « Exécuter quand même ».',
      },
      mac: {
        tab: 'Mac',
        title: 'Mac',
        steps: {
          download: 'Télécharge la version Apple Silicon ou Intel selon ton Mac.',
          separate: 'Pour l’installation à la carte, place le dossier de l’addon dans <code>World of Warcraft/_forever_/Interface/AddOns/</code>.',
          unblock: 'Si macOS bloque le compagnon, fais un clic droit sur l’application et choisis « Ouvrir ».',
          scan: 'Ouvre chaque fenêtre de métier en jeu pour scanner tes recettes.',
        },
      },
      linux: {
        tab: 'Linux',
        title: 'Linux',
        steps: {
          unzip: 'Dézippe le compagnon Linux et rends-le exécutable.',
          run: 'Lance <code>GuildProfessionsCompanion</code> pendant que tu joues.',
          separate: 'Pour l’installation à la carte, place l’addon dans le dossier <code>Interface/AddOns</code> de ton installation WoW.',
          scan: 'Ouvre chaque fenêtre de métier une fois pour enregistrer tes recettes.',
        },
      },
    },
  },

  discord: {
    eyebrow: 'L’annuaire, même hors du jeu',
    titleLead: 'Les commandes',
    titleAccent: 'Discord',
    copy: 'Trouve un artisan, consulte les recettes et suis tes commandes directement sur le serveur Discord de la guilde.',
    commands: {
      metierList: { command: '/metier list', text: 'Tous les métiers de la guilde.' },
      metierWho: { command: '/metier who', text: 'Trouver un artisan par métier, niveau ou recette.' },
      metierRecipes: { command: '/metier recettes', text: 'Voir les recettes connues d’un personnage.' },
      metierSet: { command: '/metier set', text: 'Déclarer un métier manuellement.' },
      craftOrder: { command: '/craft order', text: 'Passer commande à un artisan.' },
      craftList: { command: '/craft list', text: 'Consulter les commandes en cours.' },
      craftAccept: { command: '/craft accept', text: 'Accepter une commande.' },
      craftDone: { command: '/craft done', text: 'Signaler une commande terminée.' },
      craftCancel: { command: '/craft cancel', text: 'Annuler une commande.' },
      link: { command: '/link', text: 'Lier tes personnages à Discord.' },
      main: { command: '/main', text: 'Choisir ton personnage principal.' },
      exportAddon: { command: '/export-addon', text: 'Exporter l’annuaire vers le jeu.' },
      import: { command: '/import', text: 'Importer tes métiers depuis le jeu.' },
    },
  },

  faq: {
    eyebrow: 'Avant l’installation',
    titleLead: 'Questions',
    titleAccent: 'fréquentes',
    items: {
      safe: {
        question: 'Le compagnon est-il sûr ?',
        answer: 'Il lit les fichiers de données que WoW écrit et dépose un fichier de données pour l’addon. Il ne demande pas de mot de passe ou d’adresse e-mail. Le code du projet peut être consulté sur GitHub.',
      },
      outsideGuild: {
        question: 'Mes personnages hors guilde sont-ils enregistrés ?',
        answer: 'Non. L’addon vérifie que le personnage appartient à FORMER HOPE avant de scanner ses données.',
      },
      missingRecipes: {
        question: 'Pourquoi mes recettes n’apparaissent-elles pas ?',
        answer: 'Ouvre la fenêtre de chaque métier une fois en jeu. Les données seront transmises à la prochaine déconnexion si le compagnon tourne.',
      },
      craftOrder: {
        question: 'Comment passer une commande de craft ?',
        answer: 'En jeu, ouvre <code>/gp</code>, sélectionne un artisan et choisis une recette. Sur Discord, utilise <code>/craft order</code>.',
      },
    },
  },

  footer: {
    text: 'GuildProfessions · Fait avec soin pour FORMER HOPE · WoW: Forever',
  },
} as const;

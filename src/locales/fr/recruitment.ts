/** Textes de la page de recrutement (postes, étapes, formulaire de candidature). */
export const recruitment = {
  hero: {
    title: 'Rejoindre Former Hope',
    intro: 'On recrute, mais on recrute bien. Lis les postes ouverts, remplis la candidature, et on se parle sur Discord dans les jours qui suivent.',
  },
  posts: {
    title: 'Postes ouverts',
    items: {
      tank: { name: 'Tank', detail: 'Nous ne recrutons plus de tank.' },
      healer: { name: 'Soigneur', detail: '1 HPal.' },
      melee: { name: 'DPS corps à corps', detail: 'Nous ne recrutons plus de cac.' },
      ranged: { name: 'DPS distance / cast', detail: 'Nous ne recrutons plus de cast.' },
    },
    status: {
      closed: 'Fermé',
      priority: 'Priorité',
      open: 'Ouvert',
    },
    note: 'Un poste est fermé ? Tu peux tout de même postuler si tu es très motivé : nous répondons à tout le monde.',
  },
  steps: {
    title: 'Comment ça se passe',
    items: {
      apply: {
        title: 'Tu postules',
        text: 'Tu remplis le formulaire ci-dessous. Compte cinq minutes, et sois honnête sur ton expérience : on préfère un débutant motivé à un menteur.',
      },
      talk: {
        title: 'On échange sur Discord',
        text: "Un officier te contacte sous 48 heures et on discute en vocal : tes attentes, les nôtres, ton parcours et tes disponibilités. C'est une conversation, pas un examen.",
      },
      join: {
        title: 'Tu rejoins le projet de guilde',
        text: 'Si nous sommes d’accord, tu reçois tes accès Discord et ton invitation en jeu à la sortie de WoW Forever. Pas de période d’essai déguisée : tu es membre.',
      },
    },
  },
  form: {
    title: 'Candidature',
    optional: '(facultatif)',
    submit: 'Envoyer ma candidature',
    fields: {
      prenom: { label: 'Prénom IRL', placeholder: 'Camille' },
      pseudo: { label: 'Pseudo en jeu', placeholder: 'Kaeldrin-Hyjal' },
      classe: { label: 'Classe', placeholder: 'Choisir une classe' },
      spe: { label: 'Spécialisation', placeholder: 'Élémentaire' },
      role: { label: 'Rôle visé', placeholder: 'Choisir un rôle' },
      discord: { label: 'Pseudo Discord', placeholder: 'camille_ael', help: "Ton identifiant exact, c'est par là qu'on te contacte." },
      motivation: { label: 'Pourquoi nous rejoindre ?' },
      experience: { label: 'Expérience en jeu' },
      logs: { label: 'Lien de logs ou d’armurerie', placeholder: 'https://' },
    },
    options: {
      classes: {
        shaman: 'Chaman',
        hunter: 'Chasseur',
        warlock: 'Démoniste',
        druid: 'Druide',
        warrior: 'Guerrier',
        mage: 'Mage',
        paladin: 'Paladin',
        priest: 'Prêtre',
        rogue: 'Voleur',
      },
      roles: {
        tank: 'Tank',
        healer: 'Soigneur',
        melee: 'DPS corps à corps',
        ranged: 'DPS distance / cast',
      },
    },
    errors: {
      missing: { one: 'Il reste {count} champ à remplir.', other: 'Il reste {count} champs à remplir.' },
      cooldown: 'Une candidature vient déjà de partir. Réessaie dans {minutes} min.',
    },
  },
  popup: {
    title: 'Dernière étape',
    text: "Pour finaliser ta candidature, tu dois rejoindre notre serveur Discord : c'est là qu'un officier te contactera. En cliquant ci-dessous, ta candidature est envoyée et le Discord s'ouvre dans un nouvel onglet.",
    confirm: 'Rejoindre le Discord et candidater',
    cancel: 'Annuler',
  },
  recap: {
    title: 'Candidature prête',
    intro: 'Copie le texte ci-dessous et colle-le dans le salon <strong>#candidatures</strong> de notre Discord.',
    manual: 'Copie le texte ci-dessous et colle-le dans le salon #candidatures de notre Discord. Un officier te répond sous 48 heures.',
    sent: "C'est envoyé ! Tu peux garder une copie du texte ci-dessous si tu le souhaites.",
    copy: 'Copier le texte',
    copied: 'Texte copié',
    copyFailed: 'Copie impossible, sélectionne le texte',
    openDiscord: 'Ouvrir Discord',
  },
  status: {
    sending: 'Envoi de ta candidature…',
    success: "✅ Candidature envoyée dans #candidatures. Rejoins le Discord ouvert dans l'autre onglet : un officier te contacte sous 48 heures.",
    failure: "⚠️ L'envoi automatique a échoué. Copie le texte ci-dessous et colle-le dans #candidatures sur le Discord.",
    notConfigured: "Le Discord vient de s'ouvrir dans un nouvel onglet. L'envoi automatique n'est pas activé sur ce site.",
  },
  /** Texte récapitulatif à copier (les valeurs {…} sont celles du formulaire). */
  summary: {
    title: 'Candidature — {guild}',
    identity: 'Prénom : {prenom}\nPseudo en jeu : {pseudo}\nClasse / spé : {classe} — {spe}\nRôle visé : {role}\nDiscord : {discord}',
    logs: 'Logs / armurerie : {logs}',
    answers: '\nPourquoi nous rejoindre :\n{motivation}\n\nExpérience en jeu :\n{experience}',
  },
} as const;

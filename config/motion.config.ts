/** Réglages des animations (les durées et courbes CSS sont dans src/styles/tokens/core.css). */
export const motionConfig = {
  /** Classe posée sur <html> quand les animations sont actives (sinon tout est visible d'emblée). */
  readyClass: 'motion-ready',
  /** Conteneurs dont les enfants directs apparaissent en cascade à l'entrée dans l'écran. */
  groupSelector: '[data-reveal]',
  revealedClass: 'is-revealed',
  /** Variable CSS qui reçoit le rang de chaque enfant (pour le décalage). */
  indexVar: '--reveal-index',
  /** Nombre maximal d'enfants décalés ; au-delà, ils arrivent avec le dernier. */
  maxStagger: 8,
  /** Part de l'élément visible avant de lancer l'entrée, et marge basse de déclenchement. */
  threshold: 0.12,
  rootMargin: '0px 0px -8% 0px',

  /** En-tête : classe ajoutée après ce défilement (px). */
  header: { selector: 'header.site', scrolledClass: 'is-scrolled', offset: 24 },

  /** Image à parallaxe légère : décalage maximal en fraction de sa hauteur. */
  parallax: { selector: '[data-parallax]', strength: 0.08, var: '--parallax', center: 0.5 },
} as const;

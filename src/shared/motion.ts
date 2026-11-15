/**
 * Couche d'animations commune : entrée en cascade des sections, en-tête au défilement, parallaxe légère.
 * Transformations et opacité seulement ; rien ne bouge si le visiteur demande moins d'animations,
 * et le contenu reste visible si le script ne s'exécute pas.
 */
import { motionConfig } from '../../config/motion.config.ts';
import { siteConfig } from '../../config/site.config.ts';

const reduced = (): boolean => window.matchMedia(siteConfig.media.reducedMotion).matches;

/** Prépare un groupe : chaque enfant reçoit son rang pour le décalage CSS. */
function prepareGroup(group: HTMLElement): void {
  [...group.children].forEach((child, i) => {
    (child as HTMLElement).style.setProperty(motionConfig.indexVar, String(Math.min(i, motionConfig.maxStagger)));
  });
}

/** Observe les groupes [data-reveal] (y compris ceux ajoutés plus tard via observeReveal). */
let observer: IntersectionObserver | null = null;

export function observeReveal(root: ParentNode = document): void {
  const groups = root.querySelectorAll<HTMLElement>(motionConfig.groupSelector);
  if (!observer) {
    groups.forEach((g) => g.classList.add(motionConfig.revealedClass));
    return;
  }
  groups.forEach((g) => { prepareGroup(g); observer?.observe(g); });
}

function initHeader(): void {
  const { selector, scrolledClass, offset } = motionConfig.header;
  const header = document.querySelector<HTMLElement>(selector);
  if (!header) return;
  const update = () => header.classList.toggle(scrolledClass, window.scrollY > offset);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initParallax(): void {
  const { selector, strength, var: cssVar, center } = motionConfig.parallax;
  const nodes = [...document.querySelectorAll<HTMLElement>(selector)];
  if (!nodes.length) return;
  let frame = 0;
  const update = () => {
    frame = 0;
    nodes.forEach((n) => {
      const r = n.getBoundingClientRect();
      const progress = (window.innerHeight - r.top) / (window.innerHeight + r.height); // 0 → 1 pendant la traversée
      n.style.setProperty(cssVar, String((progress - center) * strength));
    });
  };
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  update();
}

export function initMotion(): void {
  initHeader();
  if (reduced() || !('IntersectionObserver' in window)) {
    observeReveal();
    return;
  }
  document.documentElement.classList.add(motionConfig.readyClass);
  observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add(motionConfig.revealedClass);
      observer?.unobserve(e.target);
    });
  }, { threshold: motionConfig.threshold, rootMargin: motionConfig.rootMargin });
  observeReveal();
  initParallax();
}

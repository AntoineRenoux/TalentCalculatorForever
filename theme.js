/* Bouton jour / nuit, même fonctionnement que former-hope.fr :
 * sans choix enregistré, on suit le thème du système. */
(() => {
  'use strict';
  const KEY = 'formerhope-theme';
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const media = matchMedia('(prefers-color-scheme: dark)');

  const current = () => root.dataset.theme || (media.matches ? 'dark' : 'light');
  function paint() {
    const dark = current() === 'dark';
    icon.textContent = dark ? '🌙' : '☀️';
    const label = dark ? 'Thème nuit — activer le thème jour' : 'Thème jour — activer le thème nuit';
    btn.title = label;
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-pressed', String(dark));
  }
  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch (_) {}
    paint();
  });
  media.addEventListener('change', paint);
  paint();
})();

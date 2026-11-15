/* Bouton jour / nuit : même logique que le script en ligne des pages de la guilde. */
(() => {
  const bouton = document.getElementById('theme-toggle');
  const icone = document.getElementById('theme-icon');
  if (!bouton || !icone) return;

  const systemeSombre = window.matchMedia('(prefers-color-scheme: dark)');
  const estSombre = () => {
    const choix = document.documentElement.dataset.theme;
    return choix ? choix === 'dark' : systemeSombre.matches;
  };

  function actualiserBouton() {
    const sombre = estSombre();
    const libelle = sombre ? 'Thème nuit — activer le thème jour' : 'Thème jour — activer le thème nuit';
    icone.textContent = sombre ? '🌙' : '☀️';
    bouton.setAttribute('aria-label', libelle);
    bouton.setAttribute('title', libelle);
    bouton.setAttribute('aria-pressed', String(sombre));
  }

  bouton.addEventListener('click', () => {
    const nouveauTheme = estSombre() ? 'light' : 'dark';
    document.documentElement.dataset.theme = nouveauTheme;
    try { localStorage.setItem('formerhope-theme', nouveauTheme); } catch (_) {}
    actualiserBouton();
  });
  systemeSombre.addEventListener('change', actualiserBouton);
  actualiserBouton();
})();

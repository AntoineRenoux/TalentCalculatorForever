/** Partiels communs à toutes les pages : <head>, en-tête avec menu, pied de page. */
import { siteConfig, pageHref, type NavLink, type PageId } from '../../config/site.config.ts';
import { t, tDynamic } from '../../src/shared/i18n.ts';
import { attrs, escapeHtml } from '../html/escape.ts';
import { iconSvg } from '../../config/icons.config.ts';
import type { PartialArgs, PartialRegistry } from '../html/types.ts';

function pageOf(args: PartialArgs): PageId {
  const page = args.named.page as PageId | undefined;
  if (!page || !(page in siteConfig.pages)) throw new Error(`partiel : page inconnue « ${String(page)} »`);
  return page;
}

/** Script en ligne exécuté avant l'affichage : applique le thème enregistré (évite un flash). */
function themeInitScript(): string {
  const { storageKey, light, dark } = siteConfig.theme;
  return `<script>(()=>{try{const v=localStorage.getItem(${JSON.stringify(storageKey)});if(v===${JSON.stringify(light)}||v===${JSON.stringify(dark)})document.documentElement.dataset.theme=v;}catch(_){}})();</script>`;
}

function head(args: PartialArgs): string {
  const page = pageOf(args);
  const preconnect = siteConfig.urls.fontsPreconnect
    .map((href, i) => `<link${attrs({ rel: 'preconnect', href, crossorigin: i > 0 })}>`)
    .join('\n  ');
  return `<meta charset="UTF-8">
  <title>${escapeHtml(tDynamic(`pages.${page}.title`))}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${themeInitScript()}
  <link rel="icon" href="${escapeHtml(siteConfig.assets.emblem)}">
  ${preconnect}
  <link rel="stylesheet" href="${escapeHtml(siteConfig.urls.fonts)}">`;
}

function isCurrent(link: NavLink, page: PageId): boolean {
  return link.page === page && !link.anchor;
}

function navLink(link: NavLink, page: PageId, className?: string): string {
  return `<a${attrs({
    class: className,
    id: link.domId,
    href: pageHref(link.page, link.anchor),
    'aria-current': isCurrent(link, page) ? 'page' : undefined,
  })}>${escapeHtml(tDynamic(link.labelKey))}</a>`;
}

function header(args: PartialArgs): string {
  const page = pageOf(args);
  const links = siteConfig.nav.links
    .map((l, i) => navLink(l, page, i === 0 ? 'nav-accueil' : 'nav-parent'))
    .join('\n      ');
  const groups = siteConfig.nav.groups.map((g) => `<div class="nav-groupe">
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="${escapeHtml(g.menuId)}">${escapeHtml(tDynamic(g.labelKey))} <span class="chevron" aria-hidden="true">▾</span></button>
        <ul class="nav-menu" id="${escapeHtml(g.menuId)}" hidden>
          ${g.items.map((l) => `<li>${navLink(l, page)}</li>`).join('\n          ')}
        </ul>
      </div>`).join('\n      ');

  return `<header class="site">
  <div class="wrap bar">
    <a class="marque" href="${escapeHtml(pageHref('home'))}">
      <img class="emblem" src="${escapeHtml(siteConfig.assets.emblem)}" alt="${escapeHtml(t('brand.emblemAlt'))}">
      <span>
        <span class="nom">${escapeHtml(siteConfig.guild.name)}</span>
        <span class="serveur">${escapeHtml(t('brand.tagline'))}</span>
      </span>
    </a>
    <nav class="site" aria-label="${escapeHtml(t('nav.ariaLabel'))}">
      ${links}
      ${groups}
    </nav>
    <button class="theme-toggle" id="theme-toggle" type="button" aria-label="${escapeHtml(t('theme.defaultLabel'))}" title="${escapeHtml(t('theme.defaultLabel'))}">
      <span id="theme-icon" aria-hidden="true">${iconSvg(siteConfig.theme.icons.dark)}</span>
    </button>
  </div>
</header>`;
}

function footer(): string {
  const links = siteConfig.footerLinks
    .map((l) => `<li><a href="${escapeHtml(pageHref(l.page, l.anchor))}">${escapeHtml(tDynamic(l.labelKey))}</a></li>`)
    .join('\n          ');
  const { discordInvite, discordDisplay } = siteConfig.urls;
  return `<footer class="site">
  <div class="wrap">
    <div class="pieds">
      <div>
        <h3>${escapeHtml(t('footer.about.title'))}</h3>
        <p>${escapeHtml(t('footer.about.text'))}</p>
      </div>
      <div>
        <h3>${escapeHtml(t('footer.navTitle'))}</h3>
        <ul>
          ${links}
        </ul>
      </div>
      <div>
        <h3>${escapeHtml(t('footer.contact.title'))}</h3>
        <ul>
          <li>${escapeHtml(t('footer.contact.discord'))}
            <a href="${escapeHtml(discordInvite)}" target="_blank" rel="noopener noreferrer">${escapeHtml(discordDisplay)}</a>
          </li>
          <li>${escapeHtml(t('footer.contact.officers'))}</li>
          <li>${escapeHtml(t('footer.contact.delay'))}</li>
        </ul>
      </div>
    </div>
    <p class="marque-geante" aria-hidden="true">${escapeHtml(siteConfig.guild.name)}</p>
    <div class="mentions">
      <span>${escapeHtml(t('footer.copyright', { year: siteConfig.guild.foundedYear }))}</span>
      <span>${escapeHtml(t('footer.signature'))}</span>
    </div>
  </div>
</footer>`;
}

export const commonPartials: PartialRegistry = { head, header, footer };

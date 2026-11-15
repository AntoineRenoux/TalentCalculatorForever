/** Partiels de la page « GuildProfessions » : blocs répétés générés depuis la config et les textes. */
import { addonConfig } from '../../config/addon.config.ts';
import { iconSvg } from '../../config/icons.config.ts';
import { siteConfig } from '../../config/site.config.ts';
import { t, tDynamic } from '../../src/shared/i18n.ts';
import { attrs, escapeHtml } from '../html/escape.ts';
import type { PartialArgs, PartialRegistry } from '../html/types.ts';

const tx = (key: string) => escapeHtml(tDynamic(key));
const anchor = (id: string) => `#${id}`;
const join = (items: string[], indent: string) => items.join(`\n${indent}`);
/** Puce en forme d'écu (motif du site). */
const ECU_PUCE = '<span class="ecu-puce" aria-hidden="true"></span>';

/** Valeur de la config de la page : {{> addonCfg sections.how}}. */
function addonCfg(args: PartialArgs): string {
  const [path] = args.positional;
  if (!path) throw new Error('addonCfg : chemin manquant');
  const value = path.split('.').reduce<unknown>(
    (node, k) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[k] : undefined),
    addonConfig,
  );
  if (value === undefined || typeof value === 'object') throw new Error(`addonCfg : valeur inconnue « ${path} »`);
  return escapeHtml(value);
}

/** Balises <meta> propres à la page (couleur du navigateur, description). */
function addonMeta(): string {
  return `<meta${attrs({ name: 'theme-color', content: addonConfig.meta.themeColor })}>
  <meta${attrs({ name: 'description', content: t('addon.meta.description') })}>`;
}

/** Sommaire de la page (ancres des sections). */
function addonNav(): string {
  return join(addonConfig.nav.map((key) =>
    `<a href="${escapeHtml(anchor(addonConfig.sections[key]))}">${tx(`addon.nav.${key}`)}</a>`), '        ');
}

/** Lignes de la fenêtre de l'addon montrée dans le héros (fragment d'interface). */
function addonArtRows(): string {
  const row = (label: string, pill: string, found = false) => `<div class="addon-ui-ligne${found ? ' is-found' : ''}">
            <b>${escapeHtml(label)}</b>
            <span class="addon-ui-pastille">${escapeHtml(pill)}</span>
          </div>`;
  const rows = addonConfig.heroArt.professions.map((p) =>
    row(tDynamic(`addon.hero.art.professions.${p.key}`), t('addon.hero.art.crafters', { count: p.crafters })));
  rows.push(row(t('addon.hero.art.found'), t('addon.hero.art.available'), true));
  return join(rows, '          ');
}

/** Les trois pièces du système, en liste à puces en écu. */
function addonPieces(): string {
  return join(addonConfig.featureCards.map((key) => `<li>
          ${ECU_PUCE}
          <div>
            <h3>${tx(`addon.how.cards.${key}.title`)}</h3>
            <p>${tDynamic(`addon.how.cards.${key}.text`)}</p>
          </div>
        </li>`), '        ');
}

/** Parcours de synchronisation : étapes reliées par des flèches. */
function addonFlow(): string {
  const arrow = `<span class="addon-flux-fleche" aria-hidden="true">${iconSvg('arrow')}</span>`;
  const steps = addonConfig.flow.map((key) => `<span class="addon-flux-etape">${tx(`addon.how.flow.${key}`)}</span>`);
  return join(steps.flatMap((s, i) => (i === 0 ? [s] : [arrow, s])), '        ');
}

/** Étapes d'une colonne du canal manuel : {{> addonSteps export}}. */
function addonSteps(args: PartialArgs): string {
  const card = args.positional[0] as keyof typeof addonConfig.manual | undefined;
  if (!card || !(card in addonConfig.manual)) throw new Error(`addonSteps : colonne inconnue « ${String(card)} »`);
  return join(addonConfig.manual[card].map((step) =>
    `<li>${tDynamic(`addon.manual.${card}.steps.${step}`)}</li>`), '            ');
}

function addonFeaturedPoints(): string {
  return join(addonConfig.featuredPoints.map((key) =>
    `<li>${ECU_PUCE}<span>${tDynamic(`addon.downloads.featured.points.${key}`)}</span></li>`), '            ');
}

function addonVersion(): string {
  const { version, date, dateFormat } = addonConfig.release;
  const formatted = new Intl.DateTimeFormat(siteConfig.lang, dateFormat).format(new Date(date));
  return t('addon.downloads.version', { version: escapeHtml(version), date: escapeHtml(formatted) });
}

/** Un téléchargement du pack par système, en lignes. */
function addonPlatforms(): string {
  return join(addonConfig.downloads.platforms.map((p) => `<li>
          <div>
            <h3>${tx(`addon.downloads.platforms.${p.key}.name`)}</h3>
            <p>${tx(`addon.downloads.platforms.${p.key}.detail`)}</p>
          </div>
          <a class="lien-fleche" href="${escapeHtml(p.pack)}">${tx('addon.downloads.downloadPack')} ${iconSvg('arrow')}</a>
        </li>`), '        ');
}

function addonCompanionLinks(): string {
  const links = addonConfig.downloads.platforms.map((p) =>
    `<a href="${escapeHtml(p.companion)}">${tx(`addon.downloads.platforms.${p.key}.short`)}</a>`);
  return join(links.map((l, i) => (i < links.length - 1 ? `${l}${tx('addon.downloads.linkSeparator')}` : l)), '            ');
}

function addonTabs(): string {
  return join(addonConfig.install.map((tab, i) =>
    `<a${attrs({ class: `addon-onglet${i === 0 ? ` ${addonConfig.tabs.activeClass}` : ''}`, href: anchor(tab.id) })}>${tx(`addon.install.panels.${tab.key}.tab`)}</a>`), '          ');
}

function addonInstallPanels(): string {
  return join(addonConfig.install.map((tab) => {
    const base = `addon.install.panels.${tab.key}`;
    const steps = tab.steps.map((s) => `<li>${tDynamic(`${base}.steps.${s}`)}</li>`);
    const note = tab.note ? `\n            <p class="addon-note">${tDynamic(`${base}.note`)}</p>` : '';
    return `<article class="addon-panneau" id="${escapeHtml(tab.id)}">
            <h3>${tx(`${base}.title`)}</h3>
            <ol>
              ${join(steps, '              ')}
            </ol>${note}
          </article>`;
  }), '\n          ');
}

function addonCommands(): string {
  return join(addonConfig.discordCommands.map((key) =>
    `<li><code>${tx(`addon.discord.commands.${key}.command`)}</code><span>${tx(`addon.discord.commands.${key}.text`)}</span></li>`), '        ');
}

function addonFaq(): string {
  return join(addonConfig.faq.map((key) => `<details class="addon-question">
          <summary>${tx(`addon.faq.items.${key}.question`)}</summary>
          <p>${tDynamic(`addon.faq.items.${key}.answer`)}</p>
        </details>`), '\n        ');
}

export const addonPartials: PartialRegistry = {
  addonCfg,
  addonMeta,
  addonNav,
  addonArtRows,
  addonPieces,
  addonFlow,
  addonSteps,
  addonFeaturedPoints,
  addonVersion,
  addonPlatforms,
  addonCompanionLinks,
  addonTabs,
  addonInstallPanels,
  addonCommands,
  addonFaq,
};

/** Partiels de la page « GuildProfessions » : blocs répétés générés depuis la config et les textes. */
import { addonConfig } from '../../config/addon.config.ts';
import { siteConfig } from '../../config/site.config.ts';
import { formatNumber, t, tDynamic } from '../../src/shared/i18n.ts';
import { attrs, escapeHtml } from '../html/escape.ts';
import type { PartialArgs, PartialRegistry } from '../html/types.ts';

const tx = (key: string) => escapeHtml(tDynamic(key));
const anchor = (id: string) => `#${id}`;
const join = (items: string[], indent: string) => items.join(`\n${indent}`);

/** Valeur de la config de la page : {{> addonCfg ids.sidebar}}. */
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

function addonNav(): string {
  return join(addonConfig.nav.map((key) =>
    `<a href="${escapeHtml(anchor(addonConfig.sections[key]))}">${tx(`addon.nav.${key}`)}</a>`), '        ');
}

function artRow(label: string, pill: string): string {
  return `<div class="gp-art-row">
            <b>${escapeHtml(label)}</b>
            <span class="gp-art-pill">${escapeHtml(pill)}</span>
          </div>`;
}

function addonArtRows(): string {
  const rows = addonConfig.heroArt.professions.map((p) =>
    artRow(tDynamic(`addon.hero.art.professions.${p.key}`), t('addon.hero.art.crafters', { count: p.crafters })));
  rows.push(artRow(t('addon.hero.art.found'), t('addon.hero.art.available')));
  return join(rows, '          ');
}

function cardNumber(n: number, digits: number): string {
  return formatNumber(n, { minimumIntegerDigits: digits, useGrouping: false });
}

function addonFeatureCards(): string {
  return join(addonConfig.featureCards.map((key, i) => `<article class="gp-card">
          <span class="gp-card-number">${escapeHtml(cardNumber(i + 1, addonConfig.featureNumberDigits))}</span>
          <h3>${tx(`addon.how.cards.${key}.title`)}</h3>
          <p>
            ${tDynamic(`addon.how.cards.${key}.text`)}
          </p>
        </article>`), '\n        ');
}

/** Numéro d'une carte « à la carte », selon l'ordre de la config : {{> addonSeparateNumber addon}}. */
function addonSeparateNumber(args: PartialArgs): string {
  const index = (addonConfig.separateCards as readonly string[]).indexOf(args.positional[0] ?? '');
  if (index < 0) throw new Error(`addonSeparateNumber : carte inconnue « ${String(args.positional[0])} »`);
  return escapeHtml(cardNumber(index + 1, addonConfig.separateNumberDigits));
}

function addonFlow(): string {
  const arrow = `<span class="gp-flow-arrow">${escapeHtml(addonConfig.icons.flowArrow)}</span>`;
  const steps = addonConfig.flow.map((key, i) => {
    const label = tx(`addon.how.flow.${key}`);
    return `<span>${i === 0 ? `<b>${label}</b>` : label}</span>`;
  });
  return join(steps.flatMap((s, i) => (i === 0 ? [s] : [arrow, s])), '        ');
}

/** Étapes d'une carte du canal manuel : {{> addonSteps export}}. */
function addonSteps(args: PartialArgs): string {
  const card = args.positional[0] as keyof typeof addonConfig.manual | undefined;
  if (!card || !(card in addonConfig.manual)) throw new Error(`addonSteps : carte inconnue « ${String(card)} »`);
  return join(addonConfig.manual[card].map((step) =>
    `<li>${tDynamic(`addon.manual.${card}.steps.${step}`)}</li>`), '            ');
}

function addonFeaturedPoints(): string {
  return join(addonConfig.featuredPoints.map((key) =>
    `<li>${tDynamic(`addon.downloads.featured.points.${key}`)}</li>`), '            ');
}

function addonVersion(): string {
  const { version, date, dateFormat } = addonConfig.release;
  const formatted = new Intl.DateTimeFormat(siteConfig.lang, dateFormat).format(new Date(date));
  return t('addon.downloads.version', { version: escapeHtml(version), date: escapeHtml(formatted) });
}

function addonPlatforms(): string {
  return join(addonConfig.downloads.platforms.map((p) => `<article class="gp-platform">
          <h4>${tx(`addon.downloads.platforms.${p.key}.name`)}</h4>
          <p>${tx(`addon.downloads.platforms.${p.key}.detail`)}</p>
          <a href="${escapeHtml(p.pack)}">${tx('addon.downloads.downloadPack')}</a>
        </article>`), '\n        ');
}

function addonCompanionLinks(): string {
  const links = addonConfig.downloads.platforms.map((p) =>
    `<a href="${escapeHtml(p.companion)}">${tx(`addon.downloads.platforms.${p.key}.short`)}</a>`);
  return join(links.map((l, i) => (i < links.length - 1 ? `${l}${tx('addon.downloads.linkSeparator')}` : l)), '            ');
}

function addonTabs(): string {
  return join(addonConfig.install.map((tab) =>
    `<a class="gp-tab" href="${escapeHtml(anchor(tab.id))}">${tx(`addon.install.panels.${tab.key}.tab`)}</a>`), '          ');
}

function addonInstallPanels(): string {
  return join(addonConfig.install.map((tab) => {
    const base = `addon.install.panels.${tab.key}`;
    const offset = 'offsetToken' in tab ? `margin-top:var(${tab.offsetToken});` : undefined;
    const steps = tab.steps.map((s) => `<li>${tDynamic(`${base}.steps.${s}`)}</li>`);
    const note = tab.note ? `\n            <p>${tDynamic(`${base}.note`)}</p>` : '';
    return `<article${attrs({ class: 'gp-install-content', id: tab.id, style: offset })}>
            <h3>${tx(`${base}.title`)}</h3>
            <ol>
              ${join(steps, '              ')}
            </ol>${note}
          </article>`;
  }), '\n          ');
}

function addonCommands(): string {
  return join(addonConfig.discordCommands.map((key) =>
    `<p class="gp-command"><code>${tx(`addon.discord.commands.${key}.command`)}</code> ${tx(`addon.discord.commands.${key}.text`)}</p>`), '        ');
}

function addonFaq(): string {
  return join(addonConfig.faq.map((key) => `<details class="gp-command">
          <summary>${tx(`addon.faq.items.${key}.question`)}</summary>
          <p>
            ${tDynamic(`addon.faq.items.${key}.answer`)}
          </p>
        </details>`), '\n        ');
}

export const addonPartials: PartialRegistry = {
  addonCfg,
  addonMeta,
  addonNav,
  addonArtRows,
  addonFeatureCards,
  addonSeparateNumber,
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

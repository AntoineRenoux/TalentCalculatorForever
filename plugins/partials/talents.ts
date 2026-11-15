/** Partiels de la page du calculateur : onglets de l'outil, barre d'outils, champ de recherche, redirection des anciens liens. */
import { siteConfig } from '../../config/site.config.ts';
import { talentsConfig } from '../../config/talents.config.ts';
import { classes } from '../../src/data/index.ts';
import { t, tDynamic } from '../../src/shared/i18n.ts';
import { attrs, escapeHtml } from '../html/escape.ts';
import { iconSvg, type IconName } from '../../config/icons.config.ts';
import type { PartialArgs, PartialRegistry } from '../html/types.ts';

function toolTabs(): string {
  return `<nav class="tabs" aria-label="${escapeHtml(t('talents.tabs.ariaLabel'))}">
        <a class="tab on" id="tabCalc" data-tab="calc" href="#">${escapeHtml(t('talents.tabs.calc'))}</a>
        <a class="tab" data-tab="${escapeHtml(talentsConfig.hash.armory)}" href="#${escapeHtml(talentsConfig.hash.armory)}">${escapeHtml(t('talents.tabs.armory'))}</a>
      </nav>`;
}

function iconButton(id: string, titleKey: string, icon: IconName, className = 'icon-btn'): string {
  const label = tDynamic(titleKey);
  return `<button type="button"${attrs({ class: className || undefined, id, title: label, 'aria-label': label })}>${iconSvg(icon)}</button>`;
}

function toolbar(): string {
  const { minLevel, maxLevel } = talentsConfig.rules;
  return `<section class="toolbar">
      <nav class="class-bar" id="classBar" aria-label="${escapeHtml(t('talents.toolbar.classesAria'))}"></nav>
      <div class="tools">
        <div class="level">
          ${iconButton('lvlDown', 'talents.toolbar.levelDown', 'minus', '')}
          <input type="number" id="level"${attrs({ min: minLevel, max: maxLevel, value: maxLevel, 'aria-label': t('talents.toolbar.levelAria') })}>
          ${iconButton('lvlUp', 'talents.toolbar.levelUp', 'plus', '')}
        </div>
        ${iconButton('removeMode', 'talents.toolbar.removeMode', 'eraser')}
        ${iconButton('resetAll', 'talents.toolbar.resetAll', 'reset')}
        ${iconButton('copyLink', 'talents.toolbar.copyLink', 'link')}
      </div>
    </section>`;
}

/** {{> searchBox id=… placeholder=<clé> small=true}} */
function searchBox({ named }: PartialArgs): string {
  const { id, placeholder, small } = named;
  if (!id || !placeholder) throw new Error('searchBox : id et placeholder sont requis');
  return `<label class="search${small ? ' small' : ''}">
            ${iconSvg('search')}
            <input type="search"${attrs({ id, placeholder: tDynamic(placeholder) })}>
          </label>`;
}

/**
 * Script du <head> de l'accueil : les anciens liens du calculateur (/#mage/…, /#armory…)
 * sont renvoyés vers la page du calculateur.
 */
function legacyRedirect(): string {
  const keys = [...classes.map((c) => c.key), talentsConfig.hash.armory].join('|');
  const target = JSON.stringify(siteConfig.pages.talents.file);
  return `<script>if(/^#(${keys})\\b/.test(location.hash))location.replace(${target}+location.hash);</script>`;
}

/** {{> icon nom}} : icône SVG décorative. */
function icon({ positional }: PartialArgs): string {
  const [name] = positional;
  if (!name) throw new Error('icon : nom manquant');
  return iconSvg(name as IconName);
}

/** {{> talentsCfg chemin}} : valeur de config/talents.config.ts. */
function talentsCfg({ positional }: PartialArgs): string {
  const [path] = positional;
  if (!path) throw new Error('talentsCfg : chemin manquant');
  const value = path.split('.').reduce<unknown>((n, k) => (n && typeof n === 'object' ? (n as Record<string, unknown>)[k] : undefined), talentsConfig);
  if (value === undefined) throw new Error(`talentsCfg : réglage inconnu « ${path} »`);
  return escapeHtml(value);
}

export const talentsPartials: PartialRegistry = { toolTabs, toolbar, searchBox, legacyRedirect, icon, talentsCfg };

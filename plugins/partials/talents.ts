/** Partiels de la page du calculateur : onglets de l'outil, barre d'outils, champ de recherche, redirection des anciens liens. */
import { siteConfig } from '../../config/site.config.ts';
import { talentsConfig } from '../../config/talents.config.ts';
import { classes } from '../../src/data/index.ts';
import { t, tDynamic } from '../../src/shared/i18n.ts';
import { attrs, escapeHtml } from '../html/escape.ts';
import type { PartialArgs, PartialRegistry } from '../html/types.ts';

function toolTabs(): string {
  return `<nav class="tabs" aria-label="${escapeHtml(t('talents.tabs.ariaLabel'))}">
        <a class="tab on" id="tabCalc" data-tab="calc" href="#">${escapeHtml(t('talents.tabs.calc'))}</a>
        <a class="tab" data-tab="${escapeHtml(talentsConfig.hash.armory)}" href="#${escapeHtml(talentsConfig.hash.armory)}">${escapeHtml(t('talents.tabs.armory'))}</a>
      </nav>`;
}

function iconButton(id: string, titleKey: string, iconKey: string, className = 'icon-btn'): string {
  return `<button type="button"${attrs({ class: className || undefined, id, title: tDynamic(titleKey) })}>${escapeHtml(tDynamic(iconKey))}</button>`;
}

function toolbar(): string {
  const { minLevel, maxLevel } = talentsConfig.rules;
  return `<section class="toolbar">
      <nav class="class-bar" id="classBar" aria-label="${escapeHtml(t('talents.toolbar.classesAria'))}"></nav>
      <div class="tools">
        <div class="level">
          ${iconButton('lvlDown', 'talents.toolbar.levelDown', 'talents.toolbar.levelDownIcon', '')}
          <input type="number" id="level"${attrs({ min: minLevel, max: maxLevel, value: maxLevel, 'aria-label': t('talents.toolbar.levelAria') })}>
          ${iconButton('lvlUp', 'talents.toolbar.levelUp', 'talents.toolbar.levelUpIcon', '')}
        </div>
        ${iconButton('removeMode', 'talents.toolbar.removeMode', 'talents.toolbar.removeModeIcon')}
        ${iconButton('resetAll', 'talents.toolbar.resetAll', 'talents.toolbar.resetAllIcon')}
        ${iconButton('copyLink', 'talents.toolbar.copyLink', 'talents.toolbar.copyLinkIcon')}
      </div>
    </section>`;
}

/** {{> searchBox id=… placeholder=<clé> icon=<clé> small=true}} */
function searchBox({ named }: PartialArgs): string {
  const { id, placeholder, icon, small } = named;
  if (!id || !placeholder || !icon) throw new Error('searchBox : id, placeholder et icon sont requis');
  return `<label class="search${small ? ' small' : ''}">
            <span aria-hidden="true">${escapeHtml(tDynamic(icon))}</span>
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

export const talentsPartials: PartialRegistry = { toolTabs, toolbar, searchBox, legacyRedirect };

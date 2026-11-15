/** Partiels des pages de la guilde (accueil, recrutement) : fiche, postes, étapes, champs du formulaire. */
import { homeConfig } from '../../config/home.config.ts';
import { recruitmentConfig, type RecruitmentField } from '../../config/recruitment.config.ts';
import { recruitmentPageConfig, type RecruitmentPost } from '../../config/recruitment-page.config.ts';
import { hasKey, t, tDynamic, type Params } from '../../src/shared/i18n.ts';
import { attrs, escapeHtml } from '../html/escape.ts';
import { configValue } from '../html/render.ts';
import type { PartialArgs, PartialRegistry } from '../html/types.ts';

/**
 * Texte dont les paramètres sont des valeurs de configuration :
 * {{> tcfg home.hero.devise year=guild.foundedYear}} → t('home.hero.devise', { year: siteConfig.guild.foundedYear }).
 */
function tcfg(args: PartialArgs): string {
  const [key] = args.positional;
  if (!key) throw new Error('partiel tcfg : clé de texte manquante');
  const params: Params = {};
  for (const [name, path] of Object.entries(args.named)) params[name] = String(configValue(path));
  return escapeHtml(tDynamic(key, params));
}

/** Fiche de la guilde (accueil). */
function guildSheet(): string {
  const rows = homeConfig.sheetRows
    .map((id) => `<div><dt>${escapeHtml(tDynamic(`home.sheet.rows.${id}.term`))}</dt><dd>${escapeHtml(tDynamic(`home.sheet.rows.${id}.value`))}</dd></div>`)
    .join('\n            ');
  return `<dl class="fiche">
            ${rows}
          </dl>`;
}

function postIcon(post: RecruitmentPost): string {
  const icon = recruitmentPageConfig.icons[post.icon];
  if (!icon) throw new Error(`partiel recruitmentPosts : icône inconnue « ${post.icon} »`);
  const { iconViewBox, iconStroke, iconStrokeWidth } = recruitmentPageConfig;
  return `<svg${attrs({ class: 'pion', viewBox: iconViewBox, 'aria-hidden': 'true' })}>
          <path${attrs({ d: icon.d, fill: 'none', stroke: iconStroke, 'stroke-width': iconStrokeWidth, 'stroke-linecap': icon.linecap })}/>
        </svg>`;
}

/** Liste des postes ouverts (recrutement). */
function recruitmentPosts(): string {
  const items = recruitmentPageConfig.posts.map((post: RecruitmentPost) => `<li>
        ${postIcon(post)}
        <span>
          <span class="poste-nom">${escapeHtml(tDynamic(`recruitment.posts.items.${post.id}.name`))}</span>
          <span class="poste-det">${escapeHtml(tDynamic(`recruitment.posts.items.${post.id}.detail`))}</span>
        </span>
        <span class="statut ${escapeHtml(recruitmentPageConfig.statusClass[post.status])}">${escapeHtml(t(`recruitment.posts.status.${post.status}`))}</span>
      </li>`);
  return `<ul class="postes">
      ${items.join('\n\n      ')}
    </ul>`;
}

/** Étapes « Comment ça se passe » (recrutement). */
function recruitmentSteps(): string {
  const items = recruitmentPageConfig.steps.map((id) => `<li>
        <div>
          <h3>${escapeHtml(tDynamic(`recruitment.steps.items.${id}.title`))}</h3>
          <p>${escapeHtml(tDynamic(`recruitment.steps.items.${id}.text`))}</p>
        </div>
      </li>`);
  return `<ol class="etapes prose">
      ${items.join('\n\n      ')}
    </ol>`;
}

function optionalText(key: string): string | undefined {
  return hasKey(key) ? tDynamic(key) : undefined;
}

function fieldControl(field: RecruitmentField): string {
  const base = { id: field.id, name: field.id };
  const placeholder = optionalText(`recruitment.form.fields.${field.id}.placeholder`);
  switch (field.kind) {
    case 'select': {
      if (!field.optionsKey || !field.options) throw new Error(`options manquantes pour le champ ${field.id}`);
      const optionsKey = field.optionsKey;
      const options = field.options
        .map((o) => `<option>${escapeHtml(tDynamic(`recruitment.form.options.${optionsKey}.${o}`))}</option>`)
        .join('\n            ');
      return `<select${attrs({ ...base, required: field.required })}>
            <option value="">${escapeHtml(placeholder ?? '')}</option>
            ${options}
          </select>`;
    }
    case 'textarea':
      return `<textarea${attrs({ ...base, required: field.required, placeholder })}></textarea>`;
    default:
      return `<input${attrs({ ...base, type: field.kind, required: field.required, placeholder })}>`;
  }
}

function fieldBlock(field: RecruitmentField): string {
  const label = escapeHtml(tDynamic(`recruitment.form.fields.${field.id}.label`));
  const optional = field.required ? '' : `\n            <span class="opt">${escapeHtml(t('recruitment.form.optional'))}</span>\n          `;
  const help = optionalText(`recruitment.form.fields.${field.id}.help`);
  return `<div class="champ${field.wide ? ' large' : ''}">
          <label for="${escapeHtml(field.id)}">${label}${optional}</label>
          ${fieldControl(field)}${help ? `\n          <span class="aide">${escapeHtml(help)}</span>` : ''}
        </div>`;
}

/** Champs du formulaire de candidature, générés depuis config/recruitment.config.ts. */
function recruitmentFields(): string {
  const fields: readonly RecruitmentField[] = recruitmentConfig.fields;
  return `<div class="grille">

        ${fields.map(fieldBlock).join('\n\n        ')}

      </div>`;
}


/** {{> homeCfg chemin}} : valeur de config/home.config.ts. */
function homeCfg({ positional }: PartialArgs): string {
  const [path] = positional;
  if (!path) throw new Error('homeCfg : chemin manquant');
  const value = path.split('.').reduce<unknown>((n, k) => (n && typeof n === 'object' ? (n as Record<string, unknown>)[k] : undefined), homeConfig);
  if (value === undefined) throw new Error(`homeCfg : réglage inconnu « ${path} »`);
  return escapeHtml(value);
}

/** Phrase d'accroche de l'accueil : chaque emplacement devient un petit écu rempli par un avatar de membre. */
function homeStatement(): string {
  const parts = t('home.statement').split(homeConfig.statementSlot);
  const html = parts.map((part, i) => escapeHtml(part) + (i < parts.length - 1
    ? `<span class="ecu-vignette" data-statement-slot="${i}"><img alt="${escapeHtml(t('home.statementSlotAlt'))}" width="64" height="77" hidden></span>`
    : '')).join('');
  return `<p class="accueil-phrase-texte">${html}</p>`;
}

/** Quatre champs de couleur : une semaine de la guilde. */
function homeWeek(): string {
  const fields = homeConfig.weekFields.map((id, i) => `<div class="semaine-champ" data-reveal>
        <div class="ecu-cadre semaine-ecu"><img data-week-render="${i}" alt="" width="240" height="288" loading="lazy" hidden></div>
        <p class="semaine-clause">${escapeHtml(tDynamic(`home.week.fields.${id}.clause`))}</p>
        <p class="semaine-texte">${escapeHtml(tDynamic(`home.week.fields.${id}.text`))}</p>
      </div>`);
  return `<div class="wrap semaine-tete" data-reveal><h2 id="titre-semaine">${escapeHtml(t('home.week.title'))}</h2></div>
    <div class="semaine-champs">
      ${fields.join('\n      ')}
    </div>`;
}

/** {{> memberStrip zone=recruitment}} : bande de personnages de la guilde (rendus en écu, remplis par le JS). */
function memberStrip({ named }: PartialArgs): string {
  const { zone } = named;
  if (!zone) throw new Error('memberStrip : zone manquante');
  const items = Array.from({ length: homeConfig.strip.count }, () => `<li><figure>
          <div class="ecu-cadre"><img alt="" width="240" height="288" loading="lazy" hidden></div>
          <figcaption><span class="bande-nom"></span><span class="bande-info"></span></figcaption>
        </figure></li>`).join('\n        ');
  return `<section class="bande-membres" aria-labelledby="titre-bande">
    <div class="wrap bande-membres-tete" data-reveal>
      <h2 id="titre-bande">${escapeHtml(tDynamic(`${zone}.strip.title`))}</h2>
      <p>${escapeHtml(tDynamic(`${zone}.strip.text`))}</p>
    </div>
    <ul class="wrap bande-membres-liste" data-reveal data-member-strip>
        ${items}
    </ul>
  </section>`;
}

export const guildPartials: PartialRegistry = {
  memberStrip,
  tcfg,
  guildSheet,
  recruitmentPosts,
  recruitmentSteps,
  recruitmentFields,
  homeCfg,
  homeStatement,
  homeWeek,
};

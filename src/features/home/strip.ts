/** Bande de personnages de la guilde (pages recrutement et boss) : rendus des membres de plus haut niveau. */
import { homeConfig } from '../../../config/home.config.ts';
import { classes } from '../../data/index.ts';
import { t } from '../../shared/i18n.ts';
import { loadGuild } from '../armory/api.ts';

const { avatarSuffix, renderSuffix } = homeConfig.roster;
const STRIP = '[data-member-strip]';

export async function initMemberStrip(): Promise<void> {
  const strip = document.querySelector<HTMLElement>(STRIP);
  if (!strip) return;
  try {
    const guild = await loadGuild();
    const members = guild.members.filter((m) => m.avatar).sort((a, b) => b.level - a.level);
    strip.querySelectorAll('li').forEach((li, i) => {
      const m = members[i];
      const img = li.querySelector('img');
      if (!m?.avatar || !img) { li.hidden = true; return; }
      img.src = m.avatar.replace(avatarSuffix, renderSuffix);
      img.alt = t('home.roster.previewAlt', { name: m.name });
      img.hidden = false;
      const name = li.querySelector('.bande-nom');
      const info = li.querySelector('.bande-info');
      if (name) name.textContent = `${m.name} ${m.surname}`;
      if (info) info.textContent = t('home.roster.stripMember', { level: m.level, className: classes.find((c) => c.key === m.classKey)?.name ?? '' });
    });
  } catch {
    strip.closest('section')?.setAttribute('hidden', '');
  }
}

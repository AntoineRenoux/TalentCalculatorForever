// Relais des candidatures vers Discord : le webhook reste côté serveur (variable DISCORD_WEBHOOK_URL).
import { recruitmentConfig } from '../../config/recruitment.config.ts';
import { serverConfig } from '../../config/server.config.ts';
import { siteConfig } from '../../config/site.config.ts';
import { t, tDynamic } from './i18n.ts';

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL || '';
const { http } = serverConfig;
const rules = serverConfig.recruitment;
const PER_IP_DELAY = recruitmentConfig.serverPerIpCooldownMinutes * rules.minuteMs;
const REQUIRED = recruitmentConfig.fields.filter((f) => f.serverRequired).map((f) => f.id);

const lastByIp = new Map<string | undefined, number>();
let recent: number[] = [];

export class FormError extends Error {
  readonly status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

type Candidature = Record<string, string>;

function clean(body: unknown): Candidature {
  if (!body || typeof body !== 'object') throw new FormError(http.badRequest, t('recruitment.unreadable'));
  const input = body as Record<string, unknown>;
  const c: Candidature = {};
  for (const { id, maxLength } of recruitmentConfig.fields) {
    const raw = input[id];
    const v = typeof raw === 'string' ? raw.trim() : '';
    c[id] = v.slice(0, maxLength);
  }
  const missing = REQUIRED.filter((k) => !c[k]);
  if (missing.length) {
    throw new FormError(http.badRequest, t('recruitment.missingFields', { fields: missing.join(t('recruitment.missingFieldsSeparator')) }));
  }
  const url = recruitmentConfig.urlFieldId;
  if (c[url] && !rules.urlPattern.test(c[url])) c[url] = '';
  return c;
}

interface DiscordField { name: string; value: string; inline?: boolean }

export async function submitCandidature(body: unknown, ip: string | undefined): Promise<void> {
  if (!WEBHOOK) throw new FormError(http.unavailable, t('recruitment.notConfigured'));
  const now = Date.now();
  if (now - (lastByIp.get(ip) || 0) < PER_IP_DELAY) throw new FormError(http.tooManyRequests, t('recruitment.ipCooldown'));
  recent = recent.filter((ts) => now - ts < rules.globalWindowMs);
  if (recent.length >= recruitmentConfig.serverMaxPerHour) throw new FormError(http.tooManyRequests, t('recruitment.globalLimit'));

  const c = clean(body);
  const { discord } = recruitmentConfig;
  const guild = siteConfig.guild.name;
  const fields = rules.embedFields.map((f): DiscordField => {
    const field: DiscordField = {
      name: tDynamic(`discord.fields.${f.id}`),
      value: c[f.id] || tDynamic(`discord.empty.${f.empty}`),
    };
    if ('inline' in f) field.inline = f.inline;
    return field;
  });
  const embed = {
    title: t('discord.title', { name: c[recruitmentConfig.titleFieldId] ?? '' }).slice(0, discord.titleMaxLength),
    color: discord.embedColor,
    fields,
    footer: { text: t('discord.footer', { guild }) },
    timestamp: new Date().toISOString(),
  };

  const r = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: t('discord.username', { guild }), allowed_mentions: { parse: discord.allowedMentions }, embeds: [embed] }),
  });
  if (!r.ok) throw new FormError(http.badGateway, t('recruitment.discordRefused', { status: r.status }));
  lastByIp.set(ip, now);
  recent.push(now);
}

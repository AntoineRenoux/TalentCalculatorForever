// Relais des candidatures vers Discord : le webhook reste côté serveur (variable DISCORD_WEBHOOK_URL).
const WEBHOOK = process.env.DISCORD_WEBHOOK_URL || '';
const EMBED_COLOR = 0x2f63ad;
const PER_IP_DELAY = 10 * 60 * 1000;   // une candidature par IP toutes les 10 min
const GLOBAL_PER_HOUR = 30;            // garde-fou contre le spam

const FIELDS = {
  prenom: 100, pseudo: 100, classe: 60, spe: 60, role: 60, discord: 100, logs: 300, motivation: 1000, experience: 1000,
};
const REQUIRED = ['pseudo', 'discord', 'motivation'];

const lastByIp = new Map();
let recent = [];

export class FormError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function clean(body) {
  if (!body || typeof body !== 'object') throw new FormError(400, 'Candidature illisible.');
  const c = {};
  for (const [key, max] of Object.entries(FIELDS)) {
    const v = typeof body[key] === 'string' ? body[key].trim() : '';
    c[key] = v.slice(0, max);
  }
  const missing = REQUIRED.filter((k) => !c[k]);
  if (missing.length) throw new FormError(400, `Champs manquants : ${missing.join(', ')}`);
  if (c.logs && !/^https?:\/\//i.test(c.logs)) c.logs = '';
  return c;
}

export async function submitCandidature(body, ip) {
  if (!WEBHOOK) throw new FormError(503, 'Envoi automatique non configuré sur ce site.');
  const now = Date.now();
  if (now - (lastByIp.get(ip) || 0) < PER_IP_DELAY) throw new FormError(429, 'Une candidature vient déjà de partir, réessaie plus tard.');
  recent = recent.filter((t) => now - t < 3600_000);
  if (recent.length >= GLOBAL_PER_HOUR) throw new FormError(429, 'Trop de candidatures en ce moment, réessaie plus tard.');

  const c = clean(body);
  const embed = {
    title: `📋 Nouvelle candidature — ${c.pseudo}`.slice(0, 256),
    color: EMBED_COLOR,
    fields: [
      { name: 'Prénom IRL', value: c.prenom || '—', inline: true },
      { name: 'Pseudo en jeu', value: c.pseudo, inline: true },
      { name: 'Pseudo Discord', value: c.discord, inline: true },
      { name: 'Classe', value: c.classe || '—', inline: true },
      { name: 'Spécialisation', value: c.spe || '—', inline: true },
      { name: 'Rôle visé', value: c.role || '—', inline: true },
      { name: 'Logs / armurerie', value: c.logs || 'Non renseigné', inline: false },
      { name: 'Pourquoi nous rejoindre', value: c.motivation },
      { name: 'Expérience en jeu', value: c.experience || '—' },
    ],
    footer: { text: 'Candidature envoyée depuis le site Former Hope' },
    timestamp: new Date().toISOString(),
  };

  const r = await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Recrutement Former Hope', allowed_mentions: { parse: [] }, embeds: [embed] }),
  });
  if (!r.ok) throw new FormError(502, `Discord a refusé l’envoi (HTTP ${r.status}).`);
  lastByIp.set(ip, now);
  recent.push(now);
}

/**
 * Nettoyage des descriptions venant de la source de données (HTML externe) :
 * on ne garde que les retours à la ligne et la couleur des <span> ; tout le reste est retiré ou échappé.
 */
const COMMENT = /<!--[\s\S]*?-->/g;
const TAG_SPLIT = /(<[^>]+>)/g;
const BARE_AMPERSAND = /&(?!(?:[a-z]+|#\d+);)/gi;
const SPAN_COLOR = /^<span[^>]*color:\s*(#[0-9a-f]{3,8})/i;

export function cleanDescription(html: string): string {
  return html
    .replace(COMMENT, '')
    .split(TAG_SPLIT)
    .map((part) => {
      if (!part.startsWith('<')) return part.replace(BARE_AMPERSAND, '&amp;');
      if (/^<br\s*\/?>$/i.test(part)) return '<br>';
      if (/^<\/span>$/i.test(part)) return '</span>';
      const color = SPAN_COLOR.exec(part);
      if (color) return `<span style="color:${color[1]}">`;
      if (/^<span/i.test(part)) return '<span>';
      if (/^<\/?(tr|table)/i.test(part)) return '<br>';
      if (/^<td/i.test(part)) return ' ';
      return '';
    })
    .join('');
}

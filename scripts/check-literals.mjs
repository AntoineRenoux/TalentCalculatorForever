// Vérifie qu'aucun texte destiné aux visiteurs n'est écrit en dur dans le code TypeScript.
// Un littéral est signalé s'il ressemble à du langage naturel : lettre accentuée,
// ou au moins deux mots séparés par une espace (« Points restants »).
// Les fichiers de textes (locales), de config et de données sont exclus.
// Exception ponctuelle : ajouter le commentaire « i18n-ignore » sur la ligne.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

const ROOTS = ['src', 'plugins', 'server/src'];
const EXCLUDED = [/[\\/]locales[\\/]/, /[\\/]data[\\/]/, /[\\/]config[\\/]/];
const NATURAL = [/[À-ÿ]/, /[A-Za-z]{2,}[,.!?;:]?\s+[A-Za-z]{2,}/];
const PRAGMA = 'i18n-ignore';

/** Retire le balisage HTML (balises complètes, et morceaux de balise coupés par un \${…}). */
function visibleText(value) {
  return value
    .replace(/<[^>]*>/g, ' ')        // balises complètes
    .replace(/^[^<]*?>/, ' ')        // fin de balise ouverte avant ce morceau
    .replace(/<[^>]*$/, ' ');        // début de balise fermée après ce morceau
}

/** Sélecteur CSS ou liste de classes (« .render img », « row talent-pt ») : du code, pas du texte. */
const HTML_TAGS = new Set(['a', 'b', 'img', 'li', 'ul', 'ol', 'p', 'div', 'span', 'button', 'input', 'select', 'label', 'section', 'header', 'footer', 'nav', 'main', 'dl', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4']);
function looksLikeSelector(value) {
  const tokens = value.trim().split(/\s+/);
  const ident = /^[.#]?[a-z][\w-]*(\[[^\]]*\])?(:{1,2}[\w-]+(\([^)]*\))?)*$/;
  if (!tokens.every((tk) => ident.test(tk) || tk === '>')) return false;
  return tokens.some((tk) => /^[.#]/.test(tk) || tk.includes('-') || HTML_TAGS.has(tk));
}

function walk(dir) {
  let out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (p.endsWith('.ts') && !EXCLUDED.some((re) => re.test(p))) out.push(p);
  }
  return out;
}

const problems = [];
for (const file of ROOTS.flatMap(walk)) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const check = (node, value) => {
    const text = visibleText(value);
    if (looksLikeSelector(text) || !NATURAL.some((re) => re.test(text))) return;
    const { line } = source.getLineAndCharacterOfPosition(node.getStart());
    if (lines[line]?.includes(PRAGMA)) return;
    // Les chaînes d'import et les messages d'erreur destinés aux développeurs (throw new Error) sont tolérés.
    const parent = node.parent;
    if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) return;
    let owner = parent;
    while (owner && (ts.isTemplateSpan(owner) || ts.isTemplateExpression(owner))) owner = owner.parent;
    if (owner && ts.isNewExpression(owner) && owner.expression.getText() === 'Error') return;
    problems.push(`${relative(process.cwd(), file)}:${line + 1}  « ${value.trim().slice(0, 70)} »`);
  };
  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) check(node, node.text);
    else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) check(node, node.text);
    ts.forEachChild(node, visit);
  };
  visit(source);
}

if (problems.length) {
  console.error(`Textes en dur trouvés (${problems.length}) — à déplacer dans src/locales :\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('check-literals : aucun texte en dur.');

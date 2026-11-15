/**
 * État du calculateur et règles du jeu :
 * - un point par niveau à partir de rules.minLevel ;
 * - chaque rangée d'un arbre demande rules.pointsPerRow points de plus dans cet arbre ;
 * - certains talents exigent un autre talent à un rang donné (flèches).
 */
import { talentsConfig } from '../../../config/talents.config.ts';
import { classes, leveling, type ClassData, type Talent, type Tree } from '../../data/index.ts';

const { minLevel, maxLevel, pointsPerRow, pointsPerLevel } = talentsConfig.rules;

export interface TalentRef { talent: Talent; tree: Tree; treeIndex: number }

/** Index de tous les talents par id. */
export const talentIndex = new Map<number, TalentRef>();
classes.forEach((c) => c.trees.forEach((tree, treeIndex) => tree.talents.forEach((talent) => talentIndex.set(talent.id, { talent, tree, treeIndex }))));

export const findClass = (key: string): ClassData | undefined => classes.find((c) => c.key === key);
export const allowedRaces = (c: ClassData): number[] => leveling.classes[c.key]?.races ?? [];

export const state = {
  cls: null as ClassData | null,
  /** id talent → rang investi */
  ranks: new Map<number, number>(),
  /** ids des talents dans l'ordre où les points ont été mis */
  order: [] as number[],
  level: maxLevel as number,
  removeMode: false,
  race: null as number | null,
};

// ---------- Abonnement aux changements ----------
type Listener = () => void;
const listeners = new Set<Listener>();
export const onChange = (fn: Listener): void => { listeners.add(fn); };
export const notify = (): void => listeners.forEach((fn) => fn());

// ---------- Calculs ----------
export const rankOf = (id: number): number => state.ranks.get(id) ?? 0;
export const treePoints = (tree: Tree): number => tree.talents.reduce((s, t) => s + rankOf(t.id), 0);
export const spent = (): number => (state.cls ? state.cls.trees.reduce((s, tr) => s + treePoints(tr), 0) : 0);
export const available = (): number => (state.level - minLevel + 1) * pointsPerLevel;
export const remaining = (): number => available() - spent();
export const requiredLevel = (): number | null => (spent() ? Math.ceil(spent() / pointsPerLevel) + minLevel - 1 : null);
export const pointsForRow = (row: number): number => row * pointsPerRow;

export const prereqsMet = (t: Talent): boolean => t.req.every(([id, qty]) => rankOf(id) >= qty);
export const tierMet = (t: Talent, tree: Tree): boolean => treePoints(tree) >= pointsForRow(t.r);
export const canAdd = (t: Talent, tree: Tree): boolean =>
  remaining() > 0 && rankOf(t.id) < t.max && tierMet(t, tree) && prereqsMet(t);

/** Un arbre est valide si chaque talent investi respecte les points des rangées au-dessus et ses prérequis. */
function treeValid(tree: Tree): boolean {
  return tree.talents.every((t) => {
    if (!rankOf(t.id)) return true;
    const above = tree.talents.reduce((s, o) => s + (o.r < t.r ? rankOf(o.id) : 0), 0);
    return above >= pointsForRow(t.r) && prereqsMet(t);
  });
}

export function canRemove(t: Talent, tree: Tree): boolean {
  const r = rankOf(t.id);
  if (!r) return false;
  state.ranks.set(t.id, r - 1);
  const ok = treeValid(tree);
  state.ranks.set(t.id, r);
  return ok;
}

export function addPoint(t: Talent, tree: Tree): boolean {
  if (!canAdd(t, tree)) return false;
  state.ranks.set(t.id, rankOf(t.id) + 1);
  state.order.push(t.id);
  return true;
}

export function removePoint(t: Talent, tree: Tree): boolean {
  if (!canRemove(t, tree)) return false;
  const r = rankOf(t.id) - 1;
  if (r) state.ranks.set(t.id, r); else state.ranks.delete(t.id);
  const i = state.order.lastIndexOf(t.id);
  if (i >= 0) state.order.splice(i, 1);
  return true;
}

export function resetTree(tree: Tree): void {
  const ids = new Set(tree.talents.map((t) => t.id));
  ids.forEach((id) => state.ranks.delete(id));
  state.order = state.order.filter((id) => !ids.has(id));
}

export function resetAll(): void {
  state.ranks.clear();
  state.order = [];
}

export const clampLevel = (level: number): number => Math.max(minLevel, Math.min(maxLevel, level));

/** Données du jeu (talents, sorts, races), typées. Extraites de Wowhead (WoW Forever, FR). */
import talentsJson from './talents.json';
import levelingJson from './leveling.json';

/** [id du talent prérequis, rang requis] */
export type Requirement = [number, number];

export interface Talent {
  id: number;
  /** Rangée et colonne dans la grille (à partir de 0). */
  r: number;
  c: number;
  icon: string;
  name: string;
  max: number;
  spells: number[];
  req: Requirement[];
  /** Description de chaque rang (HTML de la source, nettoyé à l'affichage). */
  desc: string[];
  /** Identifiant « définition » utilisé par l'API Blizzard. */
  def: number;
}

export interface Tree { id: number; name: string; icon: string; talents: Talent[] }
export interface ClassData { key: string; name: string; color: string; trees: Tree[] }

export type ChangeKind = 'introduced' | 'nowTrainable' | 'changedLevels';

export interface ClassSpell {
  id: number;
  /** Niveau d'apprentissage. */
  l: number;
  /** Identifiant d'école (skill). */
  s: number;
  race?: number;
  ch?: ChangeKind;
}

export interface LevelingClass {
  schools: number[];
  spells: ClassSpell[];
  races: number[];
  racials: Record<string, number[]>;
}

/** [nom, rang, icône, description] */
export type SpellTuple = [string, string, string, string];

export interface LevelingData {
  classes: Record<string, LevelingClass>;
  races: Record<string, { name: string; icon: string | null }>;
  schools: Record<string, { name: string; icon: string }>;
  spells: Record<string, SpellTuple>;
}

export const classes = talentsJson as unknown as ClassData[];
export const leveling = levelingJson as unknown as LevelingData;

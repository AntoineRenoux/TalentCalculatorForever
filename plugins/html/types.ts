/** Contrat des partiels : fonctions qui produisent du HTML à la compilation. */
export interface PartialArgs {
  /** Arguments nommés : {{> header page=home}} → { page: 'home' }. */
  named: Record<string, string>;
  /** Arguments positionnels : {{> sheet home.sheet}} → ['home.sheet']. */
  positional: string[];
}

export type Partial = (args: PartialArgs) => string;
export type PartialRegistry = Record<string, Partial>;

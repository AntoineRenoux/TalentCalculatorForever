/** Message bref en bas de l'écran (élément #toast du gabarit). */
import { talentsConfig } from '../../config/talents.config.ts';
import { byId } from './dom.ts';

let timer = 0;

export function toast(message: string): void {
  const node = byId('toast');
  node.textContent = message;
  node.hidden = false;
  clearTimeout(timer);
  timer = window.setTimeout(() => { node.hidden = true; }, talentsConfig.toastMs);
}

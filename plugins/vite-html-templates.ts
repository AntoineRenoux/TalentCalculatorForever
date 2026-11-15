/**
 * Plugin Vite : remplace les marqueurs des gabarits HTML (src/pages) par les textes et la config.
 * En développement, les modules sont rechargés à chaque requête pour refléter les modifications
 * des textes, de la config et des partiels sans redémarrer.
 */
import { fileURLToPath } from 'node:url';
import type { Plugin, ViteDevServer } from 'vite';
import { renderTemplate } from './html/render.ts';
import { partials as builtPartials } from './partials/index.ts';
import type { PartialRegistry } from './html/types.ts';

const RENDER_MODULE = fileURLToPath(new URL('./html/render.ts', import.meta.url));
const PARTIALS_MODULE = fileURLToPath(new URL('./partials/index.ts', import.meta.url));
const WATCHED = /[\\/](config|src[\\/]locales|plugins)[\\/]/;

export function htmlTemplates(): Plugin {
  let server: ViteDevServer | undefined;
  return {
    name: 'former-hope-html-templates',
    configureServer(s) {
      server = s;
      // Les textes et la config ne sont pas des modules du navigateur : recharger la page entière.
      s.watcher.on('change', (file) => {
        if (WATCHED.test(file)) s.ws.send({ type: 'full-reload' });
      });
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        if (!server) return renderTemplate(html, builtPartials);
        const render = (await server.ssrLoadModule(RENDER_MODULE)) as typeof import('./html/render.ts');
        const { partials } = (await server.ssrLoadModule(PARTIALS_MODULE)) as { partials: PartialRegistry };
        return render.renderTemplate(html, partials);
      },
    },
  };
}

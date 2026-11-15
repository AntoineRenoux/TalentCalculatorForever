import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import postcssCustomMedia from 'postcss-custom-media';
import { buildConfig } from './config/build.config.ts';
import { siteConfig } from './config/site.config.ts';
import { htmlTemplates } from './plugins/vite-html-templates.ts';

const here = (...p: string[]) => resolve(import.meta.dirname, ...p);
const pagesDir = here(buildConfig.pagesDir);

/** Une entrée par page, avec les mêmes noms de fichier qu'avant la migration. */
const input = Object.fromEntries(
  Object.entries(siteConfig.pages)
    .map(([id, page]) => [id, resolve(pagesDir, page.file)] as const)
    .filter(([, file]) => existsSync(file)),
);

export default defineConfig({
  root: pagesDir,
  base: './',
  publicDir: here(buildConfig.publicDir),
  plugins: [htmlTemplates()],
  css: { postcss: { plugins: [postcssCustomMedia()] } },
  build: {
    outDir: here(buildConfig.outDir),
    emptyOutDir: true,
    chunkSizeWarningLimit: buildConfig.chunkSizeWarningKb,
    rollupOptions: { input },
  },
  server: {
    port: buildConfig.dev.port,
    proxy: { [`/${siteConfig.api.base}`]: buildConfig.dev.apiTarget },
  },
  preview: {
    port: buildConfig.dev.port,
    proxy: { [`/${siteConfig.api.base}`]: buildConfig.dev.apiTarget },
  },
});

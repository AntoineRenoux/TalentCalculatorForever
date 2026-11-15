// Règles de qualité. La règle « aucun nombre magique » s'applique au code ; les fichiers
// de configuration, de textes et de données sont précisément là pour porter ces valeurs.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**', 'node_modules/**', 'server/dist/**', 'public/**', '**/*.html',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'plugins/**/*.ts', 'server/src/**/*.ts'],
    rules: {
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': ['error', {
        ignore: [0, 1, -1],
        ignoreArrayIndexes: true,
        ignoreEnums: true,
        ignoreNumericLiteralTypes: true,
        ignoreReadonlyClassProperties: true,
        ignoreTypeIndexes: true,
        ignoreDefaultValues: false,
      }],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
  {
    // Fichiers de réglages, de textes et de données : les valeurs y sont attendues.
    files: ['config/**/*.ts', 'src/locales/**/*.ts', 'src/data/**', 'server/src/locales/**/*.ts', 'server/src/config/**/*.ts'],
    rules: { '@typescript-eslint/no-magic-numbers': 'off' },
  },
);

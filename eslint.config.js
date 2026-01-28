// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactCompiler = require('eslint-plugin-react-compiler');
const prettierPlugin = require('eslint-plugin-prettier');

// Find the config object that has TypeScript plugin
const tsConfig = expoConfig.find((config) => config?.plugins?.['@typescript-eslint']);

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    // Include plugins from expoConfig so rules can reference them
    plugins: {
      ...(tsConfig?.plugins || {}),
      'react-compiler': reactCompiler,
      prettier: prettierPlugin,
    },
    rules: {
      // React Compiler rules
      'react-compiler/react-compiler': 'warn',

      // Prettier integration
      'prettier/prettier': 'warn',

      // Allow unused vars starting with _
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
]);

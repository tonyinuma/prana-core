const eslint = require('@eslint/js');
const { defineConfig, globalIgnores } = require('eslint/config');
const prettier = require('eslint-config-prettier');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = defineConfig(
    globalIgnores(['node_modules/**', 'dist/**', 'coverage/**', '.serverless/**']),
    eslint.configs.recommended,
    {
        files: ['**/*.ts'],
        extends: [tseslint.configs.recommended],
    },
    {
        languageOptions: {
            globals: globals.node,
        },
    },
    prettier,
);

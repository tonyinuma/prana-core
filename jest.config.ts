const { createDefaultPreset } = require('ts-jest');

const config: import('jest').Config = {
    ...createDefaultPreset({ tsconfig: 'tsconfig.test.json' }),
    testEnvironment: 'node',
    clearMocks: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/application/dto/**/*.ts',
        '!src/application/ports/**/*.ts',
        '!src/domain/repositories/**/*.ts',
    ],
    coverageProvider: 'v8',
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
};

module.exports = config;

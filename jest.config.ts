const { createDefaultPreset } = require('ts-jest');

const config: import('jest').Config = {
    ...createDefaultPreset({ tsconfig: 'tsconfig.test.json' }),
    testEnvironment: 'node',
    clearMocks: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/application/ports/**/*.ts',
        '!src/domain/repositories/**/*.ts',
    ],
    coverageProvider: 'v8',
    coverageDirectory: 'coverage',
};

module.exports = config;

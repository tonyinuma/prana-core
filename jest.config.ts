const { createDefaultPreset } = require('ts-jest');

const config: import('jest').Config = {
    ...createDefaultPreset(),
    testEnvironment: 'node',
    clearMocks: true,
    collectCoverageFrom: ['src/**/*.ts'],
    coverageProvider: 'v8',
    coverageDirectory: 'coverage',
};

module.exports = config;

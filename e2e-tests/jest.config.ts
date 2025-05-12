// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }]
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/e2e-tests/**/*.test.ts'],
  extensionsToTreatAsEsm: ['.ts'],
};

export default config;

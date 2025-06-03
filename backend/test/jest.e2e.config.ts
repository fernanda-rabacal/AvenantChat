import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  globalSetup: './test-setup.ts',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
  },
  testTimeout: 10000,
};

export default config;

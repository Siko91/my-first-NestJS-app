// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/** @type {import('jest').Config} */
const config = {
  verbose: true,
  setupFiles: [path.join('..', 'jest.setup.js')],

  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',

  maxConcurrency: 1,
};

module.exports = config;

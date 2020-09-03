/* eslint-disable @typescript-eslint/no-var-requires */
const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  collectCoverageFrom: ['src/**/{!(app.module|index|main),}.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  coverageReporters: ['lcovonly', 'text'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  transform: tsjPreset.transform,
  testEnvironment: 'node',
  collectCoverage: true,
  forceExit: true,
}

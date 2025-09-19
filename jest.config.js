export default {
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {},
  transform: {},
  testMatch: [
    '**/src/core/tests/**/*.test.js',
    '**/src/dashboard/tests/**/*.test.js',
    '**/src/surveys/tests/**/*.test.js',
    '**/src/feedback/tests/**/*.test.js',
    '**/src/reports/tests/**/*.test.js',
    '**/src/shared/**/?(*.)+(test).js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/tests/**',
    '!src/server.js',
    '!src/app.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
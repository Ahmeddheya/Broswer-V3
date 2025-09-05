module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.e2e.ts'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'e2e/reports',
      outputName: 'junit.xml',
    }],
  ],
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
};
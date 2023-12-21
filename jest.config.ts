module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/frontend/'],
    testMatch: ['**/tst/**/*.test.ts'],
  };
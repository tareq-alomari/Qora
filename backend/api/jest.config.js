module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['./jest.setup.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/modules/**/*.service.js',
    'src/common/state-machine.js',
    'src/common/notifier.js',
    'src/common/storage.js',
    'src/common/redis.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 10000,
};

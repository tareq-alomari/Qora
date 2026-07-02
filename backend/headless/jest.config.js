module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['node_modules', 'src/index.js'],
  clearMocks: true,
  restoreMocks: true,
};

module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js', '**/*.test.jsx'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/styleMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  testTimeout: 20000,
};

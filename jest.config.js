module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: [
    'node_modules/.*'
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**'
  ]
};
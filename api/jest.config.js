module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../../coverage',
  coverageReporters: ['text', 'lcov'],
  testEnvironment: 'node',
};

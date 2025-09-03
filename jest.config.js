module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '(src/.*\\.spec\\.ts$)|(test/.*\\.e2e.spec\\.ts$)',
  transform: {
    '^.+\\.(t|j)s$': [require.resolve('ts-jest'), { tsconfig: 'tsconfig.spec.json' }],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

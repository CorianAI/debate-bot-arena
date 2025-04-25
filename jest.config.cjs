module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      babelConfig: './babel.config.cjs',
    }],
    '^.+\\.jsx?$': ['babel-jest', {
      configFile: './babel.config.cjs'
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!.*\\.mjs$)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};
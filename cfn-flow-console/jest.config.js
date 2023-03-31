module.exports = {
    "roots": [
      "<rootDir>/src"
    ],
    "testMatch": [
      "**/__tests__/**/*.+(ts|tsx|js)",
      "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
      "^.+\\.(ts|tsx|js)$": "ts-jest",
    },
    moduleNameMapper: {
      // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
      "uuid": require.resolve('uuid'),
      "^.+\\.svg$": "jest-svg-transformer",
      '^.+\\.(css|less)$': '<rootDir>/src/tests/CSSStub.js'
      // "awsExports": require.resolve("./aws-exports"),
    },
    // "transformIgnorePatterns": [
    //   "node_modules/aws-amplify/",
    //   "<rootDir>/src/aws-exports.js"
    // ]
    transformIgnorePatterns: [
      "/node_modules/.+.(js|jsx|ts|tsx)$",
    ],
  }
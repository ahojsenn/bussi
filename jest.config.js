// ./jest.config.js
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
    customExportConditions: ["node", "node-addons"],
  },
  verbose: true,
  moduleFileExtensions: ["js", "jsx", "mjs", "ts", "vue"],
  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/$1",
    "#app": "<rootDir>/node_modules/nuxt/dist/app/index.mjs"
  },
  transform: {  
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
    ".+\\.(css|scss|png|jpg|svg)$": "jest-transform-stub",
    ".*\\.(vue)$": "@vue/vue3-jest",
    "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/test-utils/fileMock.js",
    "\\.(css|less)$": "<rootDir>/test-utils/fileMock.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(nuxt3|unenv))",
  ],
  setupFiles: [
    "./test-utils/global-test-utils-config.ts"
  ]
};
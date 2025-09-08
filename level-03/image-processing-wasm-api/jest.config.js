module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/wasm/'
  ],
  testTimeout: 30000, // Increase timeout for tests that involve WebAssembly loading
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.js']
};

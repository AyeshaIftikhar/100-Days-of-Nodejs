module.exports = {
  env: {
    node: true,
    jest: true,
    es6: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-unused-vars': ['warn', { args: 'none' }],
    'object-curly-spacing': ['error', 'always'],
    'keyword-spacing': ['error', { before: true, after: true }],
    'comma-dangle': ['error', 'never'],
    'eol-last': ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }]
  }
};

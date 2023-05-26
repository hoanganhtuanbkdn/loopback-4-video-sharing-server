module.exports = {
  extends: '@loopback/eslint-config',
  plugins: ['unused-imports'],
  rules: {
    'mocha/handle-done-callback': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/prefer-for-of': 'off',
    'no-useless-catch': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': 'error',
  },
};

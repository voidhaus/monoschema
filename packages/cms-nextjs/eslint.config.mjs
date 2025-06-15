import baseConfig from '@voidhaus/eslint-config/base.js';

export default [
  ...baseConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];

module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:vue/recommended',
    'airbnb-base',
  ],
  globals: {
    $: 'readonly',
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    Vue: 'readonly',
    autosize: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: [
    'vue',
  ],
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'quote-props': ['error', 'consistent-as-needed'],
    'indent': ['error', 2, { SwitchCase: 1 }],
  },
};

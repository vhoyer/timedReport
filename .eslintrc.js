module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:vue/essential',
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
  },
};

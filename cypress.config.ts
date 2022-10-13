import { defineConfig } from 'cypress';
import { initPlugin } from '@frsource/cypress-plugin-visual-regression-diff/plugins';

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: `http://localhost:${process.env.PORT ?? '4173'}`,
    setupNodeEvents(on, config) {
      initPlugin(on, config);
    },
  },
});

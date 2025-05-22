import 'bootstrap/dist/css/bootstrap.css';
import './css.css';

import 'bootstrap';
import { storageAvailable } from './utils/validate-storage';
import { createApp, h } from 'vue';
import App from './app.vue';
import router from './router';

import { analyticsInit } from './services/analytics';
analyticsInit();

// Check if browser have support for window.localStorage
if (!storageAvailable('localStorage')) {
  // eslint-disable-next-line no-alert
  alert("Please Update your browser for a better experience, I haven't tested with an outdated browser, so you may have no experience at all xD\n\nHey, I'm doing you a favor");
}

const app = createApp({
  mounted() {
    // @ts-expect-error
    window.vm = this.$refs.app;
  },
  render() {
    return h(App, { ref: 'app' });
  },
});

// Use the router
app.use(router);

app.mount('#app');

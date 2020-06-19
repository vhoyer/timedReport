import './components';
import './utils/validate-storage';
import Vue from 'vue';
import App from './app.vue';

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  mounted() {
    window.vm = this.$refs.app;
  },
  render(h) {
    return h(App, { ref: 'app' });
  },
});

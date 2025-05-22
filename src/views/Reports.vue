<template>
  <div class="reports-page">
    <h1>Reports</h1>
    <p>Your reports will be displayed here.</p>
    <router-link to="/" class="btn btn-outline-secondary">Back to Home</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { analyticsTrack } from '../services/analytics';

export default defineComponent({
  name: 'ReportsPage',
  setup() {
    onMounted(() => {
      analyticsTrack('app', {
        event: 'reports_loaded'
      });
    });
  }
});
</script>

<style scoped>
.reports-page {
  padding: 2rem;
  text-align: center;
}

h1 {
  color: var(--primary);
  margin-bottom: 1rem;
}

.btn {
  margin-top: 1rem;
}
</style>

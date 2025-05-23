<template>
  <footer
    class="pt-4 pb-4"
    :style="{
      backgroundColor: isDark ? 'var(--card-header-bg)' : 'var(--bg)',
      borderTop: '1px solid var(--border)'
    }"
  >
    <div class="container">
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted" data-hj-whitelist>
          TimedReport!™ — next
        </small>
        <small class="text-muted">
          Vinícius Hoyer
        </small>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  computed: {
    isDark(): boolean {
      return document.documentElement.classList.contains('dark');
    }
  }
});
</script>

<style scoped>
footer {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
</style>

<template>
  <footer
    class="py-3"
    :style="{
      backgroundColor: isDark ? 'var(--card-header-bg)' : 'var(--bg)',
      borderTop: '1px solid var(--border)'
    }"
  >
    <div class="container">
      <div class="d-flex justify-content-between align-items-start">
        <small class="text-muted" data-hj-whitelist>
          TimedReport!™ — next
        </small>
        
        <small class="text-muted">
          Vinícius Hoyer
        </small>
      </div>
      <div class="d-flex justify-content-center align-items-center gap-4 mt-3">
        <a
          href="https://github.com/vhoyer/timedReport/issues/new"
          target="_blank"
          class="footer-link d-flex align-items-center"
          @click="onFeatureRequestClick"
        >
          <i class="fa-duotone fa-regular fa-lightbulb mr-2"></i>
          <span>Feature request?</span>
        </a>
        
        <a 
          href="https://ko-fi.com/vhoyer" 
          target="_blank" 
          class="footer-link d-flex align-items-center"
          @click="onKoFiClick"
        >
          <i class="fa-duotone fa-regular fa-mug-hot mr-2"></i>
          <span>Support on Ko-fi</span>
        </a>
        
        <a 
          href="https://twitch.tv/vhoyer" 
          target="_blank" 
          class="footer-link d-flex align-items-center"
          @click="onTwitchClick"
        >
          <i class="fa-brands fa-twitch mr-2"></i>
          <span>Watch on Twitch</span>
        </a>
        
        <a 
          href="https://bsky.app/profile/vhoyer.dev" 
          target="_blank" 
          class="footer-link d-flex align-items-center"
          @click="onBlueskyClick"
        >
          <i class="fa-brands fa-bluesky mr-2"></i>
          <span>Follow on Bluesky</span>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { analyticsTrack } from '@/services/analytics';

const isDark = document.documentElement.classList.contains('dark');

const onKoFiClick = () => {
  analyticsTrack('ko_fi_clicked', { source: 'footer' });
};

const onTwitchClick = () => {
  analyticsTrack('social_click', { platform: 'twitch', source: 'footer' });
};

const onBlueskyClick = () => {
  analyticsTrack('social_click', { platform: 'bluesky', source: 'footer' });
};

const onFeatureRequestClick = () => {
  analyticsTrack('feature_request_click', { source: 'footer' });
};
</script>

<style scoped>
footer {
  transition: background-color 0.3s ease, border-color 0.3s ease;
  font-size: 0.875rem;
}

.footer-link {
  color: var(--text-muted);
  text-decoration: none;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--primary) !important;
    background-color: var(--highlight-bg);
    text-decoration: none;
  }
}

.dark .ko-fi-link:hover {
  color: var(--primary-dark) !important;
  background-color: var(--highlight-bg-dark);
}
</style>

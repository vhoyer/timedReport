<template>
  <div v-if="showMessage" class="ko-fi-message">
    <div class="message-content">
      <p>Enjoying timedReport? Consider supporting the project with a <a href="https://ko-fi.com/vhoyer" target="_blank" @click="onSupportClick">Ko-fi donation</a>!</p>
      <button 
        class="close-button" 
        @click="dismissMessage" 
        title="Dismiss this message"
        aria-label="Dismiss message"
      >
        <i class="fa-regular fa-xmark"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSettings } from '@/store/settings';
import { analyticsTrack } from '@/services/analytics';

const settings = useSettings();
const showMessage = ref(false);

// Check if we should show the message
const shouldShowMessage = computed(() => {
  // Don't show if user has dismissed the message
  if (settings.settings.koFiDismissed) return false;
  
  // Set first seen time if not set
  if (!settings.settings.firstSeen) {
    settings.settings.firstSeen = Date.now();
    return false; // Don't show on first visit
  }
  
  // Show if it's been at least 30 days since first use
  const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  return settings.settings.firstSeen <= oneMonthAgo;
});

// Check if message should be shown on component mount
onMounted(() => {
  // Only check once per month
  const lastShown = localStorage.getItem('koFiLastShown');
  const now = Date.now();
  const oneMonth = 30 * 24 * 60 * 60 * 1000;
  
  if (shouldShowMessage.value && (!lastShown || (now - parseInt(lastShown)) >= oneMonth)) {
    showMessage.value = true;
    analyticsTrack('ko_fi_message_shown');
  }
});

// Dismiss the message
const dismissMessage = () => {
  showMessage.value = false;
  settings.settings.koFiDismissed = true;
  analyticsTrack('ko_fi_message_dismissed');
};

// Track when user clicks the support link
const onSupportClick = () => {
  analyticsTrack('ko_fi_clicked');
};
</script>

<style scoped>
.ko-fi-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background-color: var(--card-bg);
  color: var(--text-color);
  border-left: 4px solid var(--primary);
  border-radius: 4px;
  padding: 12px 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  animation: slideIn 0.3s ease-out;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-content p {
  margin: 0;
  flex-grow: 1;
}

.message-content a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.message-content a:hover {
  text-decoration: underline;
}

.close-button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: var(--border-color);
  color: var(--text-color);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Dark mode adjustments */
.dark .ko-fi-message {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
</style>

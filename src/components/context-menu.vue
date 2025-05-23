<template>
  <div
    v-if="isActive"
    ref="menu"
    class="context-menu dropdown-menu position-fixed"
    data-hj-whitelist
    :class="{ show: isActive, 'dropdown-menu-dark': isDark }"
    :style="{ transform: 'translate(' + x + 'px,' + y + 'px)' }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import { onClickOutside, useEventListener } from '@vueuse/core';

const props = withDefaults(defineProps<{
  isActive?: boolean;
  x: number;
  y: number;
}>(), {
  isActive: false
});

const emit = defineEmits<{
  'update:isActive': [value: boolean];
  'outside-x': [value: number];
  'outside-y': [value: number];
}>();

const menu = ref<HTMLDivElement>();
const width = ref(0);
const height = ref(0);

const isDark = computed(() => {
  return document.documentElement.classList.contains('dark');
});

// Close menu when clicking outside
onClickOutside(menu, () => {
  if (props.isActive) {
    closeMenu();
  }
});

// Close menu on scroll
useEventListener('scroll', () => {
  if (props.isActive) {
    closeMenu();
  }
}, { capture: true });

// Close menu on escape key
useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isActive) {
    closeMenu();
  }
});

watch(() => props.x, () => {
  if (!menu.value) return;
  const outsideScreen = window.innerWidth - 18 - (props.x + width.value);
  if (outsideScreen < 0) {
    emit('outside-x', outsideScreen);
  }
});

watch(() => props.y, () => {
  if (!menu.value) return;
  const outsideScreen = window.innerHeight - 18 - (props.y + height.value);
  if (outsideScreen < 0) {
    emit('outside-y', outsideScreen);
  }
});

onMounted(() => {
  onSizeChange();
});

function onSizeChange() {
  if (!menu.value) return;

  const observer = new MutationObserver((_mutations) => {
    if (menu.value) {
      width.value = menu.value.offsetWidth;
      height.value = menu.value.offsetHeight;
    }
  });

  observer.observe(menu.value, {
    attributes: true,
    childList: true,
    subtree: true
  });

  // Initial size
  width.value = menu.value.offsetWidth;
  height.value = menu.value.offsetHeight;

  // Cleanup
  onBeforeUnmount(() => {
    observer.disconnect();
  });
}

function closeMenu() {
  emit('update:isActive', false);
}
</script>

<style lang="scss">
.context-menu {
  top: 0;
  background-color: var(--card-bg);
  border-color: var(--border);
  transition: background-color 0.3s ease, border-color 0.3s ease;

  &.dropdown-menu-dark {
    .dropdown-item {
      color: var(--text);

      &:hover {
        background-color: var(--hover);
      }

      &:active {
        background-color: var(--text-muted);
      }
    }
  }
}

.context-menu .dropdown-item {
  cursor: pointer;
}
</style>

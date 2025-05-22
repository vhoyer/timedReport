<template>
  <div
    ref="menu"
    class="context-menu dropdown-menu position-fixed"
    data-hj-whitelist
    :class="{ show: isActive }"
    :style="{ transform: 'translate(' + x + 'px,' + y + 'px)' }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

interface Props {
  isActive?: boolean;
  x: number;
  y: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'outside-x': [value: number];
  'outside-y': [value: number];
  'close-context': [];
}>();

const menu = ref<HTMLDivElement>();
const width = ref(0);
const height = ref(0);

watch(() => props.x, () => {
  const outsideScreen = window.innerWidth - 18 - (props.x + width.value);
  if (outsideScreen < 0) {
    emit('outside-x', outsideScreen);
  }
});

watch(() => props.y, () => {
  const outsideScreen = window.innerHeight - 18 - (props.y + height.value);
  if (outsideScreen < 0) {
    emit('outside-y', outsideScreen);
  }
});

onMounted(() => {
  onSizeChange();
  onScroll();
});

function onSizeChange() {
  if (!menu.value) return;

  const observer = new MutationObserver((_mutations) => {
    if (menu.value && menu.value.offsetWidth > width.value) {
      width.value = menu.value.offsetWidth;
    }
    if (menu.value && menu.value.offsetHeight > height.value) {
      height.value = menu.value.offsetHeight;
    }
  });

  observer.observe(menu.value, {
    attributes: true,
  });
}

function onScroll() {
  window.addEventListener('scroll', () => {
    emit('close-context');
  });
}
</script>

<style lang="scss">
.context-menu{
    top: 0;
}
.context-menu .dropdown-item {
    cursor: pointer;
}
</style>

<template>
  <div
    id="context-menu"
    class="context-menu dropdown-menu position-fixed"
    data-hj-whitelist
    :class="{ show: isActive }"
    :style="{ transform: 'translate(' + x + 'px,' + y + 'px)' }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    isActive: Boolean,
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      width: 0,
      height: 0,
    };
  },
  watch: {
    x() {
      const outsideScreen = window.innerWidth - 18 - (this.x + this.width);
      if (outsideScreen < 0) {
        this.$emit('outside-x', outsideScreen);
      }
    },
    y() {
      const outsideScreen = window.innerHeight - 18 - (this.y + this.height);
      if (outsideScreen < 0) {
        this.$emit('outside-y', outsideScreen);
      }
    },
  },
  mounted() {
    this.onSizeChange();
    this.onScroll();
  },
  methods: {
    onSizeChange() {
      const menu = this.$el;

      const observer = new MutationObserver((_mutations) => {
        if (menu.offsetWidth > this.width) {
          this.width = menu.offsetWidth;
        }
        if (menu.offsetHeight > this.height) {
          this.height = menu.offsetHeight;
        }
      });

      observer.observe(menu, {
        attributes: true,
      });
    },
    onScroll() {
      window.addEventListener('scroll', () => {
        this.$emit('close-context');
      });
    },
  },
});
</script>

<style lang="scss">
.context-menu{
    top: 0;
}
.context-menu .dropdown-item {
    cursor: pointer;
}
</style>

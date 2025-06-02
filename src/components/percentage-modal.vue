<template>
  <div 
    class="modal fade" 
    :class="{ show: isVisible }" 
    tabindex="-1" 
    role="dialog"
    :style="{ display: isVisible ? 'block' : 'none' }"
  >
    <div class="modal-backdrop fade show" v-if="isVisible" @click="$emit('close')"></div>
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Change Task Progress</h5>
          <button 
            type="button" 
            class="close" 
            aria-label="Close"
            @click="$emit('close')"
          >
            <i class="fa-duotone fa-regular fa-xmark fa-xs" aria-hidden="true"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="percentageInput">Progress percentage (0-100)</label>
            <input
              type="number"
              class="form-control"
              id="percentageInput"
              v-model.number="localPercentage"
              min="0"
              max="100"
              @keyup.enter="save"
            >
          </div>
          <div class="progress mt-3" style="height: 8px;">
            <div
              class="progress-bar"
              role="progressbar"
              :style="{ width: localPercentage + '%' }"
              :aria-valuenow="localPercentage"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="save"
            :disabled="!isValid"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    currentPercentage: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      localPercentage: this.currentPercentage,
    };
  },
  computed: {
    isValid(): boolean {
      return this.localPercentage >= 0 && this.localPercentage <= 100;
    },
    isDark(): boolean {
      return document.documentElement.classList.contains('dark');
    }
  },
  watch: {
    currentPercentage(newValue: number) {
      this.localPercentage = newValue;
    },
    isVisible(newValue: boolean) {
      if (newValue) {
        this.localPercentage = this.currentPercentage;
        // Focus the input when modal opens
        setTimeout(() => {
          const input = document.getElementById('percentageInput');
          if (input) {
            input.focus();
            input.select();
          }
        }, 100);
      }
    },
  },
  methods: {
    save() {
      if (this.isValid) {
        this.$emit('save', this.localPercentage);
      }
    },
  },
});
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

:root.dark .modal-content {
  background-color: var(--card-bg);
  border-color: var(--border);
  color: var(--text);
}

:root.dark .modal-header,
:root.dark .modal-footer {
  border-color: var(--border);
}

:root.dark .close {
  color: var(--text);
  text-shadow: none;
  opacity: 0.5;
}

:root.dark .close:hover {
  opacity: 0.75;
}

:root.dark .form-control {
  background-color: var(--bg);
  border-color: var(--border);
  color: var(--text);
}

:root.dark .form-control:focus {
  background-color: var(--bg);
  border-color: var(--text-muted);
  color: var(--text);
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.15);
}

:root.dark .progress {
  background-color: var(--hover);
}

:root.dark .modal-title {
  color: var(--text);
}

:root.dark label {
  color: var(--text-muted);
}

.modal-content,
.form-control,
.close,
.progress,
.modal-header,
.modal-footer {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}
</style> 
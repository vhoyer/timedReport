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
            <span aria-hidden="true">&times;</span>
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
</style> 
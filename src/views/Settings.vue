<template>
  <div class="container">
    <h2 class="mb-4">Settings</h2>
    
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center">
          <i class="fa-duotone fa-regular fa-calendar-days mr-2"></i>
          Work Week Settings
        </h5>
        
        <div class="form-group">
          <label for="workWeekDays">Work Week Duration</label>
          <select 
            id="workWeekDays" 
            class="form-control"
            v-model.number="workWeekDays"
          >
            <option v-for="n in 7" :key="n" :value="n">
              {{ n }} day{{ n > 1 ? 's' : '' }} per week
            </option>
          </select>
          <small class="form-text text-muted">
            This affects how the week progress is displayed in the Project Breakdown section.
          </small>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center">
          <i class="fa-duotone fa-regular fa-money-bill-wave mr-2"></i>
          Billing Settings
        </h5>
        
        <div class="form-group">
          <label for="defaultBillableRate">Default Hourly Rate</label>
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text">$</span>
            </div>
            <input
              id="defaultBillableRate"
              type="number"
              min="0"
              step="0.01"
              class="form-control"
              v-model.number="defaultBillableRate"
            />
          </div>
          <small class="form-text text-muted">
            Default hourly rate used for billing calculations.
          </small>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center">
          <i class="fa-duotone fa-regular fa-gear mr-2"></i>
          Application Settings
        </h5>
        <button 
          class="btn btn-outline-secondary"
          @click="resetToDefaults"
        >
          <i class="fa-duotone fa-regular fa-rotate-left mr-2"></i>
          Reset to Defaults
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSettings } from '@/store/settings';

const settingsStore = useSettings();
const workWeekDays = ref(settingsStore.workWeekDays());
const defaultBillableRate = ref(settingsStore.defaultBillableRate());

// Watch for changes and update the store
watch(workWeekDays, (newValue) => {
  settingsStore.setWorkWeekDays(newValue);
});

watch(defaultBillableRate, (newValue) => {
  settingsStore.setDefaultBillableRate(newValue);
});

// Watch for changes in the store and update local refs
watch(() => settingsStore.settings.value.workWeekDays, (newValue) => {
  workWeekDays.value = newValue;
});

watch(() => settingsStore.settings.value.defaultBillableRate, (newValue) => {
  defaultBillableRate.value = newValue;
});

const resetToDefaults = () => {
  settingsStore.resetToDefaults();
  workWeekDays.value = settingsStore.workWeekDays();
  defaultBillableRate.value = settingsStore.defaultBillableRate();
};
</script>

<style scoped>
/* Add component styles here */
</style>

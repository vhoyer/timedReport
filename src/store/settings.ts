import { ref, watch } from 'vue';

interface AppSettings {
  workWeekDays: number;
  defaultBillableRate: number;
  projectBillableRates: {
    [projectId: string]: number;
  };
}

const STORAGE_KEY = 'app-settings';
const DEFAULT_SETTINGS: AppSettings = {
  workWeekDays: 5, // Default to 5-day work week
  defaultBillableRate: 0, // Default hourly rate (0 means no rate set)
  projectBillableRates: {}, // Project-specific rates
};

// Load settings from localStorage
const loadSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      // Merge with default settings to ensure all fields are present
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
    return { ...DEFAULT_SETTINGS };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return { ...DEFAULT_SETTINGS };
  }
};

// Create reactive settings
const settings = ref<AppSettings>(loadSettings());

// Save settings to localStorage whenever they change
watch(
  settings,
  (newSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
  { deep: true }
);

// Export the settings store
export function useSettings() {
  const setWorkWeekDays = (days: number) => {
    if (days >= 1 && days <= 7) {
      settings.value.workWeekDays = days;
    }
  };

  const setDefaultBillableRate = (rate: number) => {
    if (rate >= 0) {
      settings.value.defaultBillableRate = rate;
    }
  };

  const setProjectBillableRate = (projectId: string, rate: number) => {
    if (rate >= 0) {
      settings.value.projectBillableRates[projectId] = rate;
    } else {
      // Remove the project-specific rate if rate is invalid
      delete settings.value.projectBillableRates[projectId];
    }
  };

  const getProjectBillableRate = (projectId: string): number => {
    return settings.value.projectBillableRates[projectId] ?? settings.value.defaultBillableRate;
  };

  return {
    // State
    settings,
    
    // Getters
    workWeekDays: () => settings.value.workWeekDays,
    defaultBillableRate: () => settings.value.defaultBillableRate,
    getProjectBillableRate,
    
    // Actions
    setWorkWeekDays,
    setDefaultBillableRate,
    setProjectBillableRate,
    
    // Reset to defaults
    resetToDefaults: () => {
      settings.value = { ...DEFAULT_SETTINGS };
    },
  };
}

import { ref, watch } from 'vue';

interface AppSettings {
  workWeekDays: number;
}

const STORAGE_KEY = 'app-settings';
const DEFAULT_SETTINGS: AppSettings = {
  workWeekDays: 5, // Default to 5-day work week
};

// Load settings from localStorage
const loadSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { ...DEFAULT_SETTINGS };
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

  return {
    // State
    settings,
    
    // Getters
    workWeekDays: () => settings.value.workWeekDays,
    
    // Actions
    setWorkWeekDays,
    
    // Reset to defaults
    resetToDefaults: () => {
      settings.value = { ...DEFAULT_SETTINGS };
    },
  };
}

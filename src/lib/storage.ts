import { StepData, ScreenTimeData } from './activityTracking';

const STORAGE_KEYS = {
  USER_DATA: 'vita_user_data',
  STEP_DATA: 'vita_step_data',
  SCREEN_TIME: 'vita_screen_time',
  SETTINGS: 'vita_settings'
} as const;

export const storage = {
  saveUserData(data: any) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  getUserData() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  saveStepData(data: StepData[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.STEP_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving step data:', error);
    }
  },

  getStepData(): StepData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STEP_DATA);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting step data:', error);
      return [];
    }
  },

  saveScreenTimeData(data: ScreenTimeData[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SCREEN_TIME, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving screen time data:', error);
    }
  },

  getScreenTimeData(): ScreenTimeData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCREEN_TIME);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting screen time data:', error);
      return [];
    }
  },

  saveSettings(settings: any) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  },

  clear() {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.STEP_DATA);
      localStorage.removeItem(STORAGE_KEYS.SCREEN_TIME);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};
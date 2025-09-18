import { createContext, useContext } from 'react';
import type { StepData, ScreenTimeData } from '../lib/activityTracking';

export interface ActivityContextValue {
  isInitialized: boolean;
  isHealthy: boolean;
  lastSync: number;
  storageStats: {
    steps: { total: number; used: number };
    screenTime: { total: number; used: number };
  };
  stepData: StepData[];
  screenTimeData: ScreenTimeData[];
  isTracking: boolean;
  addStepData: (data: StepData) => void;
  addScreenTimeData: (data: ScreenTimeData) => void;
  startTracking: () => void;
  stopTracking: () => void;
}

export const ActivityContext = createContext<ActivityContextValue | undefined>(undefined);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};
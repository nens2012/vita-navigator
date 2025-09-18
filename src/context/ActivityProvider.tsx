import { createContext, useContext, PropsWithChildren } from 'react';
import { useActivityData } from '../hooks/useActivity';
import { StepData, ScreenTimeData } from '../lib/activityTracking';

interface ActivityContextValue {
  isInitialized: boolean;
  isHealthy: boolean;
  lastSync: number;
  storageStats: {
    steps: { total: number; used: number };
    screenTime: { total: number; used: number };
  };
  stepData: StepData[];
  screenTimeData: ScreenTimeData[];
  addStepData: (data: StepData) => void;
  addScreenTimeData: (data: ScreenTimeData) => void;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

export const ActivityContext = createContext<ActivityContextValue | undefined>(undefined);

export const ActivityProvider = ({ children }: PropsWithChildren<{}>) => {
  const activityData = useActivityData();

  return (
    <ActivityContext.Provider value={activityData}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};
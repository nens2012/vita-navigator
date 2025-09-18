import { useEffect, useState } from 'react';
import { ActivityDataService } from '../lib/activityDataService';
import { MLPatternRecognition } from '../lib/mlPatternRecognition';
import type { StepData, ScreenTimeData } from '../lib/activityTracking';
import type { ActivityContextValue } from '../context/ActivityContext';

export function useActivityData(): ActivityContextValue {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHealthy, setIsHealthy] = useState(true);
  const [lastSync, setLastSync] = useState<number>(0);
  const [isTracking, setIsTracking] = useState(false);
  const [stepData, setStepData] = useState<StepData[]>([]);
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData[]>([]);
  const [storageStats, setStorageStats] = useState<{
    steps: { total: number; used: number };
    screenTime: { total: number; used: number };
  }>({
    steps: { total: 0, used: 0 },
    screenTime: { total: 0, used: 0 },
  });

  useEffect(() => {
    const mlEngine = new MLPatternRecognition([], {});
    const service = ActivityDataService.getInstance(mlEngine);

    const initialize = async () => {
      // Load initial stats and status
      const stats = await service.getStorageStats();
      setStorageStats(stats);
      setLastSync(service.getLastProcessedTimestamp());
      setIsHealthy(service.isServiceHealthy());
      
      // Load existing step and screen time data
      const storedStepData = await service.getStoredStepData();
      const storedScreenTimeData = await service.getStoredScreenTimeData();
      setStepData(storedStepData);
      setScreenTimeData(storedScreenTimeData);
      
      // Set tracking status
      setIsTracking(service.getIsTracking());
      setIsInitialized(true);
    };

    initialize();

    // Check service health periodically
    const healthCheck = setInterval(() => {
      setIsHealthy(service.isServiceHealthy());
      setLastSync(service.getLastProcessedTimestamp());
    }, 60000); // Every minute

    // Update storage stats periodically
    const statsCheck = setInterval(async () => {
      const stats = await service.getStorageStats();
      setStorageStats(stats);
    }, 5 * 60000); // Every 5 minutes

    return () => {
      clearInterval(healthCheck);
      clearInterval(statsCheck);
    };
  }, []);

  const addStepData = (data: StepData) => {
    if (!isInitialized) return;
    const service = ActivityDataService.getInstance(
      new MLPatternRecognition([], {})
    );
    service.addStepData(data);
    setStepData(prev => [...prev, data]);
  };

  const addScreenTimeData = (data: ScreenTimeData) => {
    if (!isInitialized) return;
    const service = ActivityDataService.getInstance(
      new MLPatternRecognition([], {})
    );
    service.addScreenTimeData(data);
    setScreenTimeData(prev => [...prev, data]);
  };

  const startTracking = () => {
    if (!isInitialized) return;
    const service = ActivityDataService.getInstance(
      new MLPatternRecognition([], {})
    );
    service.startTracking();
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (!isInitialized) return;
    const service = ActivityDataService.getInstance(
      new MLPatternRecognition([], {})
    );
    service.stopTracking();
    setIsTracking(false);
  };

  return {
    isInitialized,
    isHealthy,
    lastSync,
    storageStats,
    stepData,
    screenTimeData,
    addStepData,
    addScreenTimeData,
    isTracking,
    startTracking,
    stopTracking,
  };
}
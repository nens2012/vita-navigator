import { useEffect, useState, useCallback } from 'react';
import { ActivityDataService } from '../lib/activityDataService';
import { MLPatternRecognition } from '../lib/mlPatternRecognition';
import { StepData, ScreenTimeData, DailyActivitySummary, ActivitySensor, ScreenTimeTracker } from '../lib/activityTracking';

export function useActivityData() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHealthy, setIsHealthy] = useState(true);
  const [lastSync, setLastSync] = useState<number>(0);
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
      const stats = await service.getStorageStats();
      setStorageStats(stats);
      setLastSync(service.getLastProcessedTimestamp());
      setIsHealthy(service.isServiceHealthy());
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
  };

  const addScreenTimeData = (data: ScreenTimeData) => {
    if (!isInitialized) return;
    const service = ActivityDataService.getInstance(
      new MLPatternRecognition([], {})
    );
    service.addScreenTimeData(data);
  };

  const [stepData, setStepData] = useState<StepData[]>([]);
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = useCallback(() => {
    const sensor = ActivitySensor.getInstance();
    sensor.startTracking();
    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(() => {
    const sensor = ActivitySensor.getInstance();
    sensor.stopTracking();
    setIsTracking(false);
  }, []);

  // Subscribe to step counter updates
  useEffect(() => {
    const sensor = ActivitySensor.getInstance();
    const unsubscribe = sensor.subscribeToSteps((newStep) => {
      setStepData(prev => [...prev, newStep]);
      addStepData(newStep);
    });
    return unsubscribe;
  }, []);

  // Subscribe to screen time updates
  useEffect(() => {
    const tracker = ScreenTimeTracker.getInstance();
    const unsubscribe = tracker.subscribeToScreenTime((newData) => {
      setScreenTimeData(prev => [...prev, newData]);
      addScreenTimeData(newData);
    });
    return unsubscribe;
  }, []);

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


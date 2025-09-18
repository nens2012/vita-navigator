import { useEffect, useState } from 'react';

export interface StepData {
  timestamp: number;
  count: number;
  source: 'device' | 'estimated';
  activityType: 'walking' | 'running' | 'stairs';
  confidence: number;
}

export interface ScreenTimeData {
  timestamp: number;
  appName: string;
  duration: number; // in minutes
  category: 'productivity' | 'social' | 'entertainment' | 'wellness' | 'other';
  isWellnessApp: boolean;
}

export interface DailyActivitySummary {
  date: string;
  totalSteps: number;
  stepGoal: number;
  activeMinutes: number;
  caloriesBurned: number;
  distanceCovered: number; // in kilometers
  screenTime: {
    total: number; // in minutes
    byCategory: Record<string, number>;
    wellnessApps: number;
  };
  hourlySteps: number[];
  peakActivityHours: number[];
}

export class ActivitySensor {
  private static instance: ActivitySensor;
  private stepCallbacks: ((steps: StepData) => void)[] = [];
  private isTracking = false;
  private lastStepCount = 0;
  private accelerometer: DeviceMotionEventAcceleration | null = null;

  private constructor() {
    this.initializeSensors();
  }

  public static getInstance(): ActivitySensor {
    if (!ActivitySensor.instance) {
      ActivitySensor.instance = new ActivitySensor();
    }
    return ActivitySensor.instance;
  }

  private initializeSensors() {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleMotion.bind(this));
    }
  }

  private handleMotion(event: DeviceMotionEvent) {
    if (!this.isTracking || !event.acceleration) return;

    this.accelerometer = event.acceleration;
    this.detectStep();
  }

  private detectStep() {
    if (!this.accelerometer) return;

    // Simple step detection algorithm using acceleration magnitude
    const magnitude = Math.sqrt(
      Math.pow(this.accelerometer.x || 0, 2) +
      Math.pow(this.accelerometer.y || 0, 2) +
      Math.pow(this.accelerometer.z || 0, 2)
    );

    // Threshold for step detection (can be calibrated)
    const STEP_THRESHOLD = 10;
    const MIN_STEP_INTERVAL = 250; // milliseconds

    if (magnitude > STEP_THRESHOLD) {
      const now = Date.now();
      if (now - this.lastStepCount > MIN_STEP_INTERVAL) {
        this.lastStepCount = now;
        this.notifyStepCallbacks({
          timestamp: now,
          count: 1,
          source: 'device',
          activityType: this.determineActivityType(magnitude),
          confidence: this.calculateConfidence(magnitude),
        });
      }
    }
  }

  private determineActivityType(magnitude: number): StepData['activityType'] {
    // Basic activity type detection based on acceleration magnitude
    if (magnitude > 25) return 'running';
    if (magnitude > 15) return 'stairs';
    return 'walking';
  }

  private calculateConfidence(magnitude: number): number {
    // Simple confidence calculation based on signal strength
    return Math.min(1, Math.max(0.5, magnitude / 20));
  }

  public startTracking() {
    this.isTracking = true;
  }

  public stopTracking() {
    this.isTracking = false;
  }

  public subscribeToSteps(callback: (steps: StepData) => void) {
    this.stepCallbacks.push(callback);
    return () => {
      this.stepCallbacks = this.stepCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyStepCallbacks(stepData: StepData) {
    this.stepCallbacks.forEach(callback => callback(stepData));
  }
}

export class ScreenTimeTracker {
  private static instance: ScreenTimeTracker;
  private startTime: number = Date.now();
  private activeApp: string = 'Vita Navigator';
  private screenTimeCallbacks: ((data: ScreenTimeData) => void)[] = [];

  private constructor() {
    this.initializeTracking();
  }

  public static getInstance(): ScreenTimeTracker {
    if (!ScreenTimeTracker.instance) {
      ScreenTimeTracker.instance = new ScreenTimeTracker();
    }
    return ScreenTimeTracker.instance;
  }

  private initializeTracking() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      window.addEventListener('focus', this.handleFocus.bind(this));
      window.addEventListener('blur', this.handleBlur.bind(this));
    }
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      this.recordScreenTime();
    } else {
      this.startTime = Date.now();
    }
  }

  private handleFocus() {
    this.startTime = Date.now();
  }

  private handleBlur() {
    this.recordScreenTime();
  }

  private recordScreenTime() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000 / 60; // Convert to minutes

    if (duration > 0.5) { // Only record sessions longer than 30 seconds
      const screenTimeData: ScreenTimeData = {
        timestamp: this.startTime,
        appName: this.activeApp,
        duration,
        category: this.determineCategory(this.activeApp),
        isWellnessApp: this.isWellnessApp(this.activeApp),
      };

      this.notifyScreenTimeCallbacks(screenTimeData);
    }
  }

  private determineCategory(appName: string): ScreenTimeData['category'] {
    // Add your app categorization logic here
    if (appName === 'Vita Navigator') return 'wellness';
    // Add more app categorizations
    return 'other';
  }

  private isWellnessApp(appName: string): boolean {
    return appName === 'Vita Navigator';
  }

  public subscribeToScreenTime(callback: (data: ScreenTimeData) => void) {
    this.screenTimeCallbacks.push(callback);
    return () => {
      this.screenTimeCallbacks = this.screenTimeCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyScreenTimeCallbacks(data: ScreenTimeData) {
    this.screenTimeCallbacks.forEach(callback => callback(data));
  }
}

// Custom hooks for easy integration
export function useStepCounter() {
  const [stepData, setStepData] = useState<StepData[]>(() => {
    // Load initial data from storage
    const stored = localStorage.getItem('vita_step_data');
    return stored ? JSON.parse(stored) : [];
  });
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const sensor = ActivitySensor.getInstance();
    const unsubscribe = sensor.subscribeToSteps((newStep) => {
      setStepData(prev => {
        const updated = [...prev, newStep];
        // Save to storage
        localStorage.setItem('vita_step_data', JSON.stringify(updated));
        return updated;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const startTracking = () => {
    const sensor = ActivitySensor.getInstance();
    sensor.startTracking();
    setIsTracking(true);
  };

  const stopTracking = () => {
    const sensor = ActivitySensor.getInstance();
    sensor.stopTracking();
    setIsTracking(false);
  };

  return { stepData, isTracking, startTracking, stopTracking };
}

export function useScreenTime() {
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData[]>([]);

  useEffect(() => {
    const tracker = ScreenTimeTracker.getInstance();
    const unsubscribe = tracker.subscribeToScreenTime((newData) => {
      setScreenTimeData(prev => [...prev, newData]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { screenTimeData };
}

export class ActivityDataProcessor {
  public static summarizeDaily(
    stepData: StepData[],
    screenTimeData: ScreenTimeData[]
  ): DailyActivitySummary {
    const today = new Date().toISOString().split('T')[0];
    const todaySteps = stepData.filter(
      step => new Date(step.timestamp).toISOString().split('T')[0] === today
    );

    const todayScreenTime = screenTimeData.filter(
      st => new Date(st.timestamp).toISOString().split('T')[0] === today
    );

    // Calculate hourly steps
    const hourlySteps = Array(24).fill(0);
    todaySteps.forEach(step => {
      const hour = new Date(step.timestamp).getHours();
      hourlySteps[hour] += step.count;
    });

    // Calculate screen time by category
    const screenTimeByCategory: Record<string, number> = {};
    let wellnessAppTime = 0;
    todayScreenTime.forEach(st => {
      screenTimeByCategory[st.category] = (screenTimeByCategory[st.category] || 0) + st.duration;
      if (st.isWellnessApp) {
        wellnessAppTime += st.duration;
      }
    });

    // Calculate peak activity hours
    const peakHours = hourlySteps
      .map((steps, hour) => ({ hour, steps }))
      .sort((a, b) => b.steps - a.steps)
      .slice(0, 3)
      .map(h => h.hour);

    return {
      date: today,
      totalSteps: todaySteps.reduce((sum, step) => sum + step.count, 0),
      stepGoal: 10000, // Configurable
      activeMinutes: this.calculateActiveMinutes(todaySteps),
      caloriesBurned: this.calculateCaloriesBurned(todaySteps),
      distanceCovered: this.calculateDistance(todaySteps),
      screenTime: {
        total: todayScreenTime.reduce((sum, st) => sum + st.duration, 0),
        byCategory: screenTimeByCategory,
        wellnessApps: wellnessAppTime,
      },
      hourlySteps,
      peakActivityHours: peakHours,
    };
  }

  private static calculateActiveMinutes(steps: StepData[]): number {
    // Consider continuous periods of activity
    let activeMinutes = 0;
    let lastActiveTime = 0;

    steps.forEach(step => {
      if (step.timestamp - lastActiveTime <= 60000) { // Within 1 minute
        activeMinutes++;
      }
      lastActiveTime = step.timestamp;
    });

    return activeMinutes;
  }

  private static calculateCaloriesBurned(steps: StepData[]): number {
    // Basic calorie calculation (can be enhanced with user data)
    const CALORIES_PER_STEP = 0.04;
    return steps.reduce((sum, step) => {
      const multiplier = step.activityType === 'running' ? 1.5 :
                        step.activityType === 'stairs' ? 1.3 : 1;
      return sum + (step.count * CALORIES_PER_STEP * multiplier);
    }, 0);
  }

  private static calculateDistance(steps: StepData[]): number {
    // Basic distance calculation (can be enhanced with user stride length)
    const METERS_PER_STEP = 0.762; // Average stride length
    const totalMeters = steps.reduce((sum, step) => sum + (step.count * METERS_PER_STEP), 0);
    return totalMeters / 1000; // Convert to kilometers
  }

  public static getProgressData(stepData: StepData[], screenTimeData: ScreenTimeData[]) {
    // Group data by date
    const dateGroups = new Map<string, { steps: StepData[]; screenTime: ScreenTimeData[] }>();
    
    // Process step data
    stepData.forEach(step => {
      const date = new Date(step.timestamp).toISOString().split('T')[0];
      if (!dateGroups.has(date)) {
        dateGroups.set(date, { steps: [], screenTime: [] });
      }
      dateGroups.get(date)!.steps.push(step);
    });

    // Process screen time data
    screenTimeData.forEach(st => {
      const date = new Date(st.timestamp).toISOString().split('T')[0];
      if (!dateGroups.has(date)) {
        dateGroups.set(date, { steps: [], screenTime: [] });
      }
      dateGroups.get(date)!.screenTime.push(st);
    });

    // Convert to ProgressData format
    return Array.from(dateGroups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        // Calculate total steps
        const totalSteps = data.steps.reduce((sum, step) => sum + step.count, 0);

        // Calculate screen time by category
        const screenTimeByCategory = data.screenTime.reduce((acc, st) => {
          acc[st.category] = (acc[st.category] || 0) + st.duration;
          return acc;
        }, {} as Record<string, number>);

        // Calculate scores based on activity
        const cardioScore = Math.min(100, (totalSteps / 10000) * 100);
        const strengthScore = Math.min(100, (totalSteps / 12000) * 100); // Different baseline
        const flexibilityScore = data.steps.some(step => step.activityType === 'stairs') ? 75 : 60;
        const mindfulnessScore = (screenTimeByCategory.wellness || 0) / 60 * 100; // Score based on wellness app usage

        return {
          date,
          cardio: cardioScore,
          strength: strengthScore,
          flexibility: flexibilityScore,
          mindfulness: mindfulnessScore,
          overall: (cardioScore + strengthScore + flexibilityScore + mindfulnessScore) / 4,
          steps: totalSteps,
          screenTime: {
            total: Object.values(screenTimeByCategory).reduce((a, b) => a + b, 0),
            productive: screenTimeByCategory.productivity || 0,
            entertainment: screenTimeByCategory.entertainment || 0,
            social: screenTimeByCategory.social || 0,
            wellness: screenTimeByCategory.wellness || 0,
          }
        };
      });
  }
}
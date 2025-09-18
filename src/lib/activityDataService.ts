import { StepData, ScreenTimeData, DailyActivitySummary, ActivitySensor, ScreenTimeTracker } from './activityTracking';
import { TaskCategory } from './taskScheduling';
import { MLPatternRecognition } from './mlPatternRecognition';

interface ActivityDataBatch {
  steps: StepData[];
  screenTime: ScreenTimeData[];
  timestamp: number;
}

interface StorageQuota {
  total: number;
  used: number;
}

interface StorageStats {
  steps: StorageQuota;
  screenTime: StorageQuota;
}

export class ActivityDataService {
  private static instance: ActivityDataService;
  private batchSize: number = 100;
  private syncInterval: number = 5 * 60 * 1000; // 5 minutes
  private retentionPeriod: number = 90 * 24 * 60 * 60 * 1000; // 90 days
  private currentBatch: ActivityDataBatch;
  private isProcessing: boolean = false;
  private isTracking: boolean = false;
  private mlEngine: MLPatternRecognition;
  private stepData: StepData[] = [];
  private screenTimeData: ScreenTimeData[] = [];
  private storageKey = 'vita_navigator_activity_data';
  private lastProcessedTimestamp: number = 0;
  private stepTracker: ActivitySensor | null = null;
  private screenTimeTracker: ScreenTimeTracker | null = null;

  private constructor(mlEngine: MLPatternRecognition) {
    this.mlEngine = mlEngine;
    this.currentBatch = this.initializeBatch();
    this.initializeService();
  }

  public static getInstance(mlEngine: MLPatternRecognition): ActivityDataService {
    if (!ActivityDataService.instance) {
      ActivityDataService.instance = new ActivityDataService(mlEngine);
    }
    return ActivityDataService.instance;
  }

  private initializeBatch(): ActivityDataBatch {
    return {
      steps: [],
      screenTime: [],
      timestamp: Date.now(),
    };
  }

  private initializeService(): void {
    // Load existing data
    this.loadFromStorage();

    // Set up periodic processing
    setInterval(() => this.processBatch(), this.syncInterval);

    // Set up data retention cleanup
    setInterval(() => this.cleanupOldData(), 24 * 60 * 60 * 1000); // Daily cleanup

    // Handle page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.processBatch(true); // Force process when page is hidden
        }
      });
    }

    // Handle before unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.processBatch(true); // Force process before page unload
      });
    }
  }

  public addStepData(data: StepData): void {
    this.stepData.push(data);
    this.currentBatch.steps.push(data);
    if (this.currentBatch.steps.length >= this.batchSize) {
      this.processBatch();
    }
  }

  public addScreenTimeData(data: ScreenTimeData): void {
    this.screenTimeData.push(data);
    this.currentBatch.screenTime.push(data);
    if (this.currentBatch.screenTime.length >= this.batchSize) {
      this.processBatch();
    }
  }

  private async processBatch(force: boolean = false): Promise<void> {
    if (this.isProcessing || (!force && 
        this.currentBatch.steps.length === 0 && 
        this.currentBatch.screenTime.length === 0)) {
      return;
    }

    this.isProcessing = true;
    const batchToProcess = { ...this.currentBatch };
    this.currentBatch = this.initializeBatch();

    try {
      // Process the data
      await this.processActivityData(batchToProcess);

      // Update ML engine
      const summary = this.generateDailySummary(batchToProcess);
      if (summary) {
        this.mlEngine.addActivityData(summary);
      }

      // Store the processed data
      await this.saveToStorage(batchToProcess);

      this.lastProcessedTimestamp = Date.now();
    } catch (error) {
      console.error('Error processing activity batch:', error);
      // Restore the batch data in case of error
      this.currentBatch.steps.push(...batchToProcess.steps);
      this.currentBatch.screenTime.push(...batchToProcess.screenTime);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processActivityData(batch: ActivityDataBatch): Promise<void> {
    // Aggregate step data
    const stepsByHour = new Map<number, number>();
    batch.steps.forEach(step => {
      const hour = new Date(step.timestamp).getHours();
      stepsByHour.set(hour, (stepsByHour.get(hour) || 0) + step.count);
    });

    // Aggregate screen time data
    const screenTimeByApp = new Map<string, number>();
    batch.screenTime.forEach(st => {
      screenTimeByApp.set(
        st.appName,
        (screenTimeByApp.get(st.appName) || 0) + st.duration
      );
    });

    // Could add more processing here...
  }

  private generateDailySummary(batch: ActivityDataBatch): DailyActivitySummary | null {
    const today = new Date().toISOString().split('T')[0];
    
    // Filter today's data
    const todaySteps = batch.steps.filter(
      step => new Date(step.timestamp).toISOString().split('T')[0] === today
    );
    const todayScreenTime = batch.screenTime.filter(
      st => new Date(st.timestamp).toISOString().split('T')[0] === today
    );

    if (todaySteps.length === 0 && todayScreenTime.length === 0) {
      return null;
    }

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
      screenTimeByCategory[st.category] = 
        (screenTimeByCategory[st.category] || 0) + st.duration;
      if (st.isWellnessApp) {
        wellnessAppTime += st.duration;
      }
    });

    return {
      date: today,
      totalSteps: todaySteps.reduce((sum, step) => sum + step.count, 0),
      stepGoal: 10000, // Could be personalized
      activeMinutes: this.calculateActiveMinutes(todaySteps),
      caloriesBurned: this.calculateCaloriesBurned(todaySteps),
      distanceCovered: this.calculateDistance(todaySteps),
      screenTime: {
        total: todayScreenTime.reduce((sum, st) => sum + st.duration, 0),
        byCategory: screenTimeByCategory,
        wellnessApps: wellnessAppTime,
      },
      hourlySteps,
      peakActivityHours: this.findPeakActivityHours(hourlySteps),
    };
  }

  private calculateActiveMinutes(steps: StepData[]): number {
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

  private calculateCaloriesBurned(steps: StepData[]): number {
    const CALORIES_PER_STEP = 0.04;
    return steps.reduce((sum, step) => {
      const multiplier = step.activityType === 'running' ? 1.5 :
                        step.activityType === 'stairs' ? 1.3 : 1;
      return sum + (step.count * CALORIES_PER_STEP * multiplier);
    }, 0);
  }

  private calculateDistance(steps: StepData[]): number {
    const METERS_PER_STEP = 0.762; // Average stride length
    const totalMeters = steps.reduce(
      (sum, step) => sum + (step.count * METERS_PER_STEP),
      0
    );
    return totalMeters / 1000; // Convert to kilometers
  }

  private findPeakActivityHours(hourlySteps: number[]): number[] {
    return hourlySteps
      .map((steps, hour) => ({ hour, steps }))
      .sort((a, b) => b.steps - a.steps)
      .slice(0, 3)
      .map(h => h.hour);
  }

  private async saveToStorage(batch: ActivityDataBatch): Promise<void> {
    try {
      const existingData = await this.loadFromStorage();
      const updatedData = {
        ...existingData,
        batches: [...(existingData.batches || []), batch],
      };

      localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving activity data:', error);
      throw error;
    }
  }

  private async loadFromStorage(): Promise<{
    batches: ActivityDataBatch[];
    lastSync?: number;
  }> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : { batches: [] };
    } catch (error) {
      console.error('Error loading activity data:', error);
      return { batches: [] };
    }
  }

  private async cleanupOldData(): Promise<void> {
    try {
      const data = await this.loadFromStorage();
      const cutoffTime = Date.now() - this.retentionPeriod;

      data.batches = data.batches.filter(
        batch => batch.timestamp > cutoffTime
      );

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error cleaning up old activity data:', error);
    }
  }

  public async getStorageStats(): Promise<StorageStats> {
    const data = await this.loadFromStorage();
    const stats: StorageStats = {
      steps: { total: 0, used: 0 },
      screenTime: { total: 0, used: 0 },
    };

    data.batches.forEach(batch => {
      stats.steps.used += batch.steps.length;
      stats.screenTime.used += batch.screenTime.length;
    });

    // Set reasonable limits
    stats.steps.total = 1000000; // 1M steps
    stats.screenTime.total = 100000; // 100K screen time entries

    return stats;
  }

  public async getStepDataForRange(start: number, end: number): Promise<StepData[]> {
    const data = await this.loadFromStorage();
    const allSteps: StepData[] = [];
    
    data.batches.forEach(batch => {
      batch.steps.forEach(step => {
        if (step.timestamp >= start && step.timestamp <= end) {
          allSteps.push(step);
        }
      });
    });

    return allSteps;
  }

  public async getScreenTimeDataForRange(start: number, end: number): Promise<ScreenTimeData[]> {
    const data = await this.loadFromStorage();
    const allScreenTime: ScreenTimeData[] = [];
    
    data.batches.forEach(batch => {
      batch.screenTime.forEach(st => {
        if (st.timestamp >= start && st.timestamp <= end) {
          allScreenTime.push(st);
        }
      });
    });

    return allScreenTime;
  }

  public getLastProcessedTimestamp(): number {
    return this.lastProcessedTimestamp;
  }

  public isServiceHealthy(): boolean {
    return Date.now() - this.lastProcessedTimestamp < this.syncInterval * 2;
  }

  public startTracking(): void {
    if (this.isTracking) return;
    
    // Initialize step tracking
    this.stepTracker = ActivitySensor.getInstance();
    this.stepTracker.subscribeToSteps((stepData) => {
      this.addStepData(stepData);
    });
    this.stepTracker.startTracking();

    // Initialize screen time tracking
    this.screenTimeTracker = ScreenTimeTracker.getInstance();
    this.screenTimeTracker.subscribeToScreenTime((screenTimeData) => {
      this.addScreenTimeData(screenTimeData);
    });

    this.isTracking = true;
  }

  public stopTracking(): void {
    if (!this.isTracking) return;

    if (this.stepTracker) {
      this.stepTracker.stopTracking();
      this.stepTracker = null;
    }

    if (this.screenTimeTracker) {
      this.screenTimeTracker = null;
    }

    this.isTracking = false;
  }

  public getIsTracking(): boolean {
    return this.isTracking;
  }

  public async getStoredStepData(): Promise<StepData[]> {
    try {
      // Return stored step data from memory or local storage
      return this.stepData;
    } catch (error) {
      console.error('Error fetching stored step data:', error);
      return [];
    }
  }

  public async getStoredScreenTimeData(): Promise<ScreenTimeData[]> {
    try {
      // Return stored screen time data from memory or local storage
      return this.screenTimeData;
    } catch (error) {
      console.error('Error fetching stored screen time data:', error);
      return [];
    }
  }
}
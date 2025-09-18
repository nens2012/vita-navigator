import { useState, useEffect } from 'react';
import { ActivityDataService } from '../lib/activityDataService';
import { MLPatternRecognition } from '../lib/mlPatternRecognition';
import { StepData, ScreenTimeData } from '../lib/activityTracking';
import { ScheduledTask, TaskCategory } from '../lib/taskScheduling';

export const useActivity = () => {
  const [stepData, setStepData] = useState<StepData[]>([]);
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData[]>([]);
  const [patterns, setPatterns] = useState<any>({}); // ML patterns
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    const mlEngine = new MLPatternRecognition([], {});
    const service = ActivityDataService.getInstance(mlEngine);

    const loadData = async () => {
      try {
        // Get the last 24 hours of data
        const now = Date.now();
        const yesterday = now - 24 * 60 * 60 * 1000;
        
        const steps = await service.getStepDataForRange(yesterday, now);
        const screenTime = await service.getScreenTimeDataForRange(yesterday, now);
        
        setStepData(steps);
        setScreenTimeData(screenTime);

        // Update ML patterns
        // Convert step data to ScheduledTask format
        const scheduledTasks: ScheduledTask[] = steps.map(step => ({
          id: String(step.timestamp),
          title: 'Step Activity',
          category: 'cardio' as TaskCategory,
          duration: step.count,
          intensity: step.count > 5000 ? 'high' : step.count > 2000 ? 'medium' : 'low',
          completed: true,
          description: `Step activity recorded from device: ${step.count} steps`,
          timeSlot: {
            hour: new Date(step.timestamp).getHours(),
            minute: new Date(step.timestamp).getMinutes(),
            period: new Date(step.timestamp).getHours() >= 12 ? 'PM' : 'AM'
          } as const,
          priority: 'medium',
          frequency: 'daily',
          tags: ['steps', 'cardio', 'activity'],
          caloriesBurn: step.count * 0.04,
          recommendedFor: {
            age: [13, 80] as [number, number],
            gender: ['male', 'female', 'other'],
            fitnessLevel: ['beginner', 'intermediate', 'advanced'],
            medicalConditions: ['none']
          }
        }));

        // Convert screen time data to completion records
        const completionHistory = Object.fromEntries(
          screenTime.map(screen => [String(screen.timestamp), screen.isWellnessApp])
        );

        const updatedMlEngine = new MLPatternRecognition(scheduledTasks, completionHistory);
        setPatterns(updatedMlEngine.getPatterns());
      } catch (error) {
        console.error('Error loading activity data:', error);
        setIsTracking(false);
      }
    };

    loadData();

    // Set up periodic refresh
    const refreshInterval = setInterval(loadData, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  return {
    stepData,
    screenTimeData,
    patterns,
    isTracking,
  };
};
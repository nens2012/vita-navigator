import { ScheduledTask, TaskCategory, taskTemplates } from './taskScheduling';

interface UserPreferences {
  preferredTimes: {
    workout: string[];
    meditation: string[];
    meals: string[];
  };
  preferredDuration: {
    workout: number;
    meditation: number;
    other: number;
  };
  dislikedActivities: string[];
  favoriteActivities: string[];
  equipmentAvailable: string[];
  indoorPreference: number; // 0-1, 1 = strongly prefers indoor
  intensity: {
    preferred: 'low' | 'medium' | 'high';
    max: 'low' | 'medium' | 'high';
  };
}

interface UserProgress {
  taskCompletionRate: Record<TaskCategory, number>;
  consistencyScore: number; // 0-1
  lastCompletedTasks: string[];
  progressByCategory: Record<TaskCategory, {
    improvement: number; // -1 to 1
    streak: number;
    lastActivity: Date;
  }>;
  challengeLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface RecommendationFactors {
  userProfile: any;
  preferences: UserPreferences;
  progress: UserProgress;
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6
  weather?: {
    isOutdoorFavorable: boolean;
    temperature: number;
    condition: string;
  };
}

const INTENSITY_SCORES = {
  low: 1,
  medium: 2,
  high: 3,
};

// Scoring weights for different factors
const RECOMMENDATION_WEIGHTS = {
  profileMatch: 0.3,
  userPreference: 0.2,
  timeMatch: 0.15,
  progressAlignment: 0.15,
  weatherImpact: 0.1,
  varietyBonus: 0.1,
};

import { MLPatternRecognition } from './mlPatternRecognition';

export class TaskRecommendationEngine {
  private userProfile: any;
  private preferences: UserPreferences;
  private progress: UserProgress;
  private mlEngine: MLPatternRecognition;
  private historicalTasks: ScheduledTask[] = [];
  private completionHistory: Record<string, boolean> = {};

  constructor(
    userProfile: any,
    preferences: UserPreferences,
    progress: UserProgress
  ) {
    this.userProfile = userProfile;
    this.preferences = preferences;
    this.progress = progress;
    this.mlEngine = new MLPatternRecognition(this.historicalTasks, this.completionHistory);
  }

  public addHistoricalData(tasks: ScheduledTask[], completions: Record<string, boolean>) {
    this.historicalTasks = tasks;
    this.completionHistory = completions;
    this.mlEngine = new MLPatternRecognition(tasks, completions);
  }

  // Calculate how well a task matches the user's profile
  private calculateProfileMatchScore(task: ScheduledTask): number {
    const { age, gender, activityLevel } = this.userProfile;
    const { recommendedFor } = task;

    if (!recommendedFor) return 0.5;

    const ageMatch = age >= recommendedFor.age[0] && age <= recommendedFor.age[1];
    const genderMatch = recommendedFor.gender.includes(gender);
    const fitnessMatch = recommendedFor.fitnessLevel.includes(activityLevel);
    const medicalMatch = this.userProfile.medicalConditions.every(
      (condition: string) => !recommendedFor.medicalConditions.includes(condition)
    );

    // Get activity insights from ML engine
    const activityPatterns = this.mlEngine.getPatterns().activityPatterns;
    const timePreference = this.mlEngine.getPatterns().timePreference;

    // Check if task aligns with optimal exercise times
    const taskHour = task.timeSlot.hour + (task.timeSlot.period === 'PM' ? 12 : 0);
    const timeMatch = timePreference.optimalExerciseTime.includes(taskHour);

    // Check if intensity matches optimal intensity
    const intensityMatch = task.intensity === activityPatterns.exerciseEfficiency.optimalIntensity;

    // Consider recovery periods for physical tasks
    const needsRecovery = task.category === 'cardio' || task.category === 'strength';
    const hasRecovered = needsRecovery ? this.checkRecoveryPeriod(task, activityPatterns.exerciseEfficiency.recoveryNeeded) : true;

    return [
      ageMatch ? 1 : 0,
      genderMatch ? 1 : 0,
      fitnessMatch ? 1 : 0,
      medicalMatch ? 1 : 0,
      timeMatch ? 1 : 0,
      intensityMatch ? 1 : 0,
      hasRecovered ? 1 : 0,
    ].reduce((sum, score) => sum + score, 0) / 7;
  }

  // Calculate how well a task matches user preferences
  private calculatePreferenceScore(task: ScheduledTask): number {
    let score = 0;
    const { tags = [], intensity, duration } = task;

    // Check if task is in favorite activities
    if (this.preferences.favoriteActivities.some(fav => tags.includes(fav))) {
      score += 0.3;
    }

    // Check if task is in disliked activities
    if (this.preferences.dislikedActivities.some(dis => tags.includes(dis))) {
      score -= 0.3;
    }

    // Check intensity preference match
    const intensityMatch =
      INTENSITY_SCORES[intensity] <= INTENSITY_SCORES[this.preferences.intensity.max];
    score += intensityMatch ? 0.2 : -0.2;

    // Check duration preference
    const durationPreference = this.preferences.preferredDuration[task.category] || 
                             this.preferences.preferredDuration.other;
    const durationMatch = Math.abs(duration - durationPreference) <= 15; // Within 15 minutes
    score += durationMatch ? 0.2 : -0.1;

    // Normalize score to 0-1 range
    return Math.max(0, Math.min(1, score + 0.5));
  }

  private checkRecoveryPeriod(task: ScheduledTask, recoveryNeeded: number): boolean {
    const lastIntenseActivity = this.historicalTasks
      .filter(t => t.category === task.category && t.intensity === 'high')
      .sort((a, b) => new Date(b.timeSlot.hour).getTime() - new Date(a.timeSlot.hour).getTime())[0];

    if (!lastIntenseActivity) return true;

    const hoursSinceLastActivity = 
      (new Date(task.timeSlot.hour).getTime() - new Date(lastIntenseActivity.timeSlot.hour).getTime()) 
      / (1000 * 60 * 60);

    return hoursSinceLastActivity >= recoveryNeeded;
  }

  // Calculate time appropriateness
  private calculateTimeScore(task: ScheduledTask, timeOfDay: number): number {
    const taskHour = task.timeSlot.hour + (task.timeSlot.period === 'PM' ? 12 : 0);
    const hourDiff = Math.abs(taskHour - timeOfDay);
    
    // Perfect time match gets highest score
    if (hourDiff === 0) return 1;
    
    // Score decreases as time difference increases
    return Math.max(0, 1 - (hourDiff / 12));
  }

  // Calculate progress-based score
  private calculateProgressScore(task: ScheduledTask): number {
    const categoryProgress = this.progress.progressByCategory[task.category];
    if (!categoryProgress) return 0.5;

    let score = 0.5;

    // Reward tasks in categories where user shows improvement
    score += categoryProgress.improvement * 0.2;

    // Boost score for tasks that maintain streaks
    if (categoryProgress.streak > 0) {
      score += Math.min(0.2, categoryProgress.streak * 0.05);
    }

    // Adjust for challenge level progression
    if (task.recommendedFor.fitnessLevel.includes(this.progress.challengeLevel)) {
      score += 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  // Calculate variety bonus to prevent repetitive tasks
  private calculateVarietyBonus(task: ScheduledTask): number {
    const recentTasks = this.progress.lastCompletedTasks;
    const categoryCount = recentTasks.filter(t => t === task.category).length;

    // Decrease score for frequently repeated categories
    return Math.max(0, 1 - (categoryCount * 0.2));
  }

  // Main recommendation function
  public recommendTasks(
    factors: RecommendationFactors,
    count: number = 5
  ): ScheduledTask[] {
    const allTasks = Object.values(taskTemplates).map(template => ({
      ...template,
      id: crypto.randomUUID(),
      completed: false,
    })) as ScheduledTask[];

    // Analyze patterns from historical data
    const userPatterns = this.mlEngine.analyzePatterns();

    const scoredTasks = allTasks.map(task => {
      const profileScore = this.calculateProfileMatchScore(task);
      const preferenceScore = this.calculatePreferenceScore(task);
      const timeScore = this.calculateTimeScore(task, factors.timeOfDay);
      const progressScore = this.calculateProgressScore(task);
      const varietyScore = this.calculateVarietyBonus(task);

      // Get ML predictions for task success
      const mlPrediction = this.mlEngine.predictTaskSuccess(task);

      const weatherScore = factors.weather && task.tags?.includes('outdoor')
        ? factors.weather.isOutdoorFavorable ? 1 : 0
        : 0.5;

      // Incorporate ML prediction into the final score
      const mlScore = mlPrediction.likelihood * mlPrediction.confidence;

      const totalScore =
        profileScore * RECOMMENDATION_WEIGHTS.profileMatch +
        preferenceScore * RECOMMENDATION_WEIGHTS.userPreference +
        timeScore * RECOMMENDATION_WEIGHTS.timeMatch +
        progressScore * RECOMMENDATION_WEIGHTS.progressAlignment +
        weatherScore * RECOMMENDATION_WEIGHTS.weatherImpact +
        varietyScore * RECOMMENDATION_WEIGHTS.varietyBonus +
        mlScore * 0.2; // Add ML-based scoring with 20% weight

      // Add ML insights to the task for UI display
      const enrichedTask = {
        ...task,
        mlInsights: {
          successLikelihood: mlPrediction.likelihood,
          confidence: mlPrediction.confidence,
          supportingFactors: mlPrediction.supportingFactors,
          risks: mlPrediction.risks
        }
      };

      return {
        task: enrichedTask,
        score: totalScore,
        breakdown: {
          profileScore,
          preferenceScore,
          timeScore,
          progressScore,
          weatherScore,
          varietyScore,
          mlScore
        },
      };
    });

    // Sort by score and return top recommendations
    return scoredTasks
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(({ task }) => task);
  }

  // Adapt recommendations based on user feedback
  public adaptToFeedback(taskId: string, feedback: {
    completed: boolean;
    difficulty: 'too_easy' | 'just_right' | 'too_hard';
    enjoyment: number; // 1-5
    energy: number; // 1-5
  }): void {
    // Update user preferences based on feedback
    const task = taskTemplates[taskId];
    if (!task) return;

    // Update historical data for ML analysis
    const completedTask = {
      ...task,
      id: taskId,
      completed: feedback.completed
    } as ScheduledTask;
    
    this.historicalTasks.push(completedTask);
    this.completionHistory[taskId] = feedback.completed;
    
    // Re-initialize ML engine with updated data
    this.mlEngine = new MLPatternRecognition(this.historicalTasks, this.completionHistory);

    // Adjust intensity preferences
    if (feedback.difficulty === 'too_hard') {
      this.preferences.intensity.preferred = 
        INTENSITY_SCORES[this.preferences.intensity.preferred] > 1
          ? 'low'
          : 'medium';
    } else if (feedback.difficulty === 'too_easy' &&
               feedback.completed) {
      this.preferences.intensity.preferred =
        INTENSITY_SCORES[this.preferences.intensity.preferred] < 3
          ? 'high'
          : 'medium';
    }

    // Update activity preferences
    if (feedback.enjoyment >= 4) {
      this.preferences.favoriteActivities = [
        ...new Set([...this.preferences.favoriteActivities, ...(task.tags || [])]),
      ];
    } else if (feedback.enjoyment <= 2) {
      this.preferences.dislikedActivities = [
        ...new Set([...this.preferences.dislikedActivities, ...(task.tags || [])]),
      ];
    }

    // Update progress tracking
    const categoryProgress = this.progress.progressByCategory[task.category];
    if (categoryProgress) {
      categoryProgress.improvement = feedback.completed ? 0.1 : -0.1;
      categoryProgress.streak = feedback.completed
        ? categoryProgress.streak + 1
        : 0;
      categoryProgress.lastActivity = new Date();
    }
  }

  // Generate progressive overload recommendations
  public generateProgressiveOverload(
    baseTask: ScheduledTask,
    weeks: number
  ): ScheduledTask[] {
    const progression: ScheduledTask[] = [];
    let currentTask = { ...baseTask };

    for (let week = 0; week < weeks; week++) {
      // Increase duration or intensity based on task type
      if (currentTask.category === 'cardio' || currentTask.category === 'strength') {
        currentTask = {
          ...currentTask,
          duration: Math.min(currentTask.duration * 1.1, currentTask.duration + 10),
          intensity: week % 4 === 3 ? 'high' : currentTask.intensity,
        };
      } else {
        currentTask = {
          ...currentTask,
          duration: Math.min(currentTask.duration * 1.05, currentTask.duration + 5),
        };
      }

      progression.push({
        ...currentTask,
        id: crypto.randomUUID(),
        description: `Week ${week + 1}: ${currentTask.description}`,
      });
    }

    return progression;
  }
}
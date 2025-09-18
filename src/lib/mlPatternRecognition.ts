import { TaskCategory, ScheduledTask } from './taskScheduling';
import { DailyActivitySummary, StepData, ScreenTimeData } from './activityTracking';

interface UserPattern {
  timePreference: {
    mostProductiveTime: number[];
    leastProductiveTime: number[];
    optimalExerciseTime: number[];
  };
  performancePatterns: {
    bestPerformingCategories: TaskCategory[];
    strugglingCategories: TaskCategory[];
    categoryTimeCorrelation: Record<TaskCategory, number[]>;
  };
  adherencePatterns: {
    mostConsistentDays: number[];
    mostSkippedTasks: string[];
    completionTimePreference: Record<TaskCategory, number[]>;
  };
  progressionPatterns: {
    fastestImprovingCategories: TaskCategory[];
    plateauedCategories: TaskCategory[];
    optimalRestPeriods: Record<TaskCategory, number>;
  };
  activityPatterns: {
    peakStepHours: number[];
    lowActivityPeriods: number[];
    screenTimeImpact: {
      productiveHours: number[];
      distractedHours: number[];
      wellnessAppCorrelation: number;
    };
    exerciseEfficiency: {
      bestStepRatios: number[];
      optimalIntensity: 'low' | 'medium' | 'high';
      recoveryNeeded: number; // hours
    };
  };
}

interface MLPrediction {
  likelihood: number;
  confidence: number;
  supportingFactors: string[];
  risks: string[];
}

export class MLPatternRecognition {
  private userPatterns: UserPattern;
  private historicalData: ScheduledTask[];
  private completionHistory: Record<string, boolean>;
  private activityData: DailyActivitySummary[] = [];
  private readonly ANALYSIS_WINDOW = 28; // 4 weeks of data

  public getPatterns(): UserPattern {
    return this.userPatterns;
  }

  constructor(historicalData: ScheduledTask[], completionHistory: Record<string, boolean>) {
    this.historicalData = historicalData;
    this.completionHistory = completionHistory;
    this.userPatterns = this.initializePatterns();
  }

  public addActivityData(data: DailyActivitySummary) {
    this.activityData.push(data);
    this.analyzeActivityPatterns();
  }

  private analyzeActivityPatterns(): void {
    this.analyzeStepPatterns();
    this.analyzeScreenTimeImpact();
    this.analyzeExerciseEfficiency();
  }

  private analyzeStepPatterns(): void {
    if (this.activityData.length === 0) return;

    // Analyze peak step hours
    const hourlyAverages = Array(24).fill(0);
    this.activityData.forEach(day => {
      day.hourlySteps.forEach((steps, hour) => {
        hourlyAverages[hour] += steps;
      });
    });

    // Normalize by number of days
    const normalizedHourlySteps = hourlyAverages.map(total => 
      total / this.activityData.length
    );

    // Find peak hours
    const peakHours = normalizedHourlySteps
      .map((steps, hour) => ({ hour, steps }))
      .sort((a, b) => b.steps - a.steps)
      .slice(0, 3)
      .map(h => h.hour);

    // Find low activity periods
    const lowActivityThreshold = 
      Math.max(...normalizedHourlySteps) * 0.2; // 20% of peak
    const lowActivityHours = normalizedHourlySteps
      .map((steps, hour) => ({ hour, steps }))
      .filter(h => h.steps < lowActivityThreshold)
      .map(h => h.hour);

    this.userPatterns.activityPatterns.peakStepHours = peakHours;
    this.userPatterns.activityPatterns.lowActivityPeriods = lowActivityHours;
  }

  private analyzeScreenTimeImpact(): void {
    if (this.activityData.length === 0) return;

    const screenTimeAnalysis = this.activityData.map(day => {
      const totalScreenTime = day.screenTime.total;
      const wellnessTime = day.screenTime.wellnessApps;
      const productivityRatio = wellnessTime / totalScreenTime;

      return {
        date: day.date,
        totalSteps: day.totalSteps,
        screenTime: totalScreenTime,
        wellnessTime,
        productivityRatio,
      };
    });

    // Find hours with high productivity
    const productiveHours = screenTimeAnalysis
      .filter(day => day.totalSteps > 8000 && day.productivityRatio > 0.3)
      .map(day => new Date(day.date).getHours());

    // Find hours with high distraction
    const distractedHours = screenTimeAnalysis
      .filter(day => day.totalSteps < 5000 && day.screenTime > 240) // >4 hours
      .map(day => new Date(day.date).getHours());

    // Calculate wellness app correlation
    const correlation = this.calculateCorrelation(
      screenTimeAnalysis.map(d => d.wellnessTime),
      screenTimeAnalysis.map(d => d.totalSteps)
    );

    this.userPatterns.activityPatterns.screenTimeImpact = {
      productiveHours: [...new Set(productiveHours)],
      distractedHours: [...new Set(distractedHours)],
      wellnessAppCorrelation: correlation,
    };
  }

  private analyzeExerciseEfficiency(): void {
    if (this.activityData.length === 0) return;

    const exerciseAnalysis = this.activityData.map(day => {
      const stepRatio = day.totalSteps / day.activeMinutes;
      return {
        date: day.date,
        stepRatio,
        caloriesPerStep: day.caloriesBurned / day.totalSteps,
      };
    });

    // Find best step ratios
    const bestRatios = exerciseAnalysis
      .sort((a, b) => b.stepRatio - a.stepRatio)
      .slice(0, 3)
      .map(day => day.stepRatio);

    // Determine optimal intensity based on calorie efficiency
    const avgCaloriesPerStep = exerciseAnalysis.reduce(
      (sum, day) => sum + day.caloriesPerStep, 0
    ) / exerciseAnalysis.length;

    let optimalIntensity: 'low' | 'medium' | 'high';
    if (avgCaloriesPerStep > 0.05) optimalIntensity = 'high';
    else if (avgCaloriesPerStep > 0.03) optimalIntensity = 'medium';
    else optimalIntensity = 'low';

    // Calculate recovery needed based on activity patterns
    const recoveryHours = this.calculateRecoveryNeeded(exerciseAnalysis);

    this.userPatterns.activityPatterns.exerciseEfficiency = {
      bestStepRatios: bestRatios,
      optimalIntensity,
      recoveryNeeded: recoveryHours,
    };

    // Update optimal exercise times based on activity patterns
    this.userPatterns.timePreference.optimalExerciseTime = 
      this.calculateOptimalExerciseTimes();
  }

  private calculateRecoveryNeeded(
    exerciseAnalysis: Array<{ date: string; stepRatio: number }>
  ): number {
    // Look for patterns where performance drops after high activity
    let totalRecoveryTime = 0;
    let countRecoveryPeriods = 0;

    for (let i = 1; i < exerciseAnalysis.length; i++) {
      const prevDay = exerciseAnalysis[i - 1];
      const currentDay = exerciseAnalysis[i];

      // If there's a significant drop in performance
      if (currentDay.stepRatio < prevDay.stepRatio * 0.7) {
        const recoveryEnd = exerciseAnalysis
          .slice(i)
          .findIndex(day => day.stepRatio > prevDay.stepRatio * 0.9);

        if (recoveryEnd > 0) {
          totalRecoveryTime += recoveryEnd * 24;
          countRecoveryPeriods++;
        }
      }
    }

    return countRecoveryPeriods > 0
      ? Math.round(totalRecoveryTime / countRecoveryPeriods)
      : 24; // Default to 24 hours if no pattern found
  }

  private calculateOptimalExerciseTimes(): number[] {
    const { peakStepHours } = this.userPatterns.activityPatterns;
    const { productiveHours } = this.userPatterns.activityPatterns.screenTimeImpact;

    // Find overlap between peak activity and productive hours
    const optimalHours = peakStepHours.filter(hour => 
      productiveHours.includes(hour)
    );

    // If no overlap, prefer peak step hours
    return optimalHours.length > 0 ? optimalHours : peakStepHours;
  }

  private analyzeActivityFactors(task: ScheduledTask): {
    score: number;
    supporting: string[];
    risks: string[];
  } {
    if (this.activityData.length === 0) {
      return { score: 0.5, supporting: [], risks: [] };
    }

    const taskHour = task.timeSlot.hour + (task.timeSlot.period === 'PM' ? 12 : 0);
    const isPhysicalTask = task.category === 'cardio' || 
                          task.category === 'strength' || 
                          task.category === 'flexibility';

    // Get today's activity data
    const today = this.activityData[this.activityData.length - 1];
    const currentSteps = today.totalSteps;
    const stepGoalProgress = currentSteps / today.stepGoal;

    // Check if task is scheduled during peak activity hours
    const isPeakHour = this.userPatterns.activityPatterns.peakStepHours.includes(taskHour);
    
    // Check energy levels based on recent activity
    const isHighActivityPeriod = today.hourlySteps
      .slice(-3)
      .reduce((sum, steps) => sum + steps, 0) > 1000;

    let score = 0.5;
    const supporting: string[] = [];
    const risks: string[] = [];

    if (isPhysicalTask) {
      // Adjust score based on daily step progress
      if (stepGoalProgress > 0.8) {
        score -= 0.2;
        risks.push('You\'ve already reached 80% of your daily step goal');
      } else if (stepGoalProgress < 0.3) {
        score += 0.2;
        supporting.push('Good timing for physical activity');
      }

      // Consider energy levels
      if (isHighActivityPeriod) {
        score -= 0.1;
        risks.push('High recent physical activity');
      }

      // Check recovery periods
      const needsRecovery = this.userPatterns.activityPatterns.exerciseEfficiency.recoveryNeeded > 0;
      if (needsRecovery) {
        score -= 0.2;
        risks.push('Recovery period recommended');
      }
    } else {
      // For non-physical tasks
      if (isPeakHour) {
        score += 0.1;
        supporting.push('Scheduled during your naturally active time');
      }

      if (isHighActivityPeriod && task.category === 'meditation') {
        score += 0.2;
        supporting.push('Good time for recovery and mindfulness');
      }
    }

    return {
      score: Math.max(0, Math.min(1, score + 0.5)),
      supporting,
      risks,
    };
  }

  private analyzeScreenTimeFactors(task: ScheduledTask): {
    score: number;
    supporting: string[];
    risks: string[];
  } {
    if (this.activityData.length === 0) {
      return { score: 0.5, supporting: [], risks: [] };
    }

    const today = this.activityData[this.activityData.length - 1];
    const taskHour = task.timeSlot.hour + (task.timeSlot.period === 'PM' ? 12 : 0);
    
    // Get screen time patterns
    const { screenTimeImpact } = this.userPatterns.activityPatterns;
    const isProductiveHour = screenTimeImpact.productiveHours.includes(taskHour);
    const isDistractedHour = screenTimeImpact.distractedHours.includes(taskHour);

    // Calculate total screen time
    const totalScreenTime = today.screenTime.total;
    const isHighScreenTimeDay = totalScreenTime > 480; // More than 8 hours

    let score = 0.5;
    const supporting: string[] = [];
    const risks: string[] = [];

    // Adjust score based on screen time patterns
    if (isProductiveHour) {
      score += 0.2;
      supporting.push('Scheduled during your productive screen time hours');
    }
    if (isDistractedHour) {
      score -= 0.2;
      risks.push('This time is typically associated with distractions');
    }

    // Consider digital wellness
    if (isHighScreenTimeDay) {
      score -= 0.1;
      risks.push('High screen time today - consider offline activities');

      if (task.category === 'meditation' || task.category === 'cardio') {
        score += 0.2;
        supporting.push('Good timing for a screen break');
      }
    }

    // Consider wellness app correlation
    if (screenTimeImpact.wellnessAppCorrelation > 0.6) {
      score += 0.1;
      supporting.push('You tend to complete tasks better with app support');
    }

    return {
      score: Math.max(0, Math.min(1, score + 0.5)),
      supporting,
      risks,
    };
  }

  private calculateCorrelation(array1: number[], array2: number[]): number {
    const n = array1.length;
    if (n === 0) return 0;

    const sum1 = array1.reduce((a, b) => a + b, 0);
    const sum2 = array2.reduce((a, b) => a + b, 0);
    const mean1 = sum1 / n;
    const mean2 = sum2 / n;

    const covariance = array1.reduce(
      (sum, x, i) => sum + (x - mean1) * (array2[i] - mean2),
      0
    ) / n;

    const variance1 = array1.reduce(
      (sum, x) => sum + Math.pow(x - mean1, 2),
      0
    ) / n;
    const variance2 = array2.reduce(
      (sum, x) => sum + Math.pow(x - mean2, 2),
      0
    ) / n;

    return covariance / Math.sqrt(variance1 * variance2);
  }

  private initializePatterns(): UserPattern {
    return {
      timePreference: {
        mostProductiveTime: [],
        leastProductiveTime: [],
        optimalExerciseTime: [],
      },
      performancePatterns: {
        bestPerformingCategories: [],
        strugglingCategories: [],
        categoryTimeCorrelation: {} as Record<TaskCategory, number[]>,
      },
      adherencePatterns: {
        mostConsistentDays: [],
        mostSkippedTasks: [],
        completionTimePreference: {} as Record<TaskCategory, number[]>,
      },
      progressionPatterns: {
        fastestImprovingCategories: [],
        plateauedCategories: [],
        optimalRestPeriods: {} as Record<TaskCategory, number>,
      },
      activityPatterns: {
        peakStepHours: [],
        lowActivityPeriods: [],
        screenTimeImpact: {
          productiveHours: [],
          distractedHours: [],
          wellnessAppCorrelation: 0,
        },
        exerciseEfficiency: {
          bestStepRatios: [],
          optimalIntensity: 'medium',
          recoveryNeeded: 12,
        },
      },
    };
  }

  public analyzePatterns(): UserPattern {
    this.analyzePeakPerformanceTimes();
    this.analyzeTaskAdherence();
    this.analyzeProgressionRates();
    this.detectPlateaus();
    return this.userPatterns;
  }

  private analyzePeakPerformanceTimes(): void {
    const hourlyCompletion: Record<number, { total: number; completed: number }> = {};

    this.historicalData.forEach(task => {
      const hour = task.timeSlot.hour;
      if (!hourlyCompletion[hour]) {
        hourlyCompletion[hour] = { total: 0, completed: 0 };
      }
      hourlyCompletion[hour].total++;
      if (this.completionHistory[task.id]) {
        hourlyCompletion[hour].completed++;
      }
    });

    // Calculate success rates for each hour
    const hourlySuccessRates = Object.entries(hourlyCompletion).map(([hour, stats]) => ({
      hour: parseInt(hour),
      rate: stats.completed / stats.total,
    }));

    // Sort by success rate
    hourlySuccessRates.sort((a, b) => b.rate - a.rate);

    // Set most and least productive times
    this.userPatterns.timePreference.mostProductiveTime = 
      hourlySuccessRates.slice(0, 3).map(h => h.hour);
    this.userPatterns.timePreference.leastProductiveTime = 
      hourlySuccessRates.slice(-3).map(h => h.hour);
  }

  private analyzeTaskAdherence(): void {
    const taskTypeAdherence: Record<TaskCategory, { total: number; completed: number }> = {
      cardio: { total: 0, completed: 0 },
      strength: { total: 0, completed: 0 },
      flexibility: { total: 0, completed: 0 },
      mindfulness: { total: 0, completed: 0 },
      nutrition: { total: 0, completed: 0 },
      sleep: { total: 0, completed: 0 },
      hydration: { total: 0, completed: 0 },
      posture: { total: 0, completed: 0 },
      rehabilitation: { total: 0, completed: 0 },
      meditation: { total: 0, completed: 0 }
    };

    this.historicalData.forEach(task => {
      taskTypeAdherence[task.category].total++;
      if (this.completionHistory[task.id]) {
        taskTypeAdherence[task.category].completed++;
      }
    });

    // Calculate adherence rates
    const adherenceRates = Object.entries(taskTypeAdherence).map(([category, stats]) => ({
      category: category as TaskCategory,
      rate: stats.completed / stats.total,
    }));

    // Sort and categorize
    adherenceRates.sort((a, b) => b.rate - a.rate);
    this.userPatterns.performancePatterns.bestPerformingCategories = 
      adherenceRates.slice(0, 2).map(a => a.category);
    this.userPatterns.performancePatterns.strugglingCategories = 
      adherenceRates.slice(-2).map(a => a.category);
  }

  private analyzeProgressionRates(): void {
    const progressionRates: Record<TaskCategory, number[]> = {
      cardio: [],
      strength: [],
      flexibility: [],
      mindfulness: [],
      nutrition: [],
      sleep: [],
      hydration: [],
      posture: [],
      rehabilitation: [],
      meditation: []
    };

    // Group tasks by week and category
    const weeklyProgress = this.historicalData.reduce((acc, task) => {
      const weekNumber = this.getWeekNumber(new Date(task.timeSlot.hour));
      if (!acc[weekNumber]) {
        acc[weekNumber] = {
          cardio: { total: 0, completed: 0 },
          strength: { total: 0, completed: 0 },
          flexibility: { total: 0, completed: 0 },
          mindfulness: { total: 0, completed: 0 },
          nutrition: { total: 0, completed: 0 },
          sleep: { total: 0, completed: 0 },
          hydration: { total: 0, completed: 0 },
          posture: { total: 0, completed: 0 },
          rehabilitation: { total: 0, completed: 0 },
          meditation: { total: 0, completed: 0 }
        };
      }
      acc[weekNumber][task.category].total++;
      if (this.completionHistory[task.id]) {
        acc[weekNumber][task.category].completed++;
      }
      return acc;
    }, {} as Record<number, Record<TaskCategory, { total: number; completed: number }>>);

    // Calculate week-over-week improvement
    Object.values(weeklyProgress).forEach((week, index, array) => {
      if (index === 0) return;
      Object.entries(week).forEach(([category, stats]) => {
        const previousWeek = array[index - 1][category];
        if (!previousWeek) return;

        const currentRate = stats.completed / stats.total;
        const previousRate = previousWeek.completed / previousWeek.total;
        const improvement = currentRate - previousRate;

        if (!progressionRates[category as TaskCategory]) {
          progressionRates[category as TaskCategory] = [];
        }
        progressionRates[category as TaskCategory].push(improvement);
      });
    });

    // Identify fastest improving categories
    const averageImprovements = Object.entries(progressionRates).map(([category, rates]) => ({
      category: category as TaskCategory,
      average: rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
    }));

    averageImprovements.sort((a, b) => b.average - a.average);
    this.userPatterns.progressionPatterns.fastestImprovingCategories = 
      averageImprovements.slice(0, 2).map(a => a.category);
  }

  private detectPlateaus(): void {
    const PLATEAU_THRESHOLD = 0.05; // 5% improvement threshold
    const plateauedCategories: TaskCategory[] = [];

    Object.entries(this.userPatterns.performancePatterns.categoryTimeCorrelation)
      .forEach(([category, improvements]) => {
        const recentImprovements = improvements.slice(-4); // Last 4 data points
        const averageImprovement = recentImprovements.reduce((sum, imp) => sum + imp, 0) / 
                                 recentImprovements.length;
        
        if (Math.abs(averageImprovement) < PLATEAU_THRESHOLD) {
          plateauedCategories.push(category as TaskCategory);
        }
      });

    this.userPatterns.progressionPatterns.plateauedCategories = plateauedCategories;
  }

  public predictTaskSuccess(task: ScheduledTask): MLPrediction {
    const timeFactors = this.analyzeTimeFactors(task);
    const categoryFactors = this.analyzeCategoryFactors(task);
    const progressionFactors = this.analyzeProgressionFactors(task);
    const activityFactors = this.analyzeActivityFactors(task);
    const screenTimeFactors = this.analyzeScreenTimeFactors(task);

    const weightedScores = [
      { score: timeFactors.score, weight: 0.2 },
      { score: categoryFactors.score, weight: 0.2 },
      { score: progressionFactors.score, weight: 0.2 },
      { score: activityFactors.score, weight: 0.2 },
      { score: screenTimeFactors.score, weight: 0.2 },
    ];

    const likelihood = weightedScores.reduce(
      (sum, { score, weight }) => sum + score * weight,
      0
    );

    const confidence = this.calculateConfidence([
      timeFactors,
      categoryFactors,
      progressionFactors,
      activityFactors,
      screenTimeFactors,
    ]);

    return {
      likelihood,
      confidence,
      supportingFactors: [
        ...timeFactors.supporting,
        ...categoryFactors.supporting,
        ...progressionFactors.supporting,
        ...activityFactors.supporting,
        ...screenTimeFactors.supporting,
      ],
      risks: [
        ...timeFactors.risks,
        ...categoryFactors.risks,
        ...progressionFactors.risks,
        ...activityFactors.risks,
        ...screenTimeFactors.risks,
      ],
    };
  }

  private analyzeTimeFactors(task: ScheduledTask): {
    score: number;
    supporting: string[];
    risks: string[];
  } {
    const hour = task.timeSlot.hour;
    const isProductiveTime = this.userPatterns.timePreference.mostProductiveTime.includes(hour);
    const isUnproductiveTime = this.userPatterns.timePreference.leastProductiveTime.includes(hour);

    return {
      score: isProductiveTime ? 0.8 : isUnproductiveTime ? 0.3 : 0.6,
      supporting: isProductiveTime ? ['Scheduled during peak performance time'] : [],
      risks: isUnproductiveTime ? ['Scheduled during typically unproductive time'] : [],
    };
  }

  private analyzeCategoryFactors(task: ScheduledTask): {
    score: number;
    supporting: string[];
    risks: string[];
  } {
    const isBestCategory = this.userPatterns.performancePatterns.bestPerformingCategories
      .includes(task.category);
    const isStrugglingCategory = this.userPatterns.performancePatterns.strugglingCategories
      .includes(task.category);

    return {
      score: isBestCategory ? 0.9 : isStrugglingCategory ? 0.4 : 0.6,
      supporting: isBestCategory ? ['Strong historical performance in this category'] : [],
      risks: isStrugglingCategory ? ['Category needs additional support or modifications'] : [],
    };
  }

  private analyzeProgressionFactors(task: ScheduledTask): {
    score: number;
    supporting: string[];
    risks: string[];
  } {
    const isImproving = this.userPatterns.progressionPatterns.fastestImprovingCategories
      .includes(task.category);
    const isPlateaued = this.userPatterns.progressionPatterns.plateauedCategories
      .includes(task.category);

    return {
      score: isImproving ? 0.85 : isPlateaued ? 0.5 : 0.7,
      supporting: isImproving ? ['Showing consistent improvement in this area'] : [],
      risks: isPlateaued ? ['Progress has plateaued - consider adjusting difficulty'] : [],
    };
  }

  private calculateConfidence(factors: Array<{ score: number }>): number {
    const scores = factors.map(f => f.score);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    
    // Higher variance = lower confidence
    return Math.max(0.5, 1 - Math.sqrt(variance));
  }

  private getWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.floor(days / 7);
  }
}
import { AGE_GROUP_PARAMETERS, GENDER_MODIFICATIONS, PersonalizedTask, AgeGroup, Gender } from './types';

export class PersonalizationService {
  private static instance: PersonalizationService;
  private userAge: number = 0;
  private userGender: Gender = 'other';
  private adaptiveDifficulty: boolean = true;
  private userProgress: Map<string, number> = new Map(); // Track progress per activity type

  private constructor() {}

  public static getInstance(): PersonalizationService {
    if (!PersonalizationService.instance) {
      PersonalizationService.instance = new PersonalizationService();
    }
    return PersonalizationService.instance;
  }

  public setUserDetails(age: number, gender: Gender) {
    this.userAge = age;
    this.userGender = gender;
  }

  private getAgeGroup(): AgeGroup {
    if (this.userAge <= 30) return '18-30';
    if (this.userAge <= 50) return '31-50';
    return '51+';
  }

  private getBaseIntensity(): number {
    const ageGroup = this.getAgeGroup();
    return AGE_GROUP_PARAMETERS[ageGroup].maxIntensity;
  }

  private adjustForGender(task: PersonalizedTask): PersonalizedTask {
    if (this.userGender === 'other') return task;

    const genderMods = GENDER_MODIFICATIONS[this.userGender];
    const adjustedTask = { ...task };

    // Adjust intensity based on gender
    switch (task.category) {
      case 'strength':
        adjustedTask.intensityLevel *= genderMods.strengthMultiplier;
        break;
      case 'cardio':
        adjustedTask.intensityLevel *= genderMods.cardioMultiplier;
        break;
      case 'flexibility':
        adjustedTask.intensityLevel *= genderMods.flexibilityMultiplier;
        break;
    }

    // Add female-specific modifications
    if (this.userGender === 'female') {
      // Add pregnancy-safe information
      adjustedTask.trimesterSafe = this.isPregnancySafe(task) ? [1, 2, 3] : [];
      
      // Add menstrual cycle considerations
      if (task.intensityLevel > 7) {
        adjustedTask.description = `${adjustedTask.description || ''}\nNote: Consider reducing intensity during menstruation.`;
      }
    }

    return adjustedTask;
  }

  private isPregnancySafe(task: PersonalizedTask): boolean {
    const unsafe = ['high-impact', 'inversion', 'hot-yoga'];
    return !unsafe.some(term => task.description?.toLowerCase().includes(term));
  }

  private adjustForProgress(task: PersonalizedTask): PersonalizedTask {
    if (!this.adaptiveDifficulty) return task;

    const activityProgress = this.userProgress.get(task.type) || 0;
    const adjustedTask = { ...task };

    // Adjust difficulty based on progress
    if (activityProgress > 80 && task.difficulty === 'beginner') {
      adjustedTask.difficulty = 'intermediate';
      adjustedTask.intensityLevel = Math.min(10, adjustedTask.intensityLevel * 1.2);
    } else if (activityProgress > 90 && task.difficulty === 'intermediate') {
      adjustedTask.difficulty = 'advanced';
      adjustedTask.intensityLevel = Math.min(10, adjustedTask.intensityLevel * 1.3);
    }

    return adjustedTask;
  }

  public updateProgress(activityType: string, progressValue: number) {
    this.userProgress.set(activityType, progressValue);
  }

  public personalizeTask(task: PersonalizedTask): PersonalizedTask | null {
    // Skip tasks that don't match gender requirements
    if (task.genderSpecific !== 'both' && task.genderSpecific !== this.userGender) {
      return null;
    }

    let personalizedTask = { ...task };

    // Age-based adjustments
    const ageGroup = this.getAgeGroup();
    personalizedTask.ageGroup = ageGroup;
    personalizedTask.duration = `${AGE_GROUP_PARAMETERS[ageGroup].defaultDuration} min`;
    
    // Gender-specific adjustments
    personalizedTask = this.adjustForGender(personalizedTask);

    // PCOD/PCOS specific adjustments for female users
    if (this.userGender === 'female' && personalizedTask.healthConditionSafe.includes('pcod_pcos')) {
      personalizedTask = this.adjustForPCOD(personalizedTask);
    }
    
    // Progress-based difficulty adjustments
    personalizedTask = this.adjustForProgress(personalizedTask);

    // Ensure intensity doesn't exceed age-appropriate maximum
    const maxIntensity = this.getBaseIntensity();
    personalizedTask.intensityLevel = Math.min(personalizedTask.intensityLevel, maxIntensity);

    return personalizedTask;
  }

  private adjustForPCOD(task: PersonalizedTask): PersonalizedTask {
    const adjustedTask = { ...task };

    // Modify exercise intensity and duration for PCOD/PCOS
    if (task.type === 'exercise') {
      adjustedTask.intensityLevel = Math.min(task.intensityLevel * 0.8, 7); // Reduce intensity
      adjustedTask.duration = `${Math.min(parseInt(task.duration), 30)} min`; // Cap duration at 30 min
      adjustedTask.description = `${task.description || ''}\n• Modified for PCOD/PCOS\n• Focus on low-impact movements`;
    }

    // Add PCOD/PCOS specific yoga poses and meditation
    if (task.type === 'yoga') {
      adjustedTask.title = `${task.title} (PCOD-friendly)`;
      adjustedTask.description = `${task.description || ''}\n• Hormone-balancing poses\n• Stress-reducing sequences`;
    }

    if (task.type === 'meditation') {
      adjustedTask.duration = `${Math.max(parseInt(task.duration), 15)} min`; // Ensure minimum 15 min
      adjustedTask.description = `${task.description || ''}\n• Stress management focus\n• Hormonal balance visualization`;
    }

    return adjustedTask;
  }

  public getRecommendedTasks(baseTasks: PersonalizedTask[]): PersonalizedTask[] {
    return baseTasks
      .filter(task => {
        // Filter age-inappropriate tasks
        const ageGroup = this.getAgeGroup();
        if (task.ageGroup !== ageGroup) return false;

        // Filter gender-specific tasks
        if (task.genderSpecific !== 'both' && task.genderSpecific !== this.userGender) return false;

        return true;
      })
      .map(task => this.personalizeTask(task));
  }

  public getHealthWarnings(): string[] {
    const warnings: string[] = [];
    const ageGroup = this.getAgeGroup();

    if (ageGroup === '51+') {
      warnings.push('Consider consulting your doctor before starting new high-intensity exercises.');
    }

    if (this.userGender === 'female') {
      warnings.push('Adjust exercise intensity based on your menstrual cycle.');
    }

    return warnings;
  }
}
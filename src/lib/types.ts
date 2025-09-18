// Types for user profile and personalization
export type Gender = 'male' | 'female' | 'other';

export type MedicalCondition =
  | 'hypertension'
  | 'diabetes'
  | 'obesity'
  | 'pcod_pcos'
  | 'thyroid'
  | 'arthritis'
  | 'back_pain'
  | 'none';

export type FitnessGoal =
  | 'weight_loss'
  | 'strength'
  | 'flexibility'
  | 'stress_relief'
  | 'general_health';

export type AgeGroup = '18-30' | '31-50' | '51+';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  medicalConditions: MedicalCondition[];
  fitnessGoal: FitnessGoal;
  created_at?: Date;
  updated_at?: Date;
}

// Personalization types
export interface ExercisePlan {
  type: 'cardio' | 'strength' | 'flexibility' | 'yoga' | 'meditation';
  intensity: 'low' | 'moderate' | 'high';
  frequency: number; // times per week
  duration: number; // minutes per session
  recommendations: string[];
  warnings: string[];
}

export interface DietPlan {
  type: 'weight_loss' | 'maintenance' | 'muscle_gain';
  restrictions: string[];
  recommendations: string[];
  mealPlan: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
}

export interface YogaPlan {
  type: 'general' | 'hormonal_balance' | 'stress_relief' | 'flexibility';
  poses: Array<{
    name: string;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    contraindications: string[];
  }>;
  breathing: Array<{
    name: string;
    duration: number;
    benefits: string[];
  }>;
}

export interface MeditationPlan {
  type: 'mindfulness' | 'stress_relief' | 'sleep' | 'focus';
  duration: number;
  frequency: number;
  techniques: string[];
}

export interface PersonalizedPlan {
  exercise: ExercisePlan;
  diet: DietPlan;
  yoga: YogaPlan;
  meditation: MeditationPlan;
  periodTracking?: {
    enabled: boolean;
    features: string[];
  };
}

// Validation helpers
export const isValidAge = (age: number): boolean => {
  return age >= 13 && age <= 120;
};

export const getAgeGroup = (age: number): AgeGroup => {
  if (age >= 51) return '51+';
  if (age >= 31) return '31-50';
  return '18-30';
};

export const getMedicalConditionsByGender = (gender: Gender): MedicalCondition[] => {
  const baseConditions: MedicalCondition[] = [
    'hypertension',
    'diabetes',
    'obesity',
    'thyroid',
    'arthritis',
    'back_pain',
    'none'
  ];

  return gender === 'female' 
    ? [...baseConditions, 'pcod_pcos']
    : baseConditions;
};

// Parameters for age-based adjustments
export const AGE_GROUP_PARAMETERS: Record<AgeGroup, {
  maxIntensity: number;
  defaultDuration: number;
  recoveryTime: number;
  adaptationRate: number;
}> = {
  '18-30': {
    maxIntensity: 10,
    defaultDuration: 45,
    recoveryTime: 1,
    adaptationRate: 1.2
  },
  '31-50': {
    maxIntensity: 8,
    defaultDuration: 35,
    recoveryTime: 1.5,
    adaptationRate: 1.0
  },
  '51+': {
    maxIntensity: 6,
    defaultDuration: 25,
    recoveryTime: 2,
    adaptationRate: 0.8
  }
};

// Parameters for gender-based adjustments
export const GENDER_MODIFICATIONS: Record<Gender, {
  strengthMultiplier: number;
  cardioMultiplier: number;
  flexibilityMultiplier: number;
  specialConditions?: {
    [key: string]: {
      intensityMultiplier: number;
      durationMultiplier: number;
      recommendations: string[];
      warnings: string[];
    };
  };
}> = {
  female: {
    strengthMultiplier: 0.9,
    cardioMultiplier: 1.1,
    flexibilityMultiplier: 1.2,
    specialConditions: {
      pregnancy: {
        intensityMultiplier: 0.6,
        durationMultiplier: 0.8,
        recommendations: ['Focus on low-impact activities', 'Maintain good posture'],
        warnings: ['Avoid high-impact exercises', 'Monitor heart rate']
      },
      menstrual: {
        intensityMultiplier: 0.8,
        durationMultiplier: 0.9,
        recommendations: ['Listen to your body', 'Stay hydrated'],
        warnings: ['Reduce intensity if needed', 'Avoid inverted poses']
      }
    }
  },
  male: {
    strengthMultiplier: 1.2,
    cardioMultiplier: 1.0,
    flexibilityMultiplier: 0.9
  },
  other: {
    strengthMultiplier: 1.0,
    cardioMultiplier: 1.0,
    flexibilityMultiplier: 1.0
  }
};

// Task interface for personalized activities
export interface PersonalizedTask {
  id: string;
  title: string;
  description?: string;
  type: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'meditation' | 'yoga';
  duration: string;
  intensityLevel: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string[];
  ageGroup: AgeGroup;
  genderSpecific: Gender | 'both';
  healthConditionSafe: string[];
  trimesterSafe?: number[];
  adaptedFor?: {
    gender?: Gender;
    age?: AgeGroup;
    condition?: string;
  };
}

export const validateUserProfile = (profile: UserProfile): string[] => {
  const errors: string[] = [];

  if (!profile.name?.trim()) {
    errors.push('Name is required');
  }

  if (!isValidAge(profile.age)) {
    errors.push('Age must be between 13 and 120');
  }

  if (!profile.gender) {
    errors.push('Gender is required');
  }

  if (!profile.fitnessGoal) {
    errors.push('Fitness goal is required');
  }

  if (!Array.isArray(profile.medicalConditions)) {
    errors.push('Medical conditions must be an array');
  }

  return errors;
};
import { z } from "zod";
import { Gender, MedicalCondition, FitnessGoal, AgeGroup } from "./types";

export const personalDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(13, "Must be at least 13 years old").max(120, "Age seems invalid"),
  gender: z.enum(["male", "female", "other"] as const),
});

export const physicalDetailsSchema = z.object({
  weight: z.number().min(20, "Weight seems too low").max(300, "Weight seems too high"),
  height: z.number().min(100, "Height seems too low").max(250, "Height seems too high"),
  medicalConditions: z.array(z.string()),
  hasPCOD: z.boolean().optional(),
});

export const goalsSchema = z.object({
  fitnessGoals: z.array(z.string()).min(1, "Select at least one goal"),
  healthGoals: z.array(z.string()).optional(),
});

export const preferencesSchema = z.object({
  activityPreference: z.enum(["yoga", "exercise", "both"]),
  timePerDay: z.number().min(15).max(120),
  dietPreference: z.enum(["vegetarian", "vegan", "non-vegetarian", "no-preference"]),
  periodInfo: z.object({
    cycleLength: z.number().min(20).max(40).optional(),
    lastPeriod: z.string().optional(),
  }).optional(),
});

export const onboardingSchema = z.object({
  personalDetails: personalDetailsSchema,
  physicalDetails: physicalDetailsSchema,
  goals: goalsSchema,
  preferences: preferencesSchema,
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

// Utility functions
export const calculateBMI = (weight: number, height: number): number => {
  const heightInM = height / 100;
  return Number((weight / (heightInM * heightInM)).toFixed(1));
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

export const getAgeBasedRecommendations = (age: number): {
  maxIntensity: number;
  defaultDuration: number;
  recoveryTime: number;
  adaptationRate: number;
  recommendations: string[];
} => {
  const ageGroup: AgeGroup = 
    age >= 51 ? "51+" :
    age >= 31 ? "31-50" :
    "18-30";

  const baseParams = {
    "18-30": {
      maxIntensity: 10,
      defaultDuration: 45,
      recoveryTime: 1,
      adaptationRate: 1.2,
      recommendations: [
        "Focus on building strength and flexibility",
        "High-intensity workouts are suitable",
        "Include variety in your routine"
      ]
    },
    "31-50": {
      maxIntensity: 8,
      defaultDuration: 35,
      recoveryTime: 1.5,
      adaptationRate: 1.0,
      recommendations: [
        "Balance cardio and strength training",
        "Include recovery days",
        "Focus on maintaining flexibility"
      ]
    },
    "51+": {
      maxIntensity: 6,
      defaultDuration: 25,
      recoveryTime: 2,
      adaptationRate: 0.8,
      recommendations: [
        "Low-impact exercises are recommended",
        "Focus on balance and stability",
        "Include gentle stretching"
      ]
    }
  };

  return baseParams[ageGroup];
};

export const getGenderSpecificWorkouts = (gender: Gender, hasPCOD: boolean = false): {
  workouts: string[];
  modifications: any;
} => {
  const baseWorkouts = {
    male: [
      "Strength Training",
      "HIIT",
      "Muscle Building",
      "Core Strength",
      "Cardio"
    ],
    female: [
      "Mixed Cardio",
      "Pilates",
      "Strength Training",
      "Flexibility",
      "Core Strength"
    ],
    other: [
      "Full Body Workout",
      "Cardio",
      "Flexibility",
      "Core Strength",
      "Balance Training"
    ]
  };

  if (gender === "female" && hasPCOD) {
    return {
      workouts: [
        "Low-Impact Cardio",
        "Strength Training",
        "Yoga",
        "Swimming",
        "Walking"
      ],
      modifications: {
        intensityMultiplier: 0.8,
        durationMultiplier: 0.9,
        recommendations: [
          "Focus on stress reduction",
          "Regular, moderate exercise",
          "Include relaxation techniques"
        ]
      }
    };
  }

  return {
    workouts: baseWorkouts[gender],
    modifications: {}
  };
};
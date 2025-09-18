// Task Categories and Types
export type TaskCategory = 
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'mindfulness'
  | 'nutrition'
  | 'sleep'
  | 'hydration'
  | 'posture'
  | 'rehabilitation'
  | 'meditation';

export type TimeSlot = {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
};

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface ScheduledTask {
  id: string;
  title: string;
  category: TaskCategory;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  completed: boolean;
  description: string;
  timeSlot: TimeSlot;
  priority: TaskPriority;
  frequency: TaskFrequency;
  tags: string[];
  requiredEquipment?: string[];
  caloriesBurn?: number;
  recommendedFor: {
    age: [number, number]; // age range [min, max]
    gender: ('male' | 'female' | 'other')[];
    fitnessLevel: ('beginner' | 'intermediate' | 'advanced')[];
    medicalConditions: string[];
  };
}

// Task Templates
export const taskTemplates: Record<string, Partial<ScheduledTask>> = {
  // Cardio Tasks
  morningJog: {
    title: 'Morning Jog',
    category: 'cardio',
    duration: 30,
    intensity: 'medium',
    description: 'Start your day with an energizing jog',
    caloriesBurn: 300,
    tags: ['outdoor', 'morning', 'endurance'],
    recommendedFor: {
      age: [16, 65],
      gender: ['male', 'female', 'other'],
      fitnessLevel: ['beginner', 'intermediate', 'advanced'],
      medicalConditions: ['none', 'stress', 'mild_anxiety'],
    }
  },
  hiitWorkout: {
    title: 'HIIT Circuit Training',
    category: 'cardio',
    duration: 20,
    intensity: 'high',
    description: 'High-intensity interval training for maximum calorie burn',
    caloriesBurn: 250,
    tags: ['indoor', 'intense', 'weight_loss'],
    recommendedFor: {
      age: [18, 45],
      gender: ['male', 'female', 'other'],
      fitnessLevel: ['intermediate', 'advanced'],
      medicalConditions: ['none'],
    }
  },

  // Strength Training
  bodyweightStrength: {
    title: 'Bodyweight Strength Training',
    category: 'strength',
    duration: 45,
    intensity: 'medium',
    description: 'Full body strength workout using your own body weight',
    caloriesBurn: 200,
    tags: ['indoor', 'no_equipment', 'strength'],
    recommendedFor: {
      age: [16, 70],
      gender: ['male', 'female', 'other'],
      fitnessLevel: ['beginner', 'intermediate'],
      medicalConditions: ['none', 'mild_joint_pain'],
    }
  },

  // Flexibility
  morningYoga: {
    title: 'Morning Yoga Flow',
    category: 'flexibility',
    duration: 20,
    intensity: 'low',
    description: 'Gentle yoga routine to improve flexibility and start your day',
    caloriesBurn: 100,
    tags: ['indoor', 'morning', 'relaxation'],
    recommendedFor: {
      age: [16, 80],
      gender: ['male', 'female', 'other'],
      fitnessLevel: ['beginner', 'intermediate', 'advanced'],
      medicalConditions: ['stress', 'anxiety', 'mild_back_pain'],
    }
  },

  // Mindfulness
  meditationSession: {
    title: 'Guided Meditation',
    category: 'mindfulness',
    duration: 15,
    intensity: 'low',
    description: 'Mindful meditation for stress relief and mental clarity',
    tags: ['indoor', 'relaxation', 'mental_health'],
    recommendedFor: {
      age: [16, 100],
      gender: ['male', 'female', 'other'],
      fitnessLevel: ['beginner', 'intermediate', 'advanced'],
      medicalConditions: ['stress', 'anxiety', 'depression'],
    }
  },

  // Nutrition
  mealPrep: {
    title: 'Healthy Meal Preparation',
    category: 'nutrition',
    duration: 60,
    intensity: 'low',
    description: 'Prepare healthy meals for the day',
    tags: ['meal_prep', 'nutrition', 'health'],
    recommendedFor: {
      age: [16, 100],
      gender: ['male', 'female', 'other'],
      fitnessLevel: ['beginner', 'intermediate', 'advanced'],
      medicalConditions: ['diabetes', 'hypertension', 'none'],
    }
  },
};

// Utility functions for task scheduling
export function createTimeSlot(hour: number, minute: number = 0): TimeSlot {
  const period = hour >= 12 ? 'PM' : 'AM';
  const adjustedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return { hour: adjustedHour, minute, period };
}

export function formatTimeSlot(timeSlot: TimeSlot): string {
  const { hour, minute, period } = timeSlot;
  return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
}

export function isTimeSlotAvailable(
  schedule: ScheduledTask[],
  newTask: ScheduledTask
): boolean {
  const taskStart = newTask.timeSlot;
  const taskEnd = createTimeSlot(
    taskStart.hour + Math.floor((taskStart.minute + newTask.duration) / 60),
    (taskStart.minute + newTask.duration) % 60
  );

  return !schedule.some(existingTask => {
    const existingStart = existingTask.timeSlot;
    const existingEnd = createTimeSlot(
      existingStart.hour + Math.floor((existingStart.minute + existingTask.duration) / 60),
      (existingStart.minute + existingTask.duration) % 60
    );

    // Check for overlap
    return !(
      (taskEnd.hour < existingStart.hour) ||
      (taskStart.hour > existingEnd.hour)
    );
  });
}

export function suggestAlternativeTimeSlot(
  schedule: ScheduledTask[],
  task: ScheduledTask
): TimeSlot {
  // Try to find the next available 30-minute slot
  for (let hour = 6; hour < 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const proposedSlot = createTimeSlot(hour, minute);
      const proposedTask = { ...task, timeSlot: proposedSlot };
      if (isTimeSlotAvailable(schedule, proposedTask)) {
        return proposedSlot;
      }
    }
  }
  // If no slot found, return default early morning slot
  return createTimeSlot(6, 0);
}

export function generateWeeklySchedule(
  userProfile: any,
  availableTasks: ScheduledTask[]
): ScheduledTask[][] {
  const weeklySchedule: ScheduledTask[][] = Array(7).fill([]).map(() => []);
  
  // Implementation of weekly schedule generation
  // This would consider user's preferences, availability, and task distribution

  return weeklySchedule;
}
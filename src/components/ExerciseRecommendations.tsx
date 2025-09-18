import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  duration?: string;
  intensity: 'Low' | 'Moderate' | 'High';
  description: string;
  benefits: string[];
  safetyNotes: string[];
}

interface ExerciseRoutine {
  category: string;
  frequency: string;
  exercises: Exercise[];
}

interface ExerciseRecommendationsProps {
  profile: {
    gender: 'male' | 'female';
    ageGroup: string;
    healthConditions: string[];
    fitnessGoals: string[];
  };
}

const exerciseDatabase: Record<string, ExerciseRoutine[]> = {
  'Weight Gain': [
    {
      category: 'Strength Training',
      frequency: '3-4 times per week',
      exercises: [
        {
          name: 'Compound Barbell Squats',
          sets: 4,
          reps: 8,
          intensity: 'High',
          description: 'Full-body compound movement targeting multiple muscle groups',
          benefits: ['Builds leg strength', 'Increases testosterone', 'Improves core stability'],
          safetyNotes: ['Keep proper form', 'Breathe consistently', 'Start with lighter weights']
        },
        {
          name: 'Deadlifts',
          sets: 4,
          reps: 6,
          intensity: 'High',
          description: 'Posterior chain development exercise',
          benefits: ['Overall strength gain', 'Improves posture', 'Builds muscle mass'],
          safetyNotes: ['Maintain neutral spine', 'Engage core', 'Use proper hip hinge']
        }
      ]
    }
  ],
  'Weight Loss': [
    {
      category: 'HIIT Cardio',
      frequency: '4-5 times per week',
      exercises: [
        {
          name: 'Burpees',
          sets: 3,
          reps: 12,
          duration: '30 seconds',
          intensity: 'High',
          description: 'Full-body explosive movement',
          benefits: ['Burns calories', 'Improves endurance', 'Builds strength'],
          safetyNotes: ['Land softly', 'Modify if needed', 'Take breaks when necessary']
        }
      ]
    }
  ]
};

function getRecommendedRoutines(profile: ExerciseRecommendationsProps['profile']): ExerciseRoutine[] {
  let routines: ExerciseRoutine[] = [];
  
  profile.fitnessGoals.forEach(goal => {
    if (exerciseDatabase[goal]) {
      // Filter and modify exercises based on health conditions and age group
      const adaptedRoutines = exerciseDatabase[goal].map(routine => {
        let adaptedExercises = routine.exercises;
        
        // Modify intensity based on age group
        if (profile.ageGroup === 'senior') {
          adaptedExercises = adaptedExercises.map(exercise => ({
            ...exercise,
            intensity: 'Low' as const,
            sets: Math.max(2, exercise.sets - 1),
            reps: Math.round(exercise.reps * 0.7)
          }));
        }

        // Adjust exercises based on health conditions
        if (profile.healthConditions.includes('Back Pain')) {
          adaptedExercises = adaptedExercises.filter(exercise => 
            !exercise.name.toLowerCase().includes('deadlift'));
        }

        return {
          ...routine,
          exercises: adaptedExercises
        };
      });

      routines = [...routines, ...adaptedRoutines];
    }
  });

  return routines;
}

export function ExerciseRecommendations({ profile }: ExerciseRecommendationsProps) {
  const recommendedRoutines = getRecommendedRoutines(profile);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Your Personalized Exercise Plan</CardTitle>
        <CardDescription>
          Customized for your goals, health conditions, and fitness level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {recommendedRoutines.map((routine, routineIndex) => (
            <AccordionItem key={routineIndex} value={`routine-${routineIndex}`}>
              <AccordionTrigger>
                <div className="flex items-center gap-4">
                  <span>{routine.category}</span>
                  <Badge variant="secondary">{routine.frequency}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {routine.exercises.map((exercise, exerciseIndex) => (
                    <Card key={exerciseIndex} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{exercise.name}</h4>
                          <Badge>{exercise.intensity} Intensity</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.duration && ` (${exercise.duration})`}
                        </p>
                        
                        <p className="text-sm">{exercise.description}</p>
                        
                        <div className="space-y-2">
                          <h5 className="font-medium">Benefits:</h5>
                          <ul className="list-disc pl-5 text-sm">
                            {exercise.benefits.map((benefit, i) => (
                              <li key={i}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="font-medium">Safety Notes:</h5>
                          <ul className="list-disc pl-5 text-sm text-red-600">
                            {exercise.safetyNotes.map((note, i) => (
                              <li key={i}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
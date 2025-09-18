import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Trophy,
  Heart,
  Dumbbell,
  Moon,
  BrainCircuit,
  CheckCircle2,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  fitnessGoal: string;
  activityLevel: string;
  medicalConditions: string[];
  preferredActivities: string[];
  availableTime: number;
  sleepSchedule: {
    wakeTime: string;
    bedTime: string;
  };
}

import {
  ScheduledTask,
  TaskCategory,
  taskTemplates,
  createTimeSlot,
  formatTimeSlot,
  isTimeSlotAvailable,
  suggestAlternativeTimeSlot
} from '../lib/taskScheduling';

import { TaskRecommendationEngine } from '../lib/taskRecommendation';

function generateDailyTasks(profile: UserProfile): ScheduledTask[] {
  // Initialize with default preferences and progress
  const defaultPreferences = {
    preferredTimes: {
      workout: ['morning', 'evening'],
      meditation: ['morning', 'night'],
      meals: ['morning', 'afternoon', 'evening'],
    },
    preferredDuration: {
      workout: 45,
      meditation: 15,
      other: 30,
    },
    dislikedActivities: [],
    favoriteActivities: [],
    equipmentAvailable: ['bodyweight'],
    indoorPreference: 0.5,
    intensity: {
      preferred: 'medium' as const,
      max: 'high' as const,
    },
  };

  const defaultProgress = {
    taskCompletionRate: {} as Record<TaskCategory, number>,
    consistencyScore: 0.5,
    lastCompletedTasks: [],
    progressByCategory: {} as Record<TaskCategory, {
      improvement: number;
      streak: number;
      lastActivity: Date;
    }>,
    challengeLevel: 'beginner' as const,
  };

  const recommendationEngine = new TaskRecommendationEngine(
    profile,
    defaultPreferences,
    defaultProgress
  );

  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();

  const factors = {
    userProfile: profile,
    preferences: defaultPreferences,
    progress: defaultProgress,
    timeOfDay: currentHour,
    dayOfWeek: currentDay,
    weather: {
      isOutdoorFavorable: true, // Could be connected to a weather API
      temperature: 22,
      condition: 'clear',
    },
  };

  const { age, gender, fitnessGoal, medicalConditions, availableTime, sleepSchedule } = profile;

  // Get recommended tasks from the engine
  const recommendedTasks = recommendationEngine.recommendTasks(factors, 6);

  // Convert user's wake time to scheduling start point
  const [wakeHour] = sleepSchedule.wakeTime.split(':').map(Number);
  let currentTimeSlot = createTimeSlot(wakeHour);

  // Assign time slots to recommended tasks
  const scheduledTasks = recommendedTasks.map(task => {
    const scheduledTask = {
      ...task,
      timeSlot: currentTimeSlot,
    };

    // Update current time slot for next task
    currentTimeSlot = createTimeSlot(
      currentTimeSlot.hour + Math.floor(task.duration / 60),
      (currentTimeSlot.minute + task.duration) % 60
    );

    return scheduledTask;
  });

  return scheduledTasks;
}

function isTaskSuitableForUser(task: Partial<ScheduledTask>, profile: UserProfile): boolean {
  if (!task.recommendedFor) return true;

  const { age, gender, activityLevel, medicalConditions } = profile;
  const { recommendedFor } = task;

  const fitnessLevel = activityLevel === 'very_active' ? 'advanced' :
                      activityLevel === 'active' ? 'intermediate' : 'beginner';

  return (
    age >= recommendedFor.age[0] &&
    age <= recommendedFor.age[1] &&
    recommendedFor.gender.includes(gender) &&
    recommendedFor.fitnessLevel.includes(fitnessLevel) &&
    (recommendedFor.medicalConditions.includes('all') ||
     recommendedFor.medicalConditions.includes('none') ||
     medicalConditions.some(condition => recommendedFor.medicalConditions.includes(condition)))
  );
}

interface DailyTaskboardProps {
  userProfile: UserProfile;
}

export function DailyTaskboard({ userProfile }: DailyTaskboardProps) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    const dailyTasks = generateDailyTasks(userProfile);
    setTasks(dailyTasks);
  }, [userProfile]);

  useEffect(() => {
    const completed = tasks.filter(task => task.completed).length;
    setCompletionRate((completed / tasks.length) * 100);
  }, [tasks]);

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exercise':
        return <Dumbbell className="w-5 h-5" />;
      case 'mindfulness':
        return <BrainCircuit className="w-5 h-5" />;
      case 'nutrition':
        return <Heart className="w-5 h-5" />;
      case 'sleep':
        return <Moon className="w-5 h-5" />;
      default:
        return <CalendarDays className="w-5 h-5" />;
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Daily Wellness Plan</CardTitle>
              <CardDescription>
                Personalized tasks based on your profile and goals
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-teal-600">{Math.round(completionRate)}%</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={completionRate} className="mb-6" />
          
          <div className="space-y-4">
            {tasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`transition-all duration-300 ${
                  task.completed ? 'bg-gray-50' : 'hover:shadow-md'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          task.completed ? 'bg-gray-100' : 'bg-teal-100'
                        }`}>
                          {getCategoryIcon(task.category)}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${
                            task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-500">{task.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary">
                              {task.duration} mins
                            </Badge>
                            <Badge className={getIntensityColor(task.intensity)}>
                              {task.intensity} intensity
                            </Badge>
                            <Badge variant="outline">
                              {formatTimeSlot(task.timeSlot)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={task.completed ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`min-w-[100px] ${
                          task.completed ? 'hover:bg-teal-50' : 'bg-teal-500 hover:bg-teal-600'
                        }`}
                      >
                        {task.completed ? (
                          <span className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Done
                          </span>
                        ) : (
                          'Complete'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Daily Progress</CardTitle>
          <CardDescription>Track your achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
              <div className="text-sm text-gray-500">Daily Goal Progress</div>
            </Card>
            <Card className="p-4 text-center">
              <Dumbbell className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <div className="text-2xl font-bold">
                {tasks.filter(t => (t.category === 'cardio' || t.category === 'strength') && t.completed).length}
              </div>
              <div className="text-sm text-gray-500">Exercises Completed</div>
            </Card>
            <Card className="p-4 text-center">
              <BrainCircuit className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.category === 'mindfulness' && t.completed).length}
              </div>
              <div className="text-sm text-gray-500">Mindfulness Sessions</div>
            </Card>
            <Card className="p-4 text-center">
              <Heart className="w-8 h-8 mx-auto text-red-500 mb-2" />
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.category === 'nutrition' && t.completed).length}
              </div>
              <div className="text-sm text-gray-500">Nutrition Goals Met</div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
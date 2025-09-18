import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Calendar } from "./ui/calendar";
import { EnhancedProfileForm } from "./EnhancedProfileForm";
import { ExerciseRecommendations } from "./ExerciseRecommendations";
import { YogaRecommendations } from "./YogaRecommendations";
import { MeditationRecommendations } from "./MeditationRecommendations";
import { LifestyleTips } from "./LifestyleTips";

interface WellnessProfile {
  gender?: 'male' | 'female';
  ageGroup?: 'child' | 'teen' | 'young-adult' | 'adult' | 'middle-aged' | 'senior';
  healthConditions?: string[];
  fitnessGoals?: string[];
}

interface DailySchedule {
  morning: {
    type: 'exercise' | 'yoga' | 'meditation';
    activity: string;
    duration: string;
  }[];
  afternoon: {
    type: 'exercise' | 'yoga' | 'meditation';
    activity: string;
    duration: string;
  }[];
  evening: {
    type: 'exercise' | 'yoga' | 'meditation';
    activity: string;
    duration: string;
  }[];
}

type WeeklySchedule = {
  [key: string]: DailySchedule;
};

export function PersonalizedDashboard() {
  const [profile, setProfile] = useState<WellnessProfile | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Generate a sample weekly schedule based on profile
  const generateWeeklySchedule = (profile: WellnessProfile): WeeklySchedule => {
    const schedule: WeeklySchedule = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach(day => {
      const dailySchedule: DailySchedule = {
        morning: [],
        afternoon: [],
        evening: []
      };

      // Add activities based on profile goals
      if (profile.fitnessGoals.includes('Weight Loss')) {
        dailySchedule.morning.push({
          type: 'exercise',
          activity: 'HIIT Cardio',
          duration: '30 mins'
        });
      }

      if (profile.fitnessGoals.includes('Stress Reduction')) {
        dailySchedule.evening.push({
          type: 'meditation',
          activity: 'Mindfulness Meditation',
          duration: '15 mins'
        });
      }

      // Add yoga on alternate days
      if (['Monday', 'Wednesday', 'Friday'].includes(day)) {
        dailySchedule.afternoon.push({
          type: 'yoga',
          activity: 'Dynamic Flow',
          duration: '45 mins'
        });
      }

      schedule[day] = dailySchedule;
    });

    return schedule;
  };

  const handleProfileSubmit = (data: WellnessProfile) => {
    setProfile(data);
  };

  const assertCompleteProfile = (profile: WellnessProfile | null): profile is {
  gender: 'male' | 'female';
  ageGroup: 'child' | 'teen' | 'young-adult' | 'adult' | 'middle-aged' | 'senior';
  healthConditions: string[];
  fitnessGoals: string[];
} => {
  return Boolean(
    profile &&
    profile.gender &&
    profile.ageGroup &&
    profile.healthConditions?.length &&
    profile.fitnessGoals?.length
  );
};

const isProfileComplete = assertCompleteProfile(profile);

  if (!isProfileComplete) {
    return (
      <div className="container mx-auto p-4">
        <EnhancedProfileForm onSubmit={handleProfileSubmit} />
      </div>
    );
  }

  const weeklySchedule = generateWeeklySchedule(profile);
  const today = new Date().toLocaleString('en-us', { weekday: 'long' });
  const todaySchedule = weeklySchedule[today];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Wellness Journey</CardTitle>
          <CardDescription>
            Personalized plan based on your profile and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="space-y-4">
              <h3 className="font-semibold text-lg">Today's Schedule</h3>
              
              <div className="grid gap-4">
                {['morning', 'afternoon', 'evening'].map((timeOfDay) => (
                  <Card key={timeOfDay}>
                    <CardHeader>
                      <CardTitle className="capitalize text-base">
                        {timeOfDay}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {todaySchedule[timeOfDay as keyof DailySchedule].length > 0 ? (
                        <ul className="space-y-2">
                          {todaySchedule[timeOfDay as keyof DailySchedule].map((activity, index) => (
                            <li key={index} className="flex justify-between items-center">
                              <span>{activity.activity}</span>
                              <span className="text-gray-600 text-sm">{activity.duration}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No activities scheduled</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="schedule">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Weekly Overview</h3>
                  <div className="space-y-2">
                    {Object.entries(weeklySchedule).map(([day, schedule]) => (
                      <div key={day} className="flex justify-between items-center">
                        <span className="font-medium">{day}</span>
                        <span className="text-sm text-gray-600">
                          {Object.values(schedule).flat().length} activities
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="activities" className="space-y-6">
              <ExerciseRecommendations profile={profile} />
              <YogaRecommendations profile={profile} />
              <MeditationRecommendations profile={profile} />
            </TabsContent>
            
            <TabsContent value="lifestyle">
              <LifestyleTips profile={profile} />
            </TabsContent>

            <TabsContent value="progress">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
                    <p className="text-gray-600">Coming soon: Progress tracking and statistics</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => setProfile(null)}
      >
        Update Profile
      </Button>
    </div>
  );
}
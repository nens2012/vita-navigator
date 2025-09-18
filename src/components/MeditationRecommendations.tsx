import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Progress } from "./ui/progress";

interface MeditationSession {
  type: string;
  duration: number; // in minutes
  description: string;
  benefits: string[];
  guidance: string[];
  preparation: string[];
}

interface MeditationRecommendationsProps {
  profile: {
    gender: 'male' | 'female';
    ageGroup: string;
    healthConditions: string[];
    fitnessGoals: string[];
  };
}

const meditationDatabase: Record<string, MeditationSession[]> = {
  'Stress Reduction': [
    {
      type: 'Body Scan Meditation',
      duration: 15,
      description: 'A guided practice of bringing attention to different parts of the body',
      benefits: [
        'Reduces physical tension',
        'Improves body awareness',
        'Promotes relaxation',
        'Helps with stress management'
      ],
      guidance: [
        'Find a comfortable position lying down',
        'Close your eyes and take deep breaths',
        'Bring attention to your toes and gradually move up',
        'Notice any sensations without judgment',
        'Release tension with each exhale'
      ],
      preparation: [
        'Find a quiet space',
        'Use a comfortable mat or cushion',
        'Ensure you won\'t be disturbed',
        'Wear comfortable clothing'
      ]
    },
    {
      type: 'Mantra Meditation',
      duration: 10,
      description: 'Using sacred sounds to calm the mind and promote inner peace',
      benefits: [
        'Calms mental chatter',
        'Improves concentration',
        'Reduces anxiety',
        'Promotes emotional stability'
      ],
      guidance: [
        'Sit comfortably with spine straight',
        'Choose a meaningful mantra',
        'Repeat the mantra silently',
        'Let thoughts pass without attachment',
        'Maintain steady breathing'
      ],
      preparation: [
        'Choose a quiet time of day',
        'Set up a dedicated meditation space',
        'Consider using a meditation cushion',
        'Remove potential distractions'
      ]
    }
  ],
  'Weight Loss': [
    {
      type: 'Mindful Eating Meditation',
      duration: 20,
      description: 'Developing awareness around eating habits and food choices',
      benefits: [
        'Improves eating habits',
        'Reduces emotional eating',
        'Enhances digestion',
        'Promotes healthy food choices'
      ],
      guidance: [
        'Observe your food without judgment',
        'Notice colors, textures, and smells',
        'Take small, mindful bites',
        'Chew slowly and thoroughly',
        'Notice hunger and fullness cues'
      ],
      preparation: [
        'Choose a quiet eating space',
        'Remove distractions (phone, TV)',
        'Set aside dedicated meal time',
        'Prepare food mindfully'
      ]
    }
  ]
};

function getRecommendedSessions(profile: MeditationRecommendationsProps['profile']): MeditationSession[] {
  let sessions: MeditationSession[] = [];
  
  profile.fitnessGoals.forEach(goal => {
    if (meditationDatabase[goal]) {
      // Adapt sessions based on user profile
      const adaptedSessions = meditationDatabase[goal].map(session => {
        let adaptedDuration = session.duration;
        
        // Modify duration based on age group
        if (profile.ageGroup === 'senior' || profile.ageGroup === 'child') {
          adaptedDuration = Math.max(5, Math.round(session.duration * 0.7));
        }

        return {
          ...session,
          duration: adaptedDuration
        };
      });

      sessions = [...sessions, ...adaptedSessions];
    }
  });

  return sessions;
}

export function MeditationRecommendations({ profile }: MeditationRecommendationsProps) {
  const recommendedSessions = getRecommendedSessions(profile);
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const startSession = (session: MeditationSession) => {
    setActiveSession(session);
    setIsSessionActive(true);
    setProgress(0);
    
    // Simulate meditation progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSessionActive(false);
          return 100;
        }
        return prev + (100 / (session.duration * 60));
      });
    }, 1000);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Your Meditation Journey</CardTitle>
        <CardDescription>
          Personalized meditation practices to support your wellness goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sessions">Meditation Sessions</TabsTrigger>
            <TabsTrigger value="timer">Active Session</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sessions">
            <div className="grid gap-4 md:grid-cols-2">
              {recommendedSessions.map((session, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{session.type}</h3>
                        <p className="text-sm text-gray-600">{session.duration} minutes</p>
                      </div>
                      <Badge variant="secondary">
                        {session.duration <= 10 ? 'Quick' : 'Extended'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm">{session.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Benefits:</h4>
                      <ul className="list-disc pl-5 text-sm">
                        {session.benefits.map((benefit, i) => (
                          <li key={i}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => startSession(session)}
                      disabled={isSessionActive}
                    >
                      Start Session
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="timer">
            <Card>
              <CardContent className="pt-6">
                {activeSession && isSessionActive ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-semibold">{activeSession.type}</h3>
                      <p className="text-gray-600">Session in progress...</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-center">
                        {Math.round((progress / 100) * activeSession.duration)} min of {activeSession.duration} min
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Current Guidance:</h4>
                        <p className="text-sm">
                          {activeSession.guidance[Math.floor((progress / 100) * activeSession.guidance.length)]}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="text-xl font-semibold mb-2">No Active Session</h3>
                    <p className="text-gray-600">Select a meditation session to begin your practice</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
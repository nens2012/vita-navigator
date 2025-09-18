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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface YogaPose {
  name: string;
  sanskritName: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  benefits: string[];
  modifications: {
    beginner: string;
    intermediate?: string;
    advanced?: string;
  };
  breathingTechnique: string;
  contraindications: string[];
}

interface YogaRoutine {
  category: string;
  duration: string;
  poses: YogaPose[];
}

interface YogaRecommendationsProps {
  profile: {
    gender: 'male' | 'female';
    ageGroup: string;
    healthConditions: string[];
    fitnessGoals: string[];
  };
}

const yogaDatabase: Record<string, YogaRoutine[]> = {
  'Stress Reduction': [
    {
      category: 'Relaxation Flow',
      duration: '20-30 minutes',
      poses: [
        {
          name: 'Child\'s Pose',
          sanskritName: 'Balasana',
          duration: '3-5 breaths',
          difficulty: 'Beginner',
          description: 'A restful pose that gently stretches the back and promotes relaxation',
          benefits: [
            'Calms the mind',
            'Relieves back tension',
            'Reduces stress and anxiety'
          ],
          modifications: {
            beginner: 'Use a cushion under the forehead',
            intermediate: 'Extend arms further forward',
            advanced: 'Widen knees and lower chest completely'
          },
          breathingTechnique: 'Deep belly breathing',
          contraindications: [
            'Late-term pregnancy',
            'Knee injuries'
          ]
        },
        {
          name: 'Corpse Pose',
          sanskritName: 'Shavasana',
          duration: '5-10 minutes',
          difficulty: 'Beginner',
          description: 'Final relaxation pose for deep rest and integration',
          benefits: [
            'Reduces stress and fatigue',
            'Calms the nervous system',
            'Promotes mental clarity'
          ],
          modifications: {
            beginner: 'Use support under knees',
            intermediate: 'Practice with guided meditation',
            advanced: 'Extended duration with breath awareness'
          },
          breathingTechnique: 'Natural breathing with awareness',
          contraindications: [
            'None'
          ]
        }
      ]
    }
  ],
  'Weight Loss': [
    {
      category: 'Dynamic Flow',
      duration: '45-60 minutes',
      poses: [
        {
          name: 'Sun Salutation',
          sanskritName: 'Surya Namaskar',
          duration: '10 rounds',
          difficulty: 'Intermediate',
          description: 'A flowing sequence that builds heat and energy',
          benefits: [
            'Increases metabolism',
            'Improves cardiovascular fitness',
            'Builds strength and flexibility'
          ],
          modifications: {
            beginner: 'Modified push-ups, step back instead of jump',
            intermediate: 'Full push-ups, small jumps',
            advanced: 'Float transitions, full expressions'
          },
          breathingTechnique: 'Ujjayi breath',
          contraindications: [
            'High blood pressure',
            'Back injuries'
          ]
        }
      ]
    }
  ]
};

function getRecommendedRoutines(profile: YogaRecommendationsProps['profile']): YogaRoutine[] {
  let routines: YogaRoutine[] = [];
  
  profile.fitnessGoals.forEach(goal => {
    if (yogaDatabase[goal]) {
      // Adapt routines based on health conditions and age group
      const adaptedRoutines = yogaDatabase[goal].map(routine => {
        let adaptedPoses = routine.poses;
        
        // Modify difficulty based on age group
        if (profile.ageGroup === 'senior') {
          adaptedPoses = adaptedPoses.map(pose => ({
            ...pose,
            difficulty: 'Beginner' as const,
            duration: pose.duration.includes('rounds') 
              ? `${Math.round(parseInt(pose.duration) * 0.5)} rounds`
              : pose.duration
          }));
        }

        // Filter poses based on health conditions
        if (profile.healthConditions.includes('Back Pain')) {
          adaptedPoses = adaptedPoses.filter(pose => 
            !pose.contraindications.includes('Back injuries'));
        }

        return {
          ...routine,
          poses: adaptedPoses
        };
      });

      routines = [...routines, ...adaptedRoutines];
    }
  });

  return routines;
}

export function YogaRecommendations({ profile }: YogaRecommendationsProps) {
  const recommendedRoutines = getRecommendedRoutines(profile);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Your Personalized Yoga Practice</CardTitle>
        <CardDescription>
          Customized sequences to support your wellness journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="routines" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="routines">Routines</TabsTrigger>
            <TabsTrigger value="breathing">Breathing Practices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="routines">
            <Accordion type="single" collapsible className="w-full">
              {recommendedRoutines.map((routine, routineIndex) => (
                <AccordionItem key={routineIndex} value={`routine-${routineIndex}`}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                      <span>{routine.category}</span>
                      <Badge variant="secondary">{routine.duration}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {routine.poses.map((pose, poseIndex) => (
                        <Card key={poseIndex} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{pose.name}</h4>
                                <p className="text-sm text-gray-600">{pose.sanskritName}</p>
                              </div>
                              <Badge>{pose.difficulty}</Badge>
                            </div>
                            
                            <p className="text-sm">Duration: {pose.duration}</p>
                            <p className="text-sm">{pose.description}</p>
                            
                            <div className="space-y-2">
                              <h5 className="font-medium">Benefits:</h5>
                              <ul className="list-disc pl-5 text-sm">
                                {pose.benefits.map((benefit, i) => (
                                  <li key={i}>{benefit}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="space-y-2">
                              <h5 className="font-medium">Modifications:</h5>
                              <div className="text-sm space-y-1">
                                <p><span className="font-medium">Beginner:</span> {pose.modifications.beginner}</p>
                                {pose.modifications.intermediate && (
                                  <p><span className="font-medium">Intermediate:</span> {pose.modifications.intermediate}</p>
                                )}
                                {pose.modifications.advanced && (
                                  <p><span className="font-medium">Advanced:</span> {pose.modifications.advanced}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <h5 className="font-medium">Breathing:</h5>
                              <p className="text-sm">{pose.breathingTechnique}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
          
          <TabsContent value="breathing">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Ujjayi Breath (Victorious Breath)</h3>
                    <p className="text-sm text-gray-600">
                      A gentle ocean-sounding breath that helps calm the mind and warm the body.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Anulom Vilom (Alternate Nostril Breathing)</h3>
                    <p className="text-sm text-gray-600">
                      Balancing breath technique that helps reduce stress and improve focus.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Deep Belly Breathing</h3>
                    <p className="text-sm text-gray-600">
                      Fundamental breathing practice for relaxation and stress reduction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
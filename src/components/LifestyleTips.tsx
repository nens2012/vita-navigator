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

interface Tip {
  category: string;
  title: string;
  description: string;
  importance: 'High' | 'Medium' | 'Low';
  actionItems: string[];
}

interface NutritionPlan {
  type: string;
  description: string;
  meals: {
    timing: string;
    suggestions: string[];
    notes: string;
  }[];
  guidelines: string[];
}

interface LifestyleTipsProps {
  profile: {
    gender: 'male' | 'female';
    ageGroup: 'child' | 'teen' | 'young-adult' | 'adult' | 'middle-aged' | 'senior';
    healthConditions: string[];
    fitnessGoals: string[];
  };
}

const nutritionDatabase: Record<string, NutritionPlan> = {
  'Weight Gain': {
    type: 'Caloric Surplus Diet',
    description: 'Focus on nutrient-dense foods to support healthy weight gain',
    meals: [
      {
        timing: 'Breakfast',
        suggestions: [
          'Oatmeal with nuts and fruits',
          'Protein smoothie with banana',
          'Whole grain toast with avocado and eggs'
        ],
        notes: 'Aim for 500-700 calories'
      },
      {
        timing: 'Mid-Morning Snack',
        suggestions: [
          'Greek yogurt with granola',
          'Trail mix with dried fruits',
          'Protein bar'
        ],
        notes: 'About 300 calories'
      }
    ],
    guidelines: [
      'Eat every 3-4 hours',
      'Include protein with each meal',
      'Focus on complex carbohydrates',
      'Add healthy fats to increase calories'
    ]
  },
  'Weight Loss': {
    type: 'Caloric Deficit Diet',
    description: 'Focus on nutrient-dense, low-calorie foods',
    meals: [
      {
        timing: 'Breakfast',
        suggestions: [
          'Egg white omelet with vegetables',
          'Greek yogurt with berries',
          'Overnight oats with chia seeds'
        ],
        notes: 'Aim for 300-400 calories'
      },
      {
        timing: 'Mid-Morning Snack',
        suggestions: [
          'Apple with small handful of almonds',
          'Celery with hummus',
          'Low-fat string cheese'
        ],
        notes: 'About 100-150 calories'
      }
    ],
    guidelines: [
      'Create a moderate caloric deficit',
      'Increase protein intake',
      'Include plenty of fiber',
      'Stay hydrated with water'
    ]
  }
};

const lifestyleTipsDatabase: Record<string, Tip[]> = {
  'General Wellness': [
    {
      category: 'Sleep Hygiene',
      title: 'Optimize Your Sleep Schedule',
      description: 'Quality sleep is crucial for recovery and overall wellness',
      importance: 'High',
      actionItems: [
        'Maintain consistent sleep and wake times',
        'Create a relaxing bedtime routine',
        'Keep your bedroom cool and dark',
        'Avoid screens 1 hour before bed'
      ]
    },
    {
      category: 'Stress Management',
      title: 'Daily Stress Relief Practices',
      description: 'Incorporate stress-reducing activities into your routine',
      importance: 'High',
      actionItems: [
        'Practice deep breathing exercises',
        'Take regular breaks during work',
        'Spend time in nature',
        'Maintain social connections'
      ]
    }
  ],
  'PCOD/PCOS': [
    {
      category: 'Lifestyle Management',
      title: 'PCOS-Specific Lifestyle Changes',
      description: 'Manage PCOS symptoms through lifestyle modifications',
      importance: 'High',
      actionItems: [
        'Maintain a consistent exercise routine',
        'Focus on stress reduction',
        'Get regular health check-ups',
        'Track your menstrual cycle'
      ]
    }
  ]
};

function getRelevantTips(profile: LifestyleTipsProps['profile']): Tip[] {
  let tips: Tip[] = [];
  
  // Add general wellness tips for everyone
  tips = [...tips, ...lifestyleTipsDatabase['General Wellness']];
  
  // Add condition-specific tips
  profile.healthConditions.forEach(condition => {
    if (lifestyleTipsDatabase[condition]) {
      tips = [...tips, ...lifestyleTipsDatabase[condition]];
    }
  });
  
  return tips;
}

function getRelevantNutritionPlan(profile: LifestyleTipsProps['profile']): NutritionPlan | null {
  const relevantGoal = profile.fitnessGoals.find(goal => 
    nutritionDatabase[goal]
  );
  
  return relevantGoal ? nutritionDatabase[relevantGoal] : null;
}

export function LifestyleTips({ profile }: LifestyleTipsProps) {
  const tips = getRelevantTips(profile);
  const nutritionPlan = getRelevantNutritionPlan(profile);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lifestyle & Wellness Tips</CardTitle>
          <CardDescription>
            Personalized recommendations for your wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {tips.map((tip, index) => (
              <AccordionItem key={index} value={`tip-${index}`}>
                <AccordionTrigger>
                  <div className="flex items-center gap-4">
                    <span>{tip.title}</span>
                    <Badge variant={
                      tip.importance === 'High' ? 'destructive' :
                      tip.importance === 'Medium' ? 'default' : 'secondary'
                    }>
                      {tip.importance} Priority
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">{tip.description}</p>
                    <div>
                      <h4 className="font-medium mb-2">Action Items:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {tip.actionItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {nutritionPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Nutrition Guidelines</CardTitle>
            <CardDescription>{nutritionPlan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Meal Planning</h3>
                <div className="space-y-4">
                  {nutritionPlan.meals.map((meal, index) => (
                    <div key={index} className="border-b pb-4">
                      <h4 className="font-medium mb-2">{meal.timing}</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {meal.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-600 mt-2">{meal.notes}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Key Guidelines</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {nutritionPlan.guidelines.map((guideline, index) => (
                    <li key={index}>{guideline}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
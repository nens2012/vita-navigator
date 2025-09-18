import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  UserProfile,
  Gender,
  MedicalCondition,
  FitnessGoal,
  isValidAge,
  getMedicalConditionsByGender,
  validateUserProfile
} from '@/lib/types';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number()
    .min(13, 'Must be at least 13 years old')
    .max(120, 'Age must be realistic'),
  gender: z.enum(['male', 'female', 'other'] as const),
  medicalConditions: z.array(z.string()).min(1, 'Select at least one option (choose "none" if no conditions)'),
  fitnessGoal: z.enum([
    'weight_loss',
    'strength',
    'flexibility',
    'stress_relief',
    'general_health'
  ] as const)
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface HealthProfileFormProps {
  onSubmit: (data: UserProfile) => void;
  initialData?: Partial<UserProfile>;
}

const fitnessGoalOptions: { value: FitnessGoal; label: string }[] = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'strength', label: 'Build Strength' },
  { value: 'flexibility', label: 'Improve Flexibility' },
  { value: 'stress_relief', label: 'Stress Relief' },
  { value: 'general_health', label: 'General Health & Wellness' }
];

export function HealthProfileForm({ onSubmit, initialData }: HealthProfileFormProps) {
  const [availableConditions, setAvailableConditions] = useState<MedicalCondition[]>([]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData?.name || '',
      age: initialData?.age || undefined,
      gender: initialData?.gender || undefined,
      medicalConditions: initialData?.medicalConditions || [],
      fitnessGoal: initialData?.fitnessGoal || undefined,
    }
  });

  // Update available medical conditions when gender changes
  useEffect(() => {
    const gender = form.watch('gender');
    if (gender) {
      setAvailableConditions(getMedicalConditionsByGender(gender));
    }
  }, [form.watch('gender')]);

  const handleSubmit = (data: ProfileFormData) => {
    // Ensure all required fields are present and correctly typed
    const userProfile: UserProfile = {
      name: data.name,
      age: data.age,
      gender: data.gender,
      medicalConditions: data.medicalConditions as MedicalCondition[],
      fitnessGoal: data.fitnessGoal,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Validate the profile before submitting
    const errors = validateUserProfile(userProfile);
    if (errors.length > 0) {
      errors.forEach(error => form.setError('root', { message: error }));
      return;
    }

    onSubmit(userProfile);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter your age" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medicalConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medical Conditions</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const currentValues = field.value || [];
                    if (value === 'none') {
                      field.onChange(['none']);
                    } else {
                      const newValues = currentValues.includes(value)
                        ? currentValues.filter(v => v !== value)
                        : [...currentValues.filter(v => v !== 'none'), value];
                      field.onChange(newValues);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select medical conditions" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableConditions.map((condition) => (
                      <SelectItem 
                        key={condition} 
                        value={condition}
                      >
                        {condition.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((condition) => (
                    <Button
                      key={condition}
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        field.onChange(
                          field.value?.filter((v) => v !== condition)
                        );
                      }}
                      type="button"
                    >
                      {condition.replace('_', ' ').toUpperCase()} ×
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fitnessGoal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Fitness Goal</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary goal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fitnessGoalOptions.map((goal) => (
                      <SelectItem key={goal.value} value={goal.value}>
                        {goal.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Alert className="my-4">
            <AlertDescription>
              Your wellness plan will be personalized based on your profile data. You can update these details anytime to adjust your recommendations.
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full">
            Create My Personalized Plan
          </Button>
        </form>
      </Form>
    </Card>
  );
}
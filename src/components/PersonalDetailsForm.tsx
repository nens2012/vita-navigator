import { useState } from 'react';
import { motion } from 'framer-motion';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const personalDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(13, 'Must be at least 13 years old').max(120, 'Please enter a valid age'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select your gender',
  }),
  medicalConditions: z.array(z.string()).min(1, 'Select at least one option (or "none")'),
  fitnessGoal: z.enum(['weight_loss', 'muscle_gain', 'flexibility', 'cardiovascular', 'stress_reduction', 'general_wellness'], {
    required_error: 'Please select your primary fitness goal',
  }),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active'], {
    required_error: 'Please select your current activity level',
  }),
  preferredActivities: z.array(z.string()).min(1, 'Select at least one preferred activity'),
  availableTime: z.number().min(15, 'Minimum 15 minutes').max(180, 'Maximum 3 hours'),
  sleepSchedule: z.object({
    wakeTime: z.string(),
    bedTime: z.string(),
  }),
});

type PersonalDetailsData = z.infer<typeof personalDetailsSchema>;

const medicalConditionOptions = [
  { value: 'none', label: 'No Medical Conditions' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hypertension', label: 'Hypertension' },
  { value: 'arthritis', label: 'Arthritis' },
  { value: 'asthma', label: 'Asthma' },
  { value: 'heart_disease', label: 'Heart Disease' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'depression', label: 'Depression' },
  { value: 'thyroid', label: 'Thyroid Conditions' },
];

interface PersonalDetailsFormProps {
  onSubmit: (data: PersonalDetailsData) => void;
  initialData?: Partial<PersonalDetailsData>;
}

export function PersonalDetailsForm({ onSubmit, initialData }: PersonalDetailsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    initialData?.medicalConditions || []
  );

  const form = useForm<PersonalDetailsData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      name: initialData?.name || '',
      age: initialData?.age,
      gender: initialData?.gender,
      medicalConditions: initialData?.medicalConditions || [],
    },
  });

  const handleSubmit = async (data: PersonalDetailsData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConditionSelect = (condition: string) => {
    let newConditions: string[];
    
    if (condition === 'none') {
      newConditions = ['none'];
    } else {
      if (selectedConditions.includes('none')) {
        newConditions = [condition];
      } else if (selectedConditions.includes(condition)) {
        newConditions = selectedConditions.filter(c => c !== condition);
      } else {
        newConditions = [...selectedConditions, condition];
      }
    }
    
    setSelectedConditions(newConditions);
    form.setValue('medicalConditions', newConditions);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Help us personalize your wellness journey
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="h-11 rounded-lg bg-white/50 backdrop-blur-sm"
                        disabled={isLoading}
                        {...field}
                      />
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
                        className="h-11 rounded-lg bg-white/50 backdrop-blur-sm"
                        disabled={isLoading}
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
                        <SelectTrigger className="h-11 rounded-lg bg-white/50 backdrop-blur-sm">
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
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {medicalConditionOptions.map((condition) => (
                          <Button
                            key={condition.value}
                            type="button"
                            variant={selectedConditions.includes(condition.value) ? "default" : "outline"}
                            className={`h-9 rounded-full ${
                              selectedConditions.includes(condition.value)
                                ? "bg-teal-500 hover:bg-teal-600"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => handleConditionSelect(condition.value)}
                          >
                            {condition.label}
                          </Button>
                        ))}
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="pt-4"
              >
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Complete Profile
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
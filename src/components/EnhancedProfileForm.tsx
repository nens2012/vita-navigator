import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const profileSchema = z.object({
  gender: z.enum(["male", "female"]),
  ageGroup: z.enum(["child", "teen", "young-adult", "adult", "middle-aged", "senior"]),
  healthConditions: z.array(z.string()).min(1),
  fitnessGoals: z.array(z.string()).min(1),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const healthConditionOptions = [
  "PCOD/PCOS",
  "Diabetes",
  "Obesity",
  "Hypertension",
  "Back Pain",
  "Stress",
  "None",
];

const fitnessGoalOptions = [
  "Weight Gain",
  "Weight Loss",
  "Stress Reduction",
  "Flexibility",
  "Stamina",
  "Strength",
  "General Wellness",
];

const ageGroupLabels = {
  "child": "Child (5-12)",
  "teen": "Teen (13-19)",
  "young-adult": "Young Adult (20-35)",
  "adult": "Adult (36-50)",
  "middle-aged": "Middle Aged (51-65)",
  "senior": "Senior (65+)",
};

export function EnhancedProfileForm({
  onSubmit,
}: {
  onSubmit: (data: ProfileFormData) => void;
}) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      healthConditions: [],
      fitnessGoals: [],
    },
  });

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Wellness Profile</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ageGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age Group</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your age group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(ageGroupLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="healthConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Conditions</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const currentValues = field.value || [];
                    if (!currentValues.includes(value)) {
                      field.onChange([...currentValues, value]);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select health conditions" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {healthConditionOptions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
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
                    >
                      {condition} ×
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fitnessGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fitness Goals</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const currentValues = field.value || [];
                    if (!currentValues.includes(value)) {
                      field.onChange([...currentValues, value]);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your fitness goals" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fitnessGoalOptions.map((goal) => (
                      <SelectItem key={goal} value={goal}>
                        {goal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((goal) => (
                    <Button
                      key={goal}
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        field.onChange(field.value?.filter((v) => v !== goal));
                      }}
                    >
                      {goal} ×
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Create My Wellness Plan
          </Button>
        </form>
      </Form>
    </Card>
  );
}
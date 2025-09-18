import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, User, Target, Calendar, Heart, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  onboardingSchema, 
  calculateBMI, 
  getBMICategory,
  getAgeBasedRecommendations,
  getGenderSpecificWorkouts,
  type OnboardingData 
} from "../lib/onboarding";
import { Gender, type MedicalCondition } from "../lib/types";

interface OnboardingStepperProps {
  onComplete: (data: OnboardingData) => void;
  initialData: Partial<OnboardingData>;
}

export const OnboardingStepper = ({ onComplete, initialData }: OnboardingStepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    goals: {
      fitnessGoals: [],
      healthGoals: []
    },
    personalDetails: {
      name: "",
      age: 0,
      gender: "male"
    },
    physicalDetails: {
      weight: 0,
      height: 0,
      medicalConditions: [],
      hasPCOD: false
    },
    preferences: {
      activityPreference: "both",
      timePerDay: 30,
      dietPreference: "no-preference",
      periodInfo: {
        cycleLength: 28,
        lastPeriod: ""
      }
    }
  });

  const totalSteps = 4;

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.personalDetails?.name && 
               formData.personalDetails?.age && 
               formData.personalDetails?.gender;
      case 2:
        return formData.physicalDetails?.weight && 
               formData.physicalDetails?.height;
      case 3:
        return formData.goals?.fitnessGoals?.length > 0;
      case 4:
        return formData.preferences?.activityPreference && 
               formData.preferences?.timePerDay;
      default:
        return false;
    }
  };

  const getBMI = () => {
    const weight = formData.physicalDetails?.weight;
    const height = formData.physicalDetails?.height;
    if (weight && height) {
      return calculateBMI(weight, height);
    }
    return null;
  };

  const getBMIMessage = () => {
    const bmi = getBMI();
    if (!bmi) return null;
    const category = getBMICategory(bmi);
    return `Your BMI is ${bmi} (${category})`;
  };

  const getWorkflowMessage = () => {
    const age = formData.personalDetails?.age;
    const gender = formData.personalDetails?.gender;
    
    if (!gender || !age) return "";

    const ageRecommendations = getAgeBasedRecommendations(age);
    const genderWorkouts = getGenderSpecificWorkouts(
      gender as Gender,
      formData.physicalDetails?.hasPCOD
    );

    return `Based on your profile: ${ageRecommendations.recommendations[0]}. 
    Recommended activities include: ${genderWorkouts.workouts.join(", ")}.`;
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 text-muted-foreground disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-wellness-blue font-medium">{currentStep}</span>
          <span className="text-muted-foreground">of {totalSteps}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary rounded-full h-2 mb-8">
        <div 
          className="bg-wellness-blue h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-wellness-blue/10 rounded-full mb-4">
                <User className="w-8 h-8 text-wellness-blue" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Personal Details</h2>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.personalDetails?.name || ""}
                onChange={(e) => updateFormData({ 
                  personalDetails: {
                    ...formData.personalDetails,
                    name: e.target.value
                  }
                })}
                className="wellness-input"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Age"
                  value={formData.personalDetails?.age || ""}
                  onChange={(e) => updateFormData({ 
                    personalDetails: {
                      ...formData.personalDetails,
                      age: parseInt(e.target.value)
                    }
                  })}
                  className="wellness-input"
                />
                
                <select
                  value={formData.personalDetails?.gender || ""}
                  onChange={(e) => updateFormData({ 
                    personalDetails: {
                      ...formData.personalDetails,
                      gender: e.target.value as Gender
                    }
                  })}
                  className="wellness-input"
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {formData.personalDetails?.gender && formData.personalDetails?.age && (
                <div className="bg-accent p-4 rounded-xl">
                  <p className="text-sm font-medium text-accent-foreground">
                    Your wellness path: {getWorkflowMessage()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Physical Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-wellness-blue/10 rounded-full mb-4">
                <Heart className="w-8 h-8 text-wellness-blue" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Physical Details</h2>
              <p className="text-muted-foreground">Help us personalize your plan</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={formData.physicalDetails?.weight || ""}
                      onChange={(e) => updateFormData({
                        physicalDetails: {
                          ...formData.physicalDetails,
                          weight: parseFloat(e.target.value)
                        }
                      })}
                      className="wellness-input"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="number"
                      placeholder="Height (cm)"
                      value={formData.physicalDetails?.height || ""}
                      onChange={(e) => updateFormData({
                        physicalDetails: {
                          ...formData.physicalDetails,
                          height: parseFloat(e.target.value)
                        }
                      })}
                      className="wellness-input"
                    />
                  </div>
                </div>              {getBMI() && (
                <div className="bg-accent p-4 rounded-xl">
                  <p className="text-sm font-medium text-accent-foreground">
                    Your BMI: {getBMI()}
                  </p>
                </div>
              )}

              <textarea
                placeholder="Any medical history or conditions we should know about? (Optional)"
                value={formData.medicalHistory || ""}
                onChange={(e) => updateFormData({ medicalHistory: e.target.value })}
                className="wellness-input min-h-20 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-wellness-blue/10 rounded-full mb-4">
                <Target className="w-8 h-8 text-wellness-blue" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your Goals</h2>
              <p className="text-muted-foreground">What do you want to achieve?</p>
            </div>

            <div className="space-y-3">
              {[
                "Weight Loss",
                "Muscle Gain",
                "Stress Relief",
                "Better Sleep",
                "General Fitness",
                ...(formData.personalDetails?.gender === 'female' 
                  ? ["Menstrual Health", "PCOD Care", "Post-pregnancy Recovery"] 
                  : [])
              ].map((goal) => (
                <label
                  key={goal}
                  className="flex items-center p-4 bg-card border border-border rounded-xl cursor-pointer hover:bg-accent transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.goals?.fitnessGoals?.includes(goal) || false}
                    onChange={(e) => {
                      const currentGoals = formData.goals?.fitnessGoals || [];
                      updateFormData({
                        goals: {
                          ...formData.goals,
                          fitnessGoals: e.target.checked
                            ? [...currentGoals, goal]
                            : currentGoals.filter(g => g !== goal)
                        }
                      });
                    }}
                    className="mr-3 w-5 h-5 text-wellness-blue"
                  />
                  <span className="font-medium">{goal}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Preferences */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-wellness-blue/10 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-wellness-blue" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Preferences</h2>
              <p className="text-muted-foreground">Customize your experience</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Activity Preference</label>
                <select
                  value={formData.activityPreference || ""}
                  onChange={(e) => updateFormData({ activityPreference: e.target.value })}
                  className="wellness-input"
                >
                  <option value="">Select preference</option>
                  <option value="yoga">Yoga</option>
                  <option value="exercise">Exercise</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time per day (minutes)</label>
                <select
                  value={formData.timePerDay || ""}
                  onChange={(e) => updateFormData({ timePerDay: parseInt(e.target.value) })}
                  className="wellness-input"
                >
                  <option value="">Select time</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Diet Preference</label>
                <select
                  value={formData.dietPreference || ""}
                  onChange={(e) => updateFormData({ dietPreference: e.target.value })}
                  className="wellness-input"
                >
                  <option value="">Select preference</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="no-preference">No Preference</option>
                </select>
              </div>

              {formData.gender === "female" && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Period Information (Optional)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Cycle length (days)"
                      value={formData.periodInfo?.cycleLength || ""}
                      onChange={(e) => updateFormData({ 
                        periodInfo: { 
                          ...formData.periodInfo, 
                          cycleLength: parseInt(e.target.value) 
                        } 
                      })}
                      className="wellness-input"
                    />
                    <input
                      type="date"
                      placeholder="Last period date"
                      value={formData.periodInfo?.lastPeriod || ""}
                      onChange={(e) => updateFormData({ 
                        periodInfo: { 
                          ...formData.periodInfo, 
                          lastPeriod: e.target.value 
                        } 
                      })}
                      className="wellness-input"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-6 left-6 right-6">
        <button
          onClick={nextStep}
          disabled={!isStepValid()}
          className="w-full wellness-button-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {currentStep === totalSteps ? "Complete Setup" : "Continue"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
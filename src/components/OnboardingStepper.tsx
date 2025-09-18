import { useState } from "react";
import { ChevronLeft, ChevronRight, User, Target, Calendar, Heart } from "lucide-react";

interface OnboardingStepperProps {
  onComplete: (data: any) => void;
  initialData: any;
}

interface StepData {
  name: string;
  age: number;
  gender: "male" | "female";
  weight: number;
  height: number;
  medicalHistory: string;
  goals: string[];
  activityPreference: string;
  timePerDay: number;
  dietPreference: string;
  periodInfo?: {
    cycleLength: number;
    lastPeriod: string;
  };
}

export const OnboardingStepper = ({ onComplete, initialData }: OnboardingStepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<StepData>>({
    goals: [],
  });

  const totalSteps = 4;

  const updateFormData = (data: Partial<StepData>) => {
    setFormData({ ...formData, ...data });
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
        return formData.name && formData.age && formData.gender;
      case 2:
        return formData.weight && formData.height;
      case 3:
        return formData.goals && formData.goals.length > 0;
      case 4:
        return formData.activityPreference && formData.timePerDay;
      default:
        return false;
    }
  };

  const getBMI = () => {
    if (formData.weight && formData.height) {
      const heightInM = formData.height / 100;
      return (formData.weight / (heightInM * heightInM)).toFixed(1);
    }
    return null;
  };

  const getMaleGoals = () => [
    "Weight Loss", "Muscle Gain", "Stress Relief", "Endurance", "General Fitness"
  ];

  const getFemaleGoals = () => [
    "Weight Loss", "Stress Relief", "Better Sleep", "Menstrual Health", 
    "PCOD Care", "Post-pregnancy Recovery", "General Fitness"
  ];

  const getWorkflowMessage = () => {
    if (!formData.gender || !formData.age) return "";
    
    const ageGroup = formData.age < 20 ? "teen" : 
                    formData.age < 40 ? "adult" : 
                    formData.age < 60 ? "middle-age" : "senior";
    
    const workflows = {
      male: {
        teen: "Focus on fitness, posture, and stamina building",
        adult: "Strength training, muscle gain, and weight control",
        "middle-age": "Heart health, flexibility, and stress management",
        senior: "Yoga, joint mobility, and breathing exercises"
      },
      female: {
        teen: "Growth support, posture, and flexibility",
        adult: "Weight management, stress relief, and hormonal balance",
        "middle-age": "Bone strength, menopause support, and PCOD/PCOS care",
        senior: "Yoga, joint mobility, and breathing exercises"
      }
    };
    
    return workflows[formData.gender][ageGroup];
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
                value={formData.name || ""}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="wellness-input"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Age"
                  value={formData.age || ""}
                  onChange={(e) => updateFormData({ age: parseInt(e.target.value) })}
                  className="wellness-input"
                />
                
                <select
                  value={formData.gender || ""}
                  onChange={(e) => updateFormData({ gender: e.target.value as "male" | "female" })}
                  className="wellness-input"
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {formData.gender && formData.age && (
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
                    value={formData.weight || ""}
                    onChange={(e) => updateFormData({ weight: parseFloat(e.target.value) })}
                    className="wellness-input"
                  />
                </div>
                
                <div>
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={formData.height || ""}
                    onChange={(e) => updateFormData({ height: parseFloat(e.target.value) })}
                    className="wellness-input"
                  />
                </div>
              </div>

              {getBMI() && (
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
              {(formData.gender === "female" ? getFemaleGoals() : getMaleGoals()).map((goal) => (
                <label
                  key={goal}
                  className="flex items-center p-4 bg-card border border-border rounded-xl cursor-pointer hover:bg-accent transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.goals?.includes(goal) || false}
                    onChange={(e) => {
                      const currentGoals = formData.goals || [];
                      if (e.target.checked) {
                        updateFormData({ goals: [...currentGoals, goal] });
                      } else {
                        updateFormData({ goals: currentGoals.filter(g => g !== goal) });
                      }
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
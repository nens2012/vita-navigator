import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { OnboardingStepper } from "./OnboardingStepper";
import { EnhancedWellnessDashboard } from "./EnhancedWellnessDashboard";

type AppState = "login" | "onboarding" | "dashboard";

interface UserData {
  email: string;
  name?: string;
  age?: number;
  gender?: "male" | "female";
  weight?: number;
  height?: number;
  goals?: string[];
  preferences?: {
    activityType: string;
    timePerDay: number;
    dietPreference: string;
  };
}

export const WellnessApp = () => {
  const [appState, setAppState] = useState<AppState>("login");
  const [userData, setUserData] = useState<UserData>({ email: "" });

  const handleLogin = (email: string, password: string) => {
    // In a real app, this would authenticate with backend
    setUserData({ email });
    setAppState("onboarding");
  };

  const handleSignUp = () => {
    // Would navigate to sign up form
    console.log("Navigate to sign up");
  };

  const handleOnboardingComplete = (data: Partial<UserData>) => {
    setUserData({ ...userData, ...data });
    setAppState("dashboard");
  };

  const handleLogout = () => {
    setUserData({ email: "" });
    setAppState("login");
  };

  return (
    <div className="min-h-screen bg-background">
      {appState === "login" && (
        <LoginForm onLogin={handleLogin} onSignUp={handleSignUp} />
      )}
      
      {appState === "onboarding" && (
        <OnboardingStepper 
          onComplete={handleOnboardingComplete}
          initialData={userData}
        />
      )}
      
      {appState === "dashboard" && (
        <EnhancedWellnessDashboard 
          userData={userData}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};
import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { OnboardingStepper } from "./OnboardingStepper";
import { EnhancedWellnessDashboard } from "./EnhancedWellnessDashboard";
import { ForgotPassword } from "./ForgotPassword";

type AppState = "login" | "signup" | "onboarding" | "dashboard" | "forgot-password";

interface UserData {
  email: string;
  name?: string;
  age?: number | null;
  gender?: "male" | "female" | null;
  weight?: number | null;
  height?: number | null;
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

  const handleLogin = async (email: string, password: string) => {
    // Simulated API call with artificial delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, this would authenticate with backend
    const mockUser: UserData = {
      email,
      name: "Test User",
      age: 28,
      gender: "male" as const,
      weight: 70,
      height: 175,
      goals: ["weight_loss", "better_sleep"],
      preferences: {
        activityType: "moderate",
        timePerDay: 60,
        dietPreference: "balanced"
      }
    };
    
    setUserData(mockUser);
    setAppState("dashboard"); // Directly go to dashboard since we have all required fields
  };

  const handleGoogleLogin = async () => {
    // Simulated API call with artificial delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would authenticate with Google OAuth
    const mockUser: UserData = {
      email: "user@google.com",
      name: "Google User",
      age: null,
      gender: null,
      weight: null,
      height: null,
      goals: [],
      preferences: {
        activityType: "moderate",
        timePerDay: 30,
        dietPreference: "balanced"
      }
    };
    setUserData(mockUser);
    setAppState("onboarding");
  };

  const handleGoogleSignup = async () => {
    await handleGoogleLogin();
  };

  const handleSignupSubmit = async (email: string, password: string) => {
    // Simulated API call with artificial delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would create a new user account
    const mockUser: UserData = {
      email,
      name: "",
      age: null,
      gender: null,
      weight: null,
      height: null,
      goals: [],
      preferences: {
        activityType: "moderate",
        timePerDay: 30,
        dietPreference: "balanced"
      }
    };
    setUserData(mockUser);
    setAppState("onboarding");
  };

  const handleOnboardingComplete = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
    setAppState("dashboard");
  };

  const handleLogout = () => {
    setUserData({ email: "" });
    setAppState("login");
  };

  const handleResetPassword = async (email: string) => {
    // Simulated API call with artificial delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, this would send a reset password email
    console.log('Reset password email sent to:', email);
    setAppState("login");
  };

  return (
    <div className="min-h-screen bg-background">
      {appState === "login" && (
        <LoginForm 
          onLogin={handleLogin} 
          onSignUp={() => setAppState("signup")} 
          onGoogleLogin={handleGoogleLogin}
          onForgotPassword={() => setAppState("forgot-password")}
        />
      )}
      
      {appState === "signup" && (
        <SignupForm
          onSignup={handleSignupSubmit}
          onGoogleSignup={handleGoogleSignup}
          onLogin={() => setAppState("login")}
        />
      )}
      
      {appState === "forgot-password" && (
        <ForgotPassword
          onSubmit={handleResetPassword}
          onBack={() => setAppState("login")}
        />
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
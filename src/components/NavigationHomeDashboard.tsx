import React, { useState, useEffect } from 'react';
import { 
  Home, User, Target, Calendar, MessageCircle, Activity, 
  Heart, Moon, Zap, TrendingUp, Settings, LogOut, Dumbbell, 
  Flower2, BrainCircuit, BarChart3, Clock, Bell, ChevronRight,
  Sun, Sunrise, Sunset, Star, Award, Sparkles
} from 'lucide-react';

interface NavigationHomeDashboardProps {
  userData: {
    name?: string;
    age?: number;
    gender?: 'male' | 'female';
    goals?: string[];
    preferences?: {
      activityType: string;
      timePerDay: number;
      dietPreference: string;
    };
  };
  onLogout: () => void;
  onNavigate: (section: string) => void;
}

export const NavigationHomeDashboard = ({ userData, onLogout, onNavigate }: NavigationHomeDashboardProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayStreak, setTodayStreak] = useState(7);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return { text: "Good Night", icon: Moon, color: "text-indigo-600" };
    if (hour < 12) return { text: "Good Morning", icon: Sunrise, color: "text-orange-500" };
    if (hour < 17) return { text: "Good Afternoon", icon: Sun, color: "text-yellow-500" };
    if (hour < 21) return { text: "Good Evening", icon: Sunset, color: "text-orange-600" };
    return { text: "Good Night", icon: Moon, color: "text-indigo-600" };
  };

  const greeting = getTimeBasedGreeting();

  // Navigation cards configuration
  const navigationCards = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Overview & Today\'s Summary',
      icon: Home,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      accent: 'text-blue-600',
      description: 'Quick glance at your daily activities'
    },
    {
      id: 'exercises',
      title: 'Exercises',
      subtitle: 'Strength & Cardio Workouts',
      icon: Dumbbell,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      accent: 'text-red-600',
      description: 'Personalized workout routines'
    },
    {
      id: 'yoga',
      title: 'Yoga',
      subtitle: 'Flexibility & Mindful Movement',
      icon: Flower2,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      accent: 'text-green-600',
      description: 'Find balance and inner peace'
    },
    {
      id: 'meditation',
      title: 'Meditation',
      subtitle: 'Mindfulness & Mental Wellness',
      icon: BrainCircuit,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      accent: 'text-purple-600',
      description: 'Calm your mind and reduce stress'
    },
    {
      id: 'sleep',
      title: 'Sleep Cycle',
      subtitle: 'Rest & Recovery Tracking',
      icon: Moon,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      accent: 'text-indigo-600',
      description: 'Optimize your sleep quality'
    },
    {
      id: 'progress',
      title: 'Progress',
      subtitle: 'Achievements & Analytics',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      accent: 'text-emerald-600',
      description: 'Track your wellness journey'
    },
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Settings & Preferences',
      icon: User,
      color: 'bg-gradient-to-br from-gray-600 to-gray-700',
      accent: 'text-gray-600',
      description: 'Personalize your experience'
    }
  ];

  // Add period tracker for female users
  if (userData.gender === 'female') {
    navigationCards.splice(-1, 0, {
      id: 'period-tracker',
      title: 'Period Tracker',
      subtitle: 'Cycle & Health Monitoring',
      icon: Calendar,
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      accent: 'text-pink-600',
      description: 'Track your monthly cycle'
    });
  }

  // Quick actions based on time of day
  const getTimeBasedActions = () => {
    const hour = currentTime.getHours();
    if (hour < 10) {
      return [
        { label: 'Morning Yoga', action: () => onNavigate('yoga'), icon: Sunrise },
        { label: 'Set Daily Goals', action: () => onNavigate('dashboard'), icon: Target }
      ];
    } else if (hour < 14) {
      return [
        { label: 'Midday Workout', action: () => onNavigate('exercises'), icon: Dumbbell },
        { label: 'Quick Meditation', action: () => onNavigate('meditation'), icon: BrainCircuit }
      ];
    } else if (hour < 20) {
      return [
        { label: 'Evening Exercise', action: () => onNavigate('exercises'), icon: Activity },
        { label: 'Stress Relief', action: () => onNavigate('meditation'), icon: Heart }
      ];
    } else {
      return [
        { label: 'Sleep Preparation', action: () => onNavigate('sleep'), icon: Moon },
        { label: 'Reflection', action: () => onNavigate('meditation'), icon: Star }
      ];
    }
  };

  const timeBasedActions = getTimeBasedActions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-green/5 via-white to-soft-blue/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo and Greeting */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-sage-green to-soft-blue rounded-xl flex items-center justify-center shadow-sm">
                <div className="text-lg">🧘‍♀️</div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <greeting.icon className={`w-5 h-5 ${greeting.color}`} />
                  <h1 className="text-lg font-semibold text-gray-900">
                    {greeting.text}{userData.name ? `, ${userData.name}` : ''}
                  </h1>
                </div>
                <p className="text-sm text-gray-600">
                  Ready for your wellness journey?
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              
              {/* Notifications */}
              <button
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                onClick={() => onNavigate('notifications')}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </div>
                )}
              </button>

              {/* Settings */}
              <button
                onClick={() => onNavigate('settings')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-sage-green/10 via-soft-blue/10 to-lavender/10 rounded-3xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Your Wellness Hub
                </h2>
                <p className="text-gray-600 mb-4">
                  Everything you need for a healthier, happier you - all in one place.
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {todayStreak} day streak
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Level 3 Wellness Warrior
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <Award className="w-16 h-16 text-accent-gold opacity-50" />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Suggested for Right Now
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {timeBasedActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-sage-green hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sage-green/20 to-soft-blue/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <action.icon className="w-5 h-5 text-sage-green" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{action.label}</div>
                    <div className="text-xs text-gray-500">Recommended now</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Navigation Cards Grid */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Explore Your Wellness
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationCards.map((card) => (
              <button
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="bg-white rounded-3xl p-6 border border-gray-200/50 hover:border-gray-300 hover:shadow-lg transition-all duration-300 group text-left"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                    <card.icon className="w-7 h-7 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>

                {/* Card Content */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    {card.title}
                  </h4>
                  <p className={`text-sm font-medium ${card.accent} mb-2`}>
                    {card.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Tap to explore
                    </span>
                    <div className={`w-2 h-2 ${card.color} rounded-full opacity-60`}></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Motivational Footer */}
        <section className="mt-12 text-center">
          <div className="bg-gradient-to-r from-sage-green/5 to-soft-blue/5 rounded-2xl p-8 border border-gray-200/30">
            <Star className="w-8 h-8 text-accent-gold mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              "Every journey begins with a single step"
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Take your wellness journey one day at a time. Small consistent actions lead to big transformations.
            </p>
          </div>
        </section>
      </main>

      {/* Bottom padding for mobile navigation */}
      <div className="h-20"></div>
    </div>
  );
};
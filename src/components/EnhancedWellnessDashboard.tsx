import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, User, Target, Calendar, MessageCircle, Activity, 
  Heart, Moon, Zap, TrendingUp, Settings, LogOut, Dumbbell, 
  Flower2, BrainCircuit, BarChart3, Clock, ChevronDown, ChevronUp,
  Check, X, Eye, EyeOff, Sliders, RotateCcw, Plus, Minus,
  Award, Star, Timer, MoreVertical
} from 'lucide-react';
import { useStepCounter, useScreenTime, ActivityDataProcessor } from '../lib/activityTracking';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ProgressVisualization } from './ProgressVisualization';

interface EnhancedWellnessDashboardProps {
  userData: {
    email: string;
    name?: string;
    age?: number | null;
    gender?: 'male' | 'female' | null;
    weight?: number | null;
    height?: number | null;
    goals?: string[];
    preferences?: {
      activityType: string;
      timePerDay: number;
      dietPreference: string;
    };
    periodInfo?: {
      cycleLength: number;
      lastPeriod: string;
    };
  };
  onLogout: () => void;
}

interface Task {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  type: 'yoga' | 'exercise' | 'meditation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  calories?: number;
  description?: string;
}

interface Widget {
  id: string;
  title: string;
  visible: boolean;
  order: number;
  collapsible: boolean;
  collapsed: boolean;
}

interface WeeklyData {
  day: string;
  workouts: number;
  meditation: number;
  calories: number;
}

export const EnhancedWellnessDashboard = ({ userData, onLogout }: EnhancedWellnessDashboardProps) => {
  // Activity tracking hooks
  const { stepData, isTracking, startTracking, stopTracking } = useStepCounter();
  const { screenTimeData } = useScreenTime();

  // Start tracking when component mounts
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  // State management for interactivity
  const [activeTab, setActiveTab] = useState('home');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'stats', title: 'Daily Stats', visible: true, order: 1, collapsible: false, collapsed: false },
    { id: 'tasks', title: 'Today\'s Tasks', visible: true, order: 2, collapsible: true, collapsed: false },
    { id: 'activity', title: 'Activity Tracking', visible: true, order: 3, collapsible: true, collapsed: false },
    { id: 'progress', title: 'Weekly Progress', visible: true, order: 4, collapsible: true, collapsed: false },
    { id: 'quick-access', title: 'Quick Access', visible: true, order: 5, collapsible: true, collapsed: false },
    { id: 'health-metrics', title: 'Health Metrics', visible: true, order: 6, collapsible: true, collapsed: false },
  ]);
  const [customizationMode, setCustomizationMode] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(7);
  const [totalCalories, setTotalCalories] = useState(1240);
  const [activeMinutes, setActiveMinutes] = useState(45);
  const [weeklyProgress, setWeeklyProgress] = useState(78);

  // Personalized content generation based on user data
  const personalizedContent = useMemo(() => {
    const age = userData.age ?? 25; // Use nullish coalescing to handle null/undefined
    const gender = userData.gender ?? 'male';
    const goals = userData.goals ?? [];
    let personalizedTasks: Task[] = [];
    
    // Age-based personalization
    if (age < 25) {
      // Young adults: High energy, flexibility, strength building
      personalizedTasks = [
        { id: 1, title: 'Dynamic Morning Yoga', duration: '20 min', completed: false, type: 'yoga', difficulty: 'intermediate', calories: 120, description: 'Energizing flow to start your day' },
        { id: 2, title: 'HIIT Cardio Blast', duration: '25 min', completed: false, type: 'exercise', difficulty: 'advanced', calories: 300, description: 'High-intensity interval training' },
        { id: 3, title: 'Mindfulness Meditation', duration: '10 min', completed: false, type: 'meditation', difficulty: 'beginner', description: 'Focus and clarity practice' },
        { id: 4, title: 'Strength Training', duration: '30 min', completed: false, type: 'exercise', difficulty: 'intermediate', calories: 250, description: 'Full body strength workout' },
      ];
    } else if (age >= 25 && age < 40) {
      // Adults: Balanced approach, stress management
      personalizedTasks = [
        { id: 1, title: 'Hatha Yoga Flow', duration: '25 min', completed: false, type: 'yoga', difficulty: 'intermediate', calories: 150, description: 'Balanced strength and flexibility' },
        { id: 2, title: 'Cardio & Core', duration: '30 min', completed: false, type: 'exercise', difficulty: 'intermediate', calories: 280, description: 'Heart health and core strength' },
        { id: 3, title: 'Stress Relief Meditation', duration: '15 min', completed: false, type: 'meditation', difficulty: 'intermediate', description: 'Work stress management' },
        { id: 4, title: 'Evening Stretch', duration: '15 min', completed: false, type: 'yoga', difficulty: 'beginner', calories: 80, description: 'Relax and unwind' },
      ];
    } else if (age >= 40 && age < 60) {
      // Middle-aged: Joint health, flexibility, moderate intensity
      personalizedTasks = [
        { id: 1, title: 'Gentle Morning Yoga', duration: '20 min', completed: false, type: 'yoga', difficulty: 'beginner', calories: 100, description: 'Joint mobility and flexibility' },
        { id: 2, title: 'Low-Impact Cardio', duration: '25 min', completed: false, type: 'exercise', difficulty: 'beginner', calories: 200, description: 'Heart-healthy exercise' },
        { id: 3, title: 'Deep Relaxation', duration: '20 min', completed: false, type: 'meditation', difficulty: 'beginner', description: 'Full body relaxation' },
        { id: 4, title: 'Resistance Band Workout', duration: '20 min', completed: false, type: 'exercise', difficulty: 'beginner', calories: 150, description: 'Safe strength training' },
      ];
    } else {
      // Seniors: Mobility, balance, gentle movement
      personalizedTasks = [
        { id: 1, title: 'Chair Yoga', duration: '15 min', completed: false, type: 'yoga', difficulty: 'beginner', calories: 60, description: 'Gentle seated movements' },
        { id: 2, title: 'Balance & Mobility', duration: '20 min', completed: false, type: 'exercise', difficulty: 'beginner', calories: 100, description: 'Fall prevention exercises' },
        { id: 3, title: 'Breathing Meditation', duration: '15 min', completed: false, type: 'meditation', difficulty: 'beginner', description: 'Calming breath work' },
        { id: 4, title: 'Gentle Stretching', duration: '15 min', completed: false, type: 'yoga', difficulty: 'beginner', calories: 50, description: 'Maintain flexibility' },
      ];
    }

    // Gender-specific modifications
    if (gender === 'female') {
      // Add female-specific tasks
      if (goals.includes('Menstrual Health') || goals.includes('PCOD Care')) {
        personalizedTasks.push({
          id: 5, 
          title: 'Hormone Balance Yoga', 
          duration: '20 min', 
          completed: false, 
          type: 'yoga', 
          difficulty: 'beginner',
          calories: 90,
          description: 'Poses for hormonal wellness'
        });
      }
      if (goals.includes('Post-pregnancy Recovery')) {
        personalizedTasks = personalizedTasks.map(task => ({ 
          ...task, 
          difficulty: 'beginner' as const,
          duration: task.duration.replace(/\d+/, (match) => String(Math.max(10, parseInt(match) - 10)))
        }));
      }
    }

    return { tasks: personalizedTasks };
  }, [userData]);

  // Initialize tasks with personalized content
  useEffect(() => {
    setTasks(personalizedContent.tasks);
  }, [personalizedContent]);

  // Weekly progress data
  const weeklyData: WeeklyData[] = [
    { day: 'Mon', workouts: 2, meditation: 1, calories: 350 },
    { day: 'Tue', workouts: 1, meditation: 2, calories: 280 },
    { day: 'Wed', workouts: 3, meditation: 1, calories: 420 },
    { day: 'Thu', workouts: 2, meditation: 2, calories: 380 },
    { day: 'Fri', workouts: 1, meditation: 1, calories: 220 },
    { day: 'Sat', workouts: 2, meditation: 1, calories: 310 },
    { day: 'Sun', workouts: 1, meditation: 2, calories: 240 },
  ];

  // Utility functions
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        // Update statistics when task is completed
        if (newCompleted && task.calories) {
          setTotalCalories(prev => prev + task.calories!);
          setActiveMinutes(prev => prev + parseInt(task.duration));
        } else if (!newCompleted && task.calories) {
          setTotalCalories(prev => Math.max(0, prev - task.calories!));
          setActiveMinutes(prev => Math.max(0, prev - parseInt(task.duration)));
        }
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
    
    // Update daily progress
    const completedTasks = tasks.filter(t => t.completed).length + (tasks.find(t => t.id === taskId)?.completed ? -1 : 1);
    setWeeklyProgress(Math.round((completedTasks / tasks.length) * 100));
  };

  const toggleWidget = (widgetId: string, field: 'visible' | 'collapsed') => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId ? { ...widget, [field]: !widget[field] } : widget
    ));
  };

  const getVisibleWidgets = () => {
    return widgets.filter(w => w.visible).sort((a, b) => a.order - b.order);
  };

  const getDifficultyColor = (difficulty: Task['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const quickAccessTiles = [
    { id: 'exercise', title: 'Exercise', icon: Dumbbell, color: 'bg-gradient-to-br from-red-400 to-red-500' },
    { id: 'yoga', title: 'Yoga', icon: Flower2, color: 'bg-gradient-to-br from-green-400 to-green-500' },
    { id: 'meditation', title: 'Meditation', icon: BrainCircuit, color: 'bg-gradient-to-br from-purple-400 to-purple-500' },
    { id: 'sleep', title: 'Sleep', icon: Moon, color: 'bg-gradient-to-br from-indigo-400 to-indigo-500' },
    { id: 'chatbot', title: 'AI Coach', icon: MessageCircle, color: 'bg-gradient-to-br from-blue-400 to-blue-500' },
    { id: 'reports', title: 'Reports', icon: BarChart3, color: 'bg-gradient-to-br from-orange-400 to-orange-500' },
  ];

  // Add period tracker for female users
  if (userData.gender === 'female') {
    quickAccessTiles.push({
      id: 'period',
      title: 'Period Tracker',
      icon: Calendar,
      color: 'bg-gradient-to-br from-pink-400 to-pink-500'
    });
  }

  const stats = [
    { label: 'Current Streak', value: `${dailyStreak} days`, icon: Zap, color: 'text-yellow-600' },
    { label: 'Calories Burned', value: totalCalories.toLocaleString(), icon: Activity, color: 'text-red-600' },
    { label: 'Active Minutes', value: `${activeMinutes} min`, icon: Clock, color: 'text-blue-600' },
    { label: 'Weekly Progress', value: `${weeklyProgress}%`, icon: TrendingUp, color: 'text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Header */}
      <header className="bg-gradient-to-r from-primary via-primary-hover to-primary-foreground text-white px-4 sm:px-6 py-6 sm:py-8 rounded-b-2xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
              {getGreeting()}{userData.name ? `, ${userData.name}` : `, ${userData.email.split('@')[0]}`}
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mt-1">
              Ready to achieve your wellness goals?
            </p>
          </div>
          
          {/* Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCustomizationMode(!customizationMode)}
              className="wellness-touch-target p-2 hover:bg-white/10 rounded-full wellness-transition"
              aria-label="Customize dashboard"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onLogout}
              className="wellness-touch-target p-2 hover:bg-white/10 rounded-full wellness-transition"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Today's Progress</span>
            <span className="text-sm">
              {tasks.filter(t => t.completed).length}/{tasks.length} tasks
            </span>
          </div>
          <div className="wellness-progress bg-white/20">
            <div 
              className="wellness-progress-bar bg-white" 
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Customization Banner */}
      {customizationMode && (
        <div className="bg-accent border-l-4 border-primary p-4 m-4 sm:mx-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              <span className="font-medium">Customization Mode</span>
            </div>
            <button
              onClick={() => setCustomizationMode(false)}
              className="text-sm text-primary hover:underline"
            >
              Done
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Toggle widget visibility using the eye icons
          </p>
        </div>
      )}

      {/* Main Content with Responsive Layout */}
      <main className="px-4 sm:px-6 py-6 space-y-6">
        {getVisibleWidgets().map((widget) => (
          <section key={widget.id} className="wellness-widget">
            {/* Widget Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                {widget.title}
                {widget.id === 'tasks' && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({tasks.filter(t => t.completed).length}/{tasks.length})
                  </span>
                )}
              </h2>
              
              <div className="flex items-center gap-2">
                {customizationMode && (
                  <button
                    onClick={() => toggleWidget(widget.id, 'visible')}
                    className="wellness-touch-target p-1 hover:bg-secondary rounded-full wellness-transition"
                    aria-label={`${widget.visible ? 'Hide' : 'Show'} ${widget.title}`}
                  >
                    {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                )}
                
                {widget.collapsible && (
                  <button
                    onClick={() => toggleWidget(widget.id, 'collapsed')}
                    className="wellness-touch-target p-1 hover:bg-secondary rounded-full wellness-transition"
                    aria-label={`${widget.collapsed ? 'Expand' : 'Collapse'} ${widget.title}`}
                  >
                    {widget.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {/* Widget Content */}
            {!widget.collapsed && (
              <div>
                {/* Stats Grid */}
                {widget.id === 'stats' && (
                  <div className="wellness-stats-grid">
                    {stats.map((stat, index) => (
                      <div key={index} className="wellness-card p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 sm:p-3 ${stat.color} bg-opacity-10 rounded-lg`}>
                            <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {stat.label}
                            </p>
                            <p className="font-bold text-lg sm:text-xl">{stat.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Today's Tasks */}
                {widget.id === 'tasks' && (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`wellness-card-interactive p-4 sm:p-5 flex items-center gap-4 ${
                          task.completed ? 'opacity-60 bg-success/5' : ''
                        }`}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleTaskCompletion(task.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleTaskCompletion(task.id);
                          }
                        }}
                        aria-label={`${task.completed ? 'Mark incomplete' : 'Mark complete'}: ${task.title}`}
                      >
                        {/* Task Icon */}
                        <div className="flex-shrink-0">
                          <div
                            className={`wellness-touch-target w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${
                              task.completed ? 'bg-success' : 'bg-muted'
                            } wellness-transition`}
                          >
                            {task.completed ? (
                              <Check className="w-6 h-6 text-white" />
                            ) : (
                              <>
                                {task.type === 'yoga' && <Flower2 className="w-6 h-6 text-muted-foreground" />}
                                {task.type === 'exercise' && <Dumbbell className="w-6 h-6 text-muted-foreground" />}
                                {task.type === 'meditation' && <BrainCircuit className="w-6 h-6 text-muted-foreground" />}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Task Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-base sm:text-lg truncate">
                                {task.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">
                                  {task.duration}
                                </span>
                                {task.calories && (
                                  <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-sm text-muted-foreground">
                                      {task.calories} cal
                                    </span>
                                  </>
                                )}
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(task.difficulty)}`}
                                >
                                  {task.difficulty}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Task Status */}
                        <div className="flex-shrink-0">
                          <div
                            className={`px-3 py-2 rounded-lg text-sm font-medium wellness-transition ${
                              task.completed
                                ? 'bg-success text-white'
                                : 'bg-primary text-primary-foreground hover:bg-primary-hover'
                            }`}
                          >
                            {task.completed ? 'Completed' : 'Start'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Weekly Progress Chart */}
                {widget.id === 'progress' && (
                  <div className="space-y-4">
                    <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="day" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="workouts" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                            name="Workouts"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="meditation" 
                            stroke="hsl(var(--success))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--success))', strokeWidth: 2 }}
                            name="Meditation"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Progress Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <div className="font-bold text-lg text-primary">
                          {weeklyData.reduce((sum, day) => sum + day.workouts, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Workouts</div>
                      </div>
                      <div className="text-center p-3 bg-success/10 rounded-lg">
                        <div className="font-bold text-lg text-success">
                          {weeklyData.reduce((sum, day) => sum + day.meditation, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Meditation Sessions</div>
                      </div>
                      <div className="text-center p-3 bg-warning/10 rounded-lg">
                        <div className="font-bold text-lg text-warning">
                          {weeklyData.reduce((sum, day) => sum + day.calories, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Calories Burned</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Tracking */}
                {widget.id === 'activity' && (
                  <div className="wellness-card">
                    <ProgressVisualization
                      progressData={ActivityDataProcessor.getProgressData(stepData, screenTimeData)}
                      recommendationAnalytics={[
                        {
                          taskId: '1',
                          taskName: 'Morning Walk',
                          overallScore: 0.85,
                          factorBreakdown: [
                            { factor: 'Time of Day', score: 0.9, weight: 0.3, impact: 'positive' },
                            { factor: 'Duration', score: 0.8, weight: 0.3, impact: 'positive' },
                            { factor: 'Intensity', score: 0.85, weight: 0.4, impact: 'positive' }
                          ],
                          confidenceScore: 90,
                          alternativeRecommendations: ['Evening Walk', 'Light Jogging']
                        }
                      ]}
                      userMetrics={{
                        consistency: 0.85,
                        improvement: 0.75,
                        adherence: 0.9,
                        challengeLevel: 'intermediate'
                      }}
                    />
                  </div>
                )}

                {/* Quick Access Grid */}
                {widget.id === 'quick-access' && (
                  <div className="wellness-grid-responsive">
                    {quickAccessTiles.map((tile) => (
                      <button
                        key={tile.id}
                        className="wellness-card-interactive p-4 sm:p-6 text-left group"
                        aria-label={`Open ${tile.title}`}
                      >
                        <div className={`wellness-touch-target w-12 h-12 sm:w-14 sm:h-14 ${tile.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 wellness-transition`}>
                          <tile.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <h3 className="font-medium text-sm sm:text-base">{tile.title}</h3>
                      </button>
                    ))}
                  </div>
                )}

                {/* Health Metrics for Female Users */}
                {widget.id === 'health-metrics' && userData.gender === 'female' && (
                  <div className="space-y-4">
                    <div className="wellness-card p-4 sm:p-6">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500" />
                        Women's Health Tracking
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Next Period</span>
                          <span className="text-sm font-medium">In 12 days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Cycle Day</span>
                          <span className="text-sm font-medium">Day 16</span>
                        </div>
                        <div className="wellness-progress">
                          <div className="wellness-progress-bar bg-pink-500" style={{ width: '53%' }} />
                        </div>
                        <button className="w-full wellness-button-secondary text-sm py-2">
                          Log Symptoms & Mood
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        ))}
      </main>

      {/* Bottom Navigation - Mobile Optimized */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-4 py-2 sm:py-3 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'activity', icon: Activity, label: 'Activity' },
            { id: 'progress', icon: TrendingUp, label: 'Progress' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`wellness-touch-target flex flex-col items-center gap-1 py-2 px-3 rounded-lg wellness-transition ${
                activeTab === tab.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              aria-label={tab.label}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom padding for fixed navigation */}
      <div className="h-20 sm:h-24" />
    </div>
  );
};
import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { 
  Home, User, Target, Calendar, MessageCircle, Activity, 
  Heart, Moon, Zap, TrendingUp, Settings, LogOut, Dumbbell, 
  Flower2, BrainCircuit, BarChart3, Clock, ChevronDown, ChevronUp,
  Check, X, Eye, EyeOff, Sliders, RotateCcw, Plus, Minus,
  Award, Star, Timer, MoreVertical, Droplets, Apple, Sun,
  GripVertical, Palette, Move3D
} from 'lucide-react';

// Lazy load heavy chart components for performance
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));

// Enhanced interfaces for better type safety
interface ResponsiveWellnessDashboardProps {
  userData: {
    name?: string;
    age?: number;
    gender?: 'male' | 'female';
    weight?: number;
    height?: number;
    goals?: string[];
    preferences?: {
      activityType: string;
      timePerDay: number;
      dietPreference: string;
      themeShade?: 'light' | 'medium' | 'dark';
    };
    periodInfo?: {
      cycleLength: number;
      lastPeriod: string;
      symptoms?: string[];
      nextPeriod?: Date;
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
  ageGroup: '18-30' | '31-50' | '51+';
  genderSpecific?: 'male' | 'female' | 'both';
  category?: 'strength' | 'cardio' | 'flexibility' | 'mindfulness' | 'recovery';
}

interface Widget {
  id: string;
  title: string;
  visible: boolean;
  order: number;
  collapsible: boolean;
  collapsed: boolean;
  draggable: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

interface WeeklyData {
  day: string;
  workouts: number;
  meditation: number;
  calories: number;
  streak: number;
}

interface PeriodData {
  cycleDay: number;
  nextPeriod: number; // days until next period
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  symptoms: string[];
  mood: 'great' | 'good' | 'okay' | 'low';
  recommendations: string[];
}

export const ResponsiveWellnessDashboard = ({ userData, onLogout }: ResponsiveWellnessDashboardProps) => {
  // Enhanced state management with performance optimization
  const [activeTab, setActiveTab] = useState('home');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'stats', title: 'Daily Stats', visible: true, order: 1, collapsible: false, collapsed: false, draggable: false, icon: BarChart3 },
    { id: 'tasks', title: 'Today\'s Routines', visible: true, order: 2, collapsible: true, collapsed: false, draggable: true, icon: Target },
    { id: 'progress', title: 'Weekly Progress', visible: true, order: 3, collapsible: true, collapsed: false, draggable: true, icon: TrendingUp },
    { id: 'period-tracker', title: 'Period Tracker', visible: userData.gender === 'female', order: 4, collapsible: true, collapsed: false, draggable: true, icon: Calendar },
    { id: 'wellness-tips', title: 'Wellness Tips', visible: userData.gender === 'female', order: 5, collapsible: true, collapsed: false, draggable: true, icon: Heart },
    { id: 'quick-access', title: 'Quick Actions', visible: true, order: 6, collapsible: true, collapsed: false, draggable: true, icon: Zap },
  ]);
  
  // Interactive state with performance tracking
  const [customizationMode, setCustomizationMode] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(7);
  const [totalCalories, setTotalCalories] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [themeShade, setThemeShade] = useState<'light' | 'medium' | 'dark'>(userData.preferences?.themeShade || 'medium');
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Period tracking state (only for female users)
  const [periodData, setPeriodData] = useState<PeriodData>({
    cycleDay: 16,
    nextPeriod: 12,
    phase: 'luteal',
    symptoms: [],
    mood: 'good',
    recommendations: []
  });

  // Enhanced personalization engine with gender and age intelligence
  const personalizedContent = useMemo(() => {
    const age = userData.age || 25;
    const gender = userData.gender || 'male';
    const goals = userData.goals || [];
    
    // Determine age group for precise personalization
    const ageGroup: '18-30' | '31-50' | '51+' = 
      age <= 30 ? '18-30' : 
      age <= 50 ? '31-50' : '51+';
    
    let personalizedTasks: Task[] = [];
    
    // Age and gender-based task generation
    if (ageGroup === '18-30') {
      // Young Adults (18-30): High energy, strength building, dynamic movements
      personalizedTasks = [
        {
          id: 1,
          title: gender === 'female' ? 'Vinyasa Power Flow' : 'Dynamic Warrior Sequence',
          duration: '25 min',
          completed: false,
          type: 'yoga',
          difficulty: 'intermediate',
          calories: gender === 'female' ? 140 : 160,
          description: gender === 'female' 
            ? 'Flowing sequence to build strength and flexibility'
            : 'Dynamic poses to enhance power and stability',
          ageGroup,
          genderSpecific: gender,
          category: 'flexibility'
        },
        {
          id: 2,
          title: gender === 'female' ? 'HIIT Circuit Training' : 'Strength & Power HIIT',
          duration: '30 min',
          completed: false,
          type: 'exercise',
          difficulty: 'advanced',
          calories: gender === 'female' ? 320 : 380,
          description: gender === 'female'
            ? 'High-intensity interval training for lean muscle'
            : 'Power-focused HIIT for maximum strength gains',
          ageGroup,
          genderSpecific: gender,
          category: 'cardio'
        },
        {
          id: 3,
          title: 'Focus & Productivity Meditation',
          duration: '12 min',
          completed: false,
          type: 'meditation',
          difficulty: 'beginner',
          description: 'Enhance concentration and mental clarity',
          ageGroup,
          genderSpecific: 'both',
          category: 'mindfulness'
        },
        {
          id: 4,
          title: gender === 'female' ? 'Core & Glute Sculpting' : 'Heavy Compound Lifts',
          duration: gender === 'female' ? '25 min' : '35 min',
          completed: false,
          type: 'exercise',
          difficulty: 'intermediate',
          calories: gender === 'female' ? 200 : 280,
          description: gender === 'female'
            ? 'Target core stability and lower body strength'
            : 'Build maximum strength with compound movements',
          ageGroup,
          genderSpecific: gender,
          category: 'strength'
        }
      ];
      
      // Add female-specific routines for young adults
      if (gender === 'female') {
        personalizedTasks.push({
          id: 5,
          title: 'Hormone Balance Flow',
          duration: '20 min',
          completed: false,
          type: 'yoga',
          difficulty: 'beginner',
          calories: 100,
          description: 'Gentle poses to support hormonal health',
          ageGroup,
          genderSpecific: 'female',
          category: 'recovery'
        });
      }
      
    } else if (ageGroup === '31-50') {
      // Adults (31-50): Balanced wellness, stress management, functional fitness
      personalizedTasks = [
        {
          id: 1,
          title: gender === 'female' ? 'Hatha Stress Relief Flow' : 'Balanced Strength Yoga',
          duration: '30 min',
          completed: false,
          type: 'yoga',
          difficulty: 'intermediate',
          calories: gender === 'female' ? 160 : 180,
          description: gender === 'female'
            ? 'Calming poses to reduce daily stress'
            : 'Build functional strength through yoga',
          ageGroup,
          genderSpecific: gender,
          category: 'flexibility'
        },
        {
          id: 2,
          title: gender === 'female' ? 'Functional Fitness Circuit' : 'Strength & Endurance Training',
          duration: '35 min',
          completed: false,
          type: 'exercise',
          difficulty: 'intermediate',
          calories: gender === 'female' ? 280 : 340,
          description: gender === 'female'
            ? 'Real-world movements for daily activities'
            : 'Build strength while maintaining cardiovascular health',
          ageGroup,
          genderSpecific: gender,
          category: 'strength'
        },
        {
          id: 3,
          title: 'Deep Breathing & Mindfulness',
          duration: '18 min',
          completed: false,
          type: 'meditation',
          difficulty: 'intermediate',
          description: 'Advanced breathing techniques for stress relief',
          ageGroup,
          genderSpecific: 'both',
          category: 'mindfulness'
        },
        {
          id: 4,
          title: gender === 'female' ? 'Yin Yoga Recovery' : 'Active Recovery Stretch',
          duration: gender === 'female' ? '25 min' : '20 min',
          completed: false,
          type: 'yoga',
          difficulty: 'beginner',
          calories: gender === 'female' ? 90 : 100,
          description: gender === 'female'
            ? 'Deep passive stretches for recovery'
            : 'Active stretching for muscle recovery',
          ageGroup,
          genderSpecific: gender,
          category: 'recovery'
        }
      ];
      
      // Add perimenopause/menopause support for women 40+
      if (gender === 'female' && age >= 40) {
        personalizedTasks.push({
          id: 5,
          title: 'Menopause Wellness Flow',
          duration: '25 min',
          completed: false,
          type: 'yoga',
          difficulty: 'beginner',
          calories: 110,
          description: 'Supportive poses for hormonal transitions',
          ageGroup,
          genderSpecific: 'female',
          category: 'recovery'
        });
      }
      
    } else {
      // Older Adults (51+): Gentle movement, mobility, balance, relaxation
      personalizedTasks = [
        {
          id: 1,
          title: gender === 'female' ? 'Gentle Restorative Yoga' : 'Chair Yoga & Mobility',
          duration: '20 min',
          completed: false,
          type: 'yoga',
          difficulty: 'beginner',
          calories: gender === 'female' ? 80 : 90,
          description: gender === 'female'
            ? 'Gentle poses for flexibility and relaxation'
            : 'Seated and supported poses for mobility',
          ageGroup,
          genderSpecific: gender,
          category: 'flexibility'
        },
        {
          id: 2,
          title: gender === 'female' ? 'Low-Impact Strength' : 'Balance & Stability Training',
          duration: '25 min',
          completed: false,
          type: 'exercise',
          difficulty: 'beginner',
          calories: gender === 'female' ? 150 : 180,
          description: gender === 'female'
            ? 'Gentle resistance training for bone health'
            : 'Focus on balance and fall prevention',
          ageGroup,
          genderSpecific: gender,
          category: 'strength'
        },
        {
          id: 3,
          title: 'Sleep & Relaxation Meditation',
          duration: '20 min',
          completed: false,
          type: 'meditation',
          difficulty: 'beginner',
          description: 'Prepare body and mind for restful sleep',
          ageGroup,
          genderSpecific: 'both',
          category: 'mindfulness'
        },
        {
          id: 4,
          title: 'Gentle Walking & Breathing',
          duration: '15 min',
          completed: false,
          type: 'exercise',
          difficulty: 'beginner',
          calories: gender === 'female' ? 60 : 80,
          description: 'Light cardio combined with mindful breathing',
          ageGroup,
          genderSpecific: 'both',
          category: 'cardio'
        }
      ];
    }
    
    // Apply period-friendly modifications for women during menstrual phase
    if (gender === 'female' && periodData.phase === 'menstrual') {
      personalizedTasks = personalizedTasks.map(task => ({
        ...task,
        difficulty: 'beginner' as const,
        duration: task.type === 'exercise' 
          ? task.duration.replace(/\d+/, (match) => String(Math.max(10, parseInt(match) - 10)))
          : task.duration,
        title: task.type === 'yoga' 
          ? task.title.replace(/Dynamic|Power|HIIT|Intense/, 'Gentle')
          : task.title.replace(/HIIT|High-intensity|Heavy/, 'Light'),
        calories: task.calories ? Math.round(task.calories * 0.7) : undefined
      }));
    }
    
    return { tasks: personalizedTasks };
  }, [userData, periodData.phase]);

  // Period tracking calculations (female users only)
  const updatePeriodData = useCallback(() => {
    if (userData.gender !== 'female' || !userData.periodInfo) return;
    
    const lastPeriod = new Date(userData.periodInfo.lastPeriod);
    const cycleLength = userData.periodInfo.cycleLength || 28;
    const today = new Date();
    const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    
    const cycleDay = daysSinceLastPeriod % cycleLength;
    const nextPeriod = cycleLength - cycleDay;
    
    // Determine cycle phase
    let phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
    if (cycleDay <= 5) phase = 'menstrual';
    else if (cycleDay <= 13) phase = 'follicular';
    else if (cycleDay <= 17) phase = 'ovulation';
    else phase = 'luteal';
    
    // Generate phase-specific recommendations
    const recommendations = [];
    switch (phase) {
      case 'menstrual':
        recommendations.push(
          'Focus on gentle yoga and light stretching',
          'Stay hydrated and consider iron-rich foods',
          'Prioritize rest and gentle movement'
        );
        break;
      case 'follicular':
        recommendations.push(
          'Great time for high-intensity workouts',
          'Increase protein intake for muscle building',
          'Take advantage of higher energy levels'
        );
        break;
      case 'ovulation':
        recommendations.push(
          'Peak energy - perfect for challenging workouts',
          'Focus on strength training and cardio',
          'Stay extra hydrated during this phase'
        );
        break;
      case 'luteal':
        recommendations.push(
          'Balance cardio with yoga and stretching',
          'Consider magnesium-rich foods for PMS',
          'Prepare for upcoming period with self-care'
        );
        break;
    }
    
    setPeriodData({
      cycleDay,
      nextPeriod,
      phase,
      symptoms: userData.periodInfo.symptoms || [],
      mood: 'good',
      recommendations
    });
  }, [userData.gender, userData.periodInfo]);

  // Initialize tasks and period data
  useEffect(() => {
    setTasks(personalizedContent.tasks);
    updatePeriodData();
  }, [personalizedContent, updatePeriodData]);

  // Calculate real-time statistics
  useEffect(() => {
    const completed = tasks.filter(t => t.completed);
    const newTotalCalories = completed.reduce((sum, task) => sum + (task.calories || 0), 0);
    const newActiveMinutes = completed.reduce((sum, task) => sum + parseInt(task.duration), 0);
    const newProgress = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;
    
    setTotalCalories(newTotalCalories);
    setActiveMinutes(newActiveMinutes);
    setWeeklyProgress(newProgress);
  }, [tasks]);

  // Weekly data for charts
  const weeklyData: WeeklyData[] = [
    { day: 'Mon', workouts: 2, meditation: 1, calories: 350, streak: 1 },
    { day: 'Tue', workouts: 1, meditation: 2, calories: 280, streak: 2 },
    { day: 'Wed', workouts: 3, meditation: 1, calories: 420, streak: 3 },
    { day: 'Thu', workouts: 2, meditation: 2, calories: 380, streak: 4 },
    { day: 'Fri', workouts: 1, meditation: 1, calories: 220, streak: 5 },
    { day: 'Sat', workouts: 2, meditation: 1, calories: 310, streak: 6 },
    { day: 'Sun', workouts: 1, meditation: 2, calories: 240, streak: 7 },
  ];

  // Interactive functions
  const toggleTaskCompletion = useCallback((taskId: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    }));
  }, []);

  const toggleWidget = useCallback((widgetId: string, field: 'visible' | 'collapsed') => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId ? { ...widget, [field]: !widget[field] } : widget
    ));
  }, []);

  const reorderWidgets = useCallback((draggedId: string, targetId: string) => {
    setWidgets(prev => {
      const draggedIndex = prev.findIndex(w => w.id === draggedId);
      const targetIndex = prev.findIndex(w => w.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      const newWidgets = [...prev];
      const [draggedWidget] = newWidgets.splice(draggedIndex, 1);
      newWidgets.splice(targetIndex, 0, draggedWidget);
      
      // Update order numbers
      return newWidgets.map((widget, index) => ({ ...widget, order: index + 1 }));
    });
  }, []);

  const getVisibleWidgets = useCallback(() => {
    return widgets.filter(w => w.visible).sort((a, b) => a.order - b.order);
  }, [widgets]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userData.name ? `, ${userData.name}` : '';
    if (hour < 12) return `Good Morning${name}`;
    if (hour < 17) return `Good Afternoon${name}`;
    return `Good Evening${name}`;
  };

  const getDifficultyColor = (difficulty: Task['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Theme classes based on user preference
  const getThemeClasses = (shade: 'light' | 'medium' | 'dark') => {
    const themes = {
      light: {
        primary: 'from-sky-300 to-blue-400',
        secondary: 'bg-sky-50',
        accent: 'bg-sky-100',
        text: 'text-sky-700'
      },
      medium: {
        primary: 'from-sky-400 to-blue-500', 
        secondary: 'bg-sky-100',
        accent: 'bg-sky-200',
        text: 'text-sky-800'
      },
      dark: {
        primary: 'from-sky-500 to-blue-600',
        secondary: 'bg-sky-200', 
        accent: 'bg-sky-300',
        text: 'text-sky-900'
      }
    };
    return themes[shade];
  };

  const theme = getThemeClasses(themeShade);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      
      {/* Responsive Header with Accessibility */}
      <header 
        className={`bg-gradient-to-r ${theme.primary} text-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 rounded-b-2xl shadow-lg`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            
            {/* Greeting and User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                {getGreeting()}
              </h1>
              <p className="text-blue-100 text-sm sm:text-base mt-1">
                {userData.gender === 'female' 
                  ? `${periodData.phase.charAt(0).toUpperCase() + periodData.phase.slice(1)} phase • Day ${periodData.cycleDay}`
                  : 'Ready to achieve your wellness goals?'
                }
              </p>
            </div>
            
            {/* Header Controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
              {/* Theme Customizer */}
              <div className="relative">
                <button
                  onClick={() => setCustomizationMode(!customizationMode)}
                  className="wellness-touch-target p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                  aria-label="Customize theme and layout"
                  aria-expanded={customizationMode}
                >
                  <Palette className="w-5 h-5" />
                </button>
              </div>

              {/* Settings */}
              <button
                onClick={() => setCustomizationMode(!customizationMode)}
                className="wellness-touch-target p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                aria-label="Dashboard settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="wellness-touch-target p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <span className="text-sm font-medium">Today's Progress</span>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {dailyStreak} day streak
                </span>
                <span>
                  {tasks.filter(t => t.completed).length}/{tasks.length} routines
                </span>
              </div>
            </div>
            <div className="wellness-progress bg-white/20">
              <div 
                className="wellness-progress-bar bg-white transition-all duration-700 ease-out" 
                style={{ width: `${weeklyProgress}%` }}
                role="progressbar"
                aria-valuenow={weeklyProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Daily progress: ${weeklyProgress}% complete`}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Theme Customization Panel */}
      {customizationMode && (
        <div className={`${theme.secondary} border-l-4 border-sky-500 p-4 mx-4 sm:mx-6 lg:mx-8 mt-6 rounded-lg shadow-sm`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-600" />
                <span className="font-medium text-sky-800">Dashboard Customization</span>
              </div>
              
              {/* Theme Shade Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-sky-700">Theme:</span>
                <div className="flex bg-white rounded-lg p-1 shadow-sm">
                  {(['light', 'medium', 'dark'] as const).map((shade) => (
                    <button
                      key={shade}
                      onClick={() => setThemeShade(shade)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                        themeShade === shade
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'text-sky-600 hover:bg-sky-50'
                      }`}
                    >
                      {shade.charAt(0).toUpperCase() + shade.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-sky-600 mt-2">
              Customize your dashboard theme and drag widgets to rearrange them
            </p>
          </div>
        </div>
      )}

      {/* Main Content - Responsive Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6 lg:space-y-8">
          
          {getVisibleWidgets().map((widget, index) => (
            <section 
              key={widget.id}
              className={`wellness-widget group ${customizationMode ? 'ring-2 ring-sky-200 ring-opacity-50' : ''}`}
              draggable={customizationMode && widget.draggable}
              onDragStart={() => setDraggedWidget(widget.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedWidget && draggedWidget !== widget.id) {
                  reorderWidgets(draggedWidget, widget.id);
                  setDraggedWidget(null);
                }
              }}
            >
              
              {/* Widget Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  {customizationMode && widget.draggable && (
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <widget.icon className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {widget.title}
                    {widget.id === 'tasks' && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({tasks.filter(t => t.completed).length}/{tasks.length})
                      </span>
                    )}
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  {customizationMode && (
                    <button
                      onClick={() => toggleWidget(widget.id, 'visible')}
                      className="wellness-touch-target p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      aria-label={`${widget.visible ? 'Hide' : 'Show'} ${widget.title}`}
                    >
                      {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  )}
                  
                  {widget.collapsible && (
                    <button
                      onClick={() => toggleWidget(widget.id, 'collapsed')}
                      className="wellness-touch-target p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      aria-label={`${widget.collapsed ? 'Expand' : 'Collapse'} ${widget.title}`}
                      aria-expanded={!widget.collapsed}
                    >
                      {widget.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Widget Content */}
              {!widget.collapsed && (
                <div>
                  
                  {/* Daily Stats Widget */}
                  {widget.id === 'stats' && (
                    <div className="wellness-stats-grid">
                      <div className="wellness-card p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500 truncate">Current Streak</p>
                            <p className="font-bold text-lg sm:text-xl">{dailyStreak} days</p>
                          </div>
                        </div>
                      </div>

                      <div className="wellness-card p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500 truncate">Calories Burned</p>
                            <p className="font-bold text-lg sm:text-xl">{totalCalories.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="wellness-card p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500 truncate">Active Minutes</p>
                            <p className="font-bold text-lg sm:text-xl">{activeMinutes} min</p>
                          </div>
                        </div>
                      </div>

                      <div className="wellness-card p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500 truncate">Progress</p>
                            <p className="font-bold text-lg sm:text-xl">{weeklyProgress}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Today's Routines Widget */}
                  {widget.id === 'tasks' && (
                    <div className="space-y-3 sm:space-y-4">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`wellness-card-interactive p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                            task.completed ? 'opacity-60 bg-green-50' : ''
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
                          
                          {/* Task Icon & Checkbox */}
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="flex-shrink-0">
                              <div
                                className={`wellness-touch-target w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                                  task.completed ? 'bg-green-500' : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {task.completed ? (
                                  <Check className="w-6 h-6 text-white" />
                                ) : (
                                  <>
                                    {task.type === 'yoga' && <Flower2 className="w-6 h-6 text-gray-600" />}
                                    {task.type === 'exercise' && <Dumbbell className="w-6 h-6 text-gray-600" />}
                                    {task.type === 'meditation' && <BrainCircuit className="w-6 h-6 text-gray-600" />}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Task Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-base sm:text-lg truncate mb-1">
                                {task.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {task.duration}
                                </span>
                                {task.calories && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Zap className="w-3 h-3" />
                                      {task.calories} cal
                                    </span>
                                  </>
                                )}
                                <span
                                  className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(task.difficulty)}`}
                                >
                                  {task.difficulty}
                                </span>
                                {task.genderSpecific !== 'both' && (
                                  <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-full border border-purple-200">
                                    {task.genderSpecific}-focused
                                  </span>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Task Action Button */}
                          <div className="flex-shrink-0 w-full sm:w-auto">
                            <div
                              className={`px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors duration-200 ${
                                task.completed
                                  ? 'bg-green-500 text-white'
                                  : 'bg-sky-500 text-white hover:bg-sky-600'
                              }`}
                            >
                              {task.completed ? 'Completed' : 'Complete'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Weekly Progress Chart Widget */}
                  {widget.id === 'progress' && (
                    <div className="space-y-6">
                      <div className="h-64 sm:h-80">
                        <Suspense fallback={<div className="h-full bg-gray-100 animate-pulse rounded-lg" />}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis 
                                dataKey="day" 
                                stroke="#6b7280"
                                fontSize={12}
                              />
                              <YAxis 
                                stroke="#6b7280"
                                fontSize={12}
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="workouts" 
                                stroke="#0ea5e9" 
                                strokeWidth={3}
                                dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 5 }}
                                name="Workouts"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="meditation" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                                name="Meditation"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="calories" 
                                stroke="#f59e0b" 
                                strokeWidth={3}
                                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
                                name="Calories"
                                yAxisId="right"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Suspense>
                      </div>

                      {/* Progress Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-sky-50 rounded-lg border border-sky-200">
                          <div className="font-bold text-xl text-sky-600">
                            {weeklyData.reduce((sum, day) => sum + day.workouts, 0)}
                          </div>
                          <div className="text-sm text-sky-700">Total Workouts</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="font-bold text-xl text-green-600">
                            {weeklyData.reduce((sum, day) => sum + day.meditation, 0)}
                          </div>
                          <div className="text-sm text-green-700">Meditation Sessions</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="font-bold text-xl text-yellow-600">
                            {weeklyData.reduce((sum, day) => sum + day.calories, 0)}
                          </div>
                          <div className="text-sm text-yellow-700">Total Calories</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Period Tracker Widget (Female Only) */}
                  {widget.id === 'period-tracker' && userData.gender === 'female' && (
                    <div className="space-y-4">
                      <div className="wellness-card p-4 sm:p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-pink-500" />
                          Cycle Tracking
                        </h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-pink-50 rounded-lg">
                            <div className="font-bold text-lg text-pink-600">{periodData.cycleDay}</div>
                            <div className="text-xs text-pink-700">Cycle Day</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="font-bold text-lg text-purple-600">{periodData.nextPeriod}</div>
                            <div className="text-xs text-purple-700">Days to Period</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="font-bold text-lg text-blue-600 capitalize">{periodData.phase}</div>
                            <div className="text-xs text-blue-700">Current Phase</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="font-bold text-lg text-green-600 capitalize">{periodData.mood}</div>
                            <div className="text-xs text-green-700">Today's Mood</div>
                          </div>
                        </div>

                        {/* Cycle Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Cycle Progress</span>
                            <span>{periodData.cycleDay}/28 days</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-700"
                              style={{ width: `${(periodData.cycleDay / 28) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Phase-Specific Recommendations */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-900">Phase Recommendations</h4>
                          {periodData.recommendations.map((rec, index) => (
                            <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded flex items-start gap-2">
                              <Star className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                              {rec}
                            </div>
                          ))}
                        </div>

                        <button className="w-full mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium">
                          Log Symptoms & Mood
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Wellness Tips Widget (Female Only) */}
                  {widget.id === 'wellness-tips' && userData.gender === 'female' && (
                    <div className="space-y-4">
                      
                      {/* Hydration Tracker */}
                      <div className="wellness-card p-4 sm:p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          <Droplets className="w-5 h-5 text-blue-500" />
                          Daily Hydration
                        </h3>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>6/8 glasses</span>
                            </div>
                            <div className="w-full bg-blue-100 rounded-full h-3">
                              <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: '75%' }} />
                            </div>
                          </div>
                          <button className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                            +1 Glass
                          </button>
                        </div>
                      </div>

                      {/* Nutrition Tips */}
                      <div className="wellness-card p-4 sm:p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          <Apple className="w-5 h-5 text-green-500" />
                          Nutrition Focus
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                            <Star className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-sm text-green-800">Iron-Rich Foods</div>
                              <div className="text-xs text-green-700">Include spinach, lentils, and lean meats for cycle support</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                            <Star className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-sm text-purple-800">Magnesium Boost</div>
                              <div className="text-xs text-purple-700">Dark chocolate and nuts help with PMS symptoms</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Self-Care Reminders */}
                      <div className="wellness-card p-4 sm:p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-pink-500" />
                          Self-Care Today
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button className="flex items-center gap-2 p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors text-left">
                            <Sun className="w-4 h-4 text-pink-600" />
                            <span className="text-sm text-pink-800">10 min sunshine</span>
                          </button>
                          <button className="flex items-center gap-2 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-left">
                            <Moon className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm text-indigo-800">Evening bath</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions Widget */}
                  {widget.id === 'quick-access' && (
                    <div className="wellness-grid-responsive">
                      <button className="wellness-card-interactive p-4 sm:p-6 text-left group">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                          <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <h3 className="font-medium text-sm sm:text-base">Start Workout</h3>
                      </button>
                      
                      <button className="wellness-card-interactive p-4 sm:p-6 text-left group">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                          <Flower2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <h3 className="font-medium text-sm sm:text-base">Yoga Session</h3>
                      </button>
                      
                      <button className="wellness-card-interactive p-4 sm:p-6 text-left group">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                          <BrainCircuit className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <h3 className="font-medium text-sm sm:text-base">Meditate</h3>
                      </button>
                      
                      <button className="wellness-card-interactive p-4 sm:p-6 text-left group">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                          <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <h3 className="font-medium text-sm sm:text-base">View Progress</h3>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
      </main>

      {/* Responsive Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2 sm:py-3 safe-area-pb lg:hidden"
        role="navigation"
        aria-label="Main navigation"
      >
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
              className={`wellness-touch-target flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-sky-600 bg-sky-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              aria-label={tab.label}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom padding for fixed navigation */}
      <div className="h-20 sm:h-24 lg:h-0" />
    </div>
  );
};
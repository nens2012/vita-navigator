import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, Target, Award, Zap, Timer, Heart,
  Dumbbell, Flower2, BrainCircuit, Moon, Activity, BarChart3,
  CheckCircle, Clock, Trophy, Star, ArrowUp, ArrowDown
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend } from 'recharts';

interface ProgressTrackingSectionProps {
  userData: {
    name?: string;
    age?: number;
    gender?: 'male' | 'female';
    goals?: string[];
  };
  completedTasks: Array<{
    id: number;
    type: 'yoga' | 'exercise' | 'meditation' | 'sleep';
    completedAt: Date;
    duration: number;
    calories?: number;
  }>;
}

export const ProgressTrackingSection = ({ userData, completedTasks }: ProgressTrackingSectionProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [realTimeProgress, setRealTimeProgress] = useState({
    todayTasks: 0,
    totalTasks: 4,
    weeklyStreak: 7,
    totalCalories: 1240,
    activeMinutes: 185,
    sleepScore: 85
  });

  // Real-time progress updates
  useEffect(() => {
    const today = new Date().toDateString();
    const todayCompleted = completedTasks.filter(
      task => task.completedAt.toDateString() === today
    ).length;
    
    const totalCalories = completedTasks
      .filter(task => task.completedAt.toDateString() === today)
      .reduce((sum, task) => sum + (task.calories || 0), 0);
      
    const totalMinutes = completedTasks
      .filter(task => task.completedAt.toDateString() === today)
      .reduce((sum, task) => sum + task.duration, 0);

    setRealTimeProgress(prev => ({
      ...prev,
      todayTasks: todayCompleted,
      totalCalories,
      activeMinutes: totalMinutes
    }));
  }, [completedTasks]);

  // Progress calculation
  const todayProgressPercentage = Math.round((realTimeProgress.todayTasks / realTimeProgress.totalTasks) * 100);

  // Weekly data for charts
  const weeklyData = [
    { day: 'Mon', exercise: 2, yoga: 1, meditation: 1, sleep: 8.5, calories: 320 },
    { day: 'Tue', exercise: 1, yoga: 2, meditation: 2, sleep: 7.5, calories: 280 },
    { day: 'Wed', exercise: 3, yoga: 1, meditation: 1, sleep: 8.0, calories: 420 },
    { day: 'Thu', exercise: 2, yoga: 2, meditation: 2, sleep: 8.5, calories: 380 },
    { day: 'Fri', exercise: 1, yoga: 1, meditation: 1, sleep: 7.0, calories: 220 },
    { day: 'Sat', exercise: 2, yoga: 2, meditation: 1, sleep: 9.0, calories: 350 },
    { day: 'Sun', exercise: 1, yoga: 2, meditation: 2, sleep: 8.5, calories: 280 },
  ];

  // Activity distribution data
  const activityDistribution = [
    { name: 'Exercise', value: 35, color: '#EF4444' },
    { name: 'Yoga', value: 25, color: '#22C55E' },
    { name: 'Meditation', value: 20, color: '#8B5CF6' },
    { name: 'Sleep', value: 20, color: '#3B82F6' },
  ];

  // Achievement badges
  const achievements = [
    { id: 1, title: '7-Day Streak', icon: Zap, color: 'text-yellow-500', earned: true, description: 'Completed activities for 7 days straight' },
    { id: 2, title: 'Meditation Master', icon: BrainCircuit, color: 'text-purple-500', earned: true, description: '50 meditation sessions completed' },
    { id: 3, title: 'Fitness Enthusiast', icon: Dumbbell, color: 'text-red-500', earned: false, description: 'Complete 100 workout sessions' },
    { id: 4, title: 'Yoga Warrior', icon: Flower2, color: 'text-green-500', earned: true, description: 'Complete 30 yoga sessions' },
    { id: 5, title: 'Sleep Champion', icon: Moon, color: 'text-indigo-500', earned: false, description: 'Maintain consistent sleep schedule for 30 days' },
    { id: 6, title: 'Wellness Pioneer', icon: Trophy, color: 'text-amber-500', earned: false, description: 'Complete all activity types in one week' },
  ];

  // Progress metrics
  const progressMetrics = [
    {
      title: 'Today\'s Progress',
      current: realTimeProgress.todayTasks,
      target: realTimeProgress.totalTasks,
      percentage: todayProgressPercentage,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up'
    },
    {
      title: 'Weekly Streak',
      current: realTimeProgress.weeklyStreak,
      target: 7,
      percentage: 100,
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: 'up'
    },
    {
      title: 'Calories Burned',
      current: realTimeProgress.totalCalories,
      target: 1500,
      percentage: Math.round((realTimeProgress.totalCalories / 1500) * 100),
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: 'up'
    },
    {
      title: 'Active Minutes',
      current: realTimeProgress.activeMinutes,
      target: 240,
      percentage: Math.round((realTimeProgress.activeMinutes / 240) * 100),
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'up'
    },
    {
      title: 'Sleep Quality',
      current: realTimeProgress.sleepScore,
      target: 100,
      percentage: realTimeProgress.sleepScore,
      icon: Moon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      trend: 'up'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-green/5 via-white to-soft-blue/5">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Progress Tracking</h1>
              <p className="text-gray-600">Your wellness journey insights</p>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              {['week', 'month', 'year'].map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTimeframe === timeframe
                      ? 'bg-white text-sage-green shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8">
        
        {/* Real-time Progress Overview */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Real-time Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {progressMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${metric.bgColor} rounded-xl flex items-center justify-center`}>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span className="font-medium">+12%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">{metric.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {metric.current}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {metric.target}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-700 ${
                        metric.color.replace('text-', 'bg-')
                      }`}
                      style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {metric.percentage}% complete
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Charts */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Activity Trends</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Weekly Activity Chart */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="exercise" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 5 }}
                      name="Exercise"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="yoga" 
                      stroke="#22C55E" 
                      strokeWidth={3}
                      dot={{ fill: '#22C55E', strokeWidth: 2, r: 5 }}
                      name="Yoga"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="meditation" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                      name="Meditation"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {activityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Sleep Quality Chart */}
        <section>
          <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep Quality & Recovery</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} domain={[6, 10]} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px'
                    }}
                    formatter={(value) => [`${value} hours`, 'Sleep Duration']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sleep" 
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Achievements & Badges */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Achievements & Milestones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`bg-white rounded-2xl p-6 border border-gray-200/50 transition-all duration-200 ${
                  achievement.earned 
                    ? 'ring-2 ring-sage-green/20 shadow-md' 
                    : 'opacity-60 hover:opacity-80'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    achievement.earned 
                      ? 'bg-gradient-to-br from-sage-green to-soft-blue' 
                      : 'bg-gray-100'
                  }`}>
                    <achievement.icon className={`w-8 h-8 ${
                      achievement.earned ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {achievement.description}
                  </p>
                  
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    achievement.earned 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {achievement.earned ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Earned
                      </>
                    ) : (
                      <>
                        <Timer className="w-4 h-4" />
                        In Progress
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Weekly Summary Stats */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200/50 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {weeklyData.reduce((sum, day) => sum + day.exercise, 0)}
              </div>
              <div className="text-sm text-gray-600">Exercise Sessions</div>
              <div className="text-xs text-green-600 mt-2">+15% from last week</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/50 text-center">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Flower2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {weeklyData.reduce((sum, day) => sum + day.yoga, 0)}
              </div>
              <div className="text-sm text-gray-600">Yoga Sessions</div>
              <div className="text-xs text-green-600 mt-2">+8% from last week</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/50 text-center">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BrainCircuit className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {weeklyData.reduce((sum, day) => sum + day.meditation, 0)}
              </div>
              <div className="text-sm text-gray-600">Meditation Minutes</div>
              <div className="text-xs text-green-600 mt-2">+22% from last week</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/50 text-center">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {weeklyData.reduce((sum, day) => sum + day.calories, 0)}
              </div>
              <div className="text-sm text-gray-600">Calories Burned</div>
              <div className="text-xs text-green-600 mt-2">+18% from last week</div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
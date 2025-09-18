import React, { useState, useEffect } from 'react';
import { 
  Moon, Sun, Sunrise, Sunset, Clock, Star, Volume2, VolumeX,
  Play, Pause, SkipForward, SkipBack, Heart, Zap, TrendingUp,
  Calendar, Target, Award, Settings, Info, CheckCircle,
  Wind, Waves, CloudRain, Headphones, Music
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SleepCycleSectionProps {
  userData: {
    name?: string;
    age?: number;
    gender?: 'male' | 'female';
  };
}

export const SleepCycleSection = ({ userData }: SleepCycleSectionProps) => {
  const [isTrackingSleep, setIsTrackingSleep] = useState(false);
  const [selectedSleepSound, setSelectedSleepSound] = useState<string | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeupTime, setWakeupTime] = useState('06:30');
  const [sleepGoalHours, setSleepGoalHours] = useState(8);

  // Sleep tracking state
  const [currentSleepData, setCurrentSleepData] = useState({
    sleepDuration: 7.5,
    sleepQuality: 85,
    deepSleep: 2.1,
    remSleep: 1.8,
    lightSleep: 3.6,
    sleepEfficiency: 88,
    heartRateVariation: 12,
    restingHeartRate: 58
  });

  // Weekly sleep data
  const weeklyData = [
    { day: 'Mon', duration: 8.2, quality: 88, bedtime: 22.5, wakeup: 6.5, efficiency: 90 },
    { day: 'Tue', duration: 7.8, quality: 82, bedtime: 23.0, wakeup: 6.5, efficiency: 85 },
    { day: 'Wed', duration: 8.5, quality: 92, bedtime: 22.0, wakeup: 6.5, efficiency: 93 },
    { day: 'Thu', duration: 7.2, quality: 78, bedtime: 23.5, wakeup: 6.5, efficiency: 82 },
    { day: 'Fri', duration: 6.8, quality: 75, bedtime: 24.0, wakeup: 6.5, efficiency: 78 },
    { day: 'Sat', duration: 9.1, quality: 95, bedtime: 23.0, wakeup: 8.0, efficiency: 96 },
    { day: 'Sun', duration: 8.6, quality: 89, bedtime: 22.5, wakeup: 7.0, efficiency: 91 },
  ];

  // Sleep cycle phases (for today)
  const sleepPhases = [
    { phase: 'Awake', duration: 0.3, color: '#FCD34D', percentage: 4 },
    { phase: 'Light Sleep', duration: 3.6, color: '#93C5FD', percentage: 48 },
    { phase: 'Deep Sleep', duration: 2.1, color: '#3B82F6', percentage: 28 },
    { phase: 'REM Sleep', duration: 1.8, color: '#8B5CF6', percentage: 20 },
  ];

  // Sleep sounds library
  const sleepSounds = [
    { id: 'rain', name: 'Rain', icon: CloudRain, description: 'Gentle rainfall sounds', duration: '60 min' },
    { id: 'ocean', name: 'Ocean Waves', icon: Waves, description: 'Calming ocean sounds', duration: '45 min' },
    { id: 'wind', name: 'Forest Wind', icon: Wind, description: 'Peaceful forest ambiance', duration: '90 min' },
    { id: 'meditation', name: 'Sleep Meditation', icon: Music, description: 'Guided sleep meditation', duration: '30 min' },
    { id: 'piano', name: 'Piano Lullaby', icon: Headphones, description: 'Soft piano melodies', duration: '120 min' },
    { id: 'nature', name: 'Nature Mix', icon: Star, description: 'Forest & stream sounds', duration: '180 min' },
  ];

  // Sleep recommendations based on data
  const getPersonalizedRecommendations = () => {
    const recommendations = [];
    const avgQuality = weeklyData.reduce((sum, day) => sum + day.quality, 0) / weeklyData.length;
    const avgDuration = weeklyData.reduce((sum, day) => sum + day.duration, 0) / weeklyData.length;
    
    if (avgQuality < 80) {
      recommendations.push({
        type: 'quality',
        title: 'Improve Sleep Quality',
        description: 'Try meditation 30 minutes before bedtime',
        action: 'Start Meditation',
        priority: 'high'
      });
    }
    
    if (avgDuration < sleepGoalHours) {
      recommendations.push({
        type: 'duration',
        title: 'Extend Sleep Duration',
        description: `Average ${avgDuration.toFixed(1)}h, goal: ${sleepGoalHours}h`,
        action: 'Adjust Bedtime',
        priority: 'medium'
      });
    }
    
    recommendations.push({
      type: 'consistency',
      title: 'Maintain Sleep Schedule',
      description: 'Keep consistent bedtime and wake time',
      action: 'Set Reminder',
      priority: 'low'
    });
    
    return recommendations;
  };

  const recommendations = getPersonalizedRecommendations();

  // Sleep score calculation
  const calculateSleepScore = () => {
    const qualityWeight = 0.4;
    const durationWeight = 0.3;
    const efficiencyWeight = 0.3;
    
    const durationScore = Math.min((currentSleepData.sleepDuration / sleepGoalHours) * 100, 100);
    
    return Math.round(
      (currentSleepData.sleepQuality * qualityWeight) +
      (durationScore * durationWeight) +
      (currentSleepData.sleepEfficiency * efficiencyWeight)
    );
  };

  const sleepScore = calculateSleepScore();

  const handlePlaySound = (soundId: string) => {
    if (selectedSleepSound === soundId && isPlayingSound) {
      setIsPlayingSound(false);
    } else {
      setSelectedSleepSound(soundId);
      setIsPlayingSound(true);
    }
  };

  const handleSleepTracking = () => {
    setIsTrackingSleep(!isTrackingSleep);
    if (!isTrackingSleep) {
      // Start sleep tracking logic
      console.log('Starting sleep tracking...');
    } else {
      // Stop sleep tracking logic
      console.log('Stopping sleep tracking...');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-blue-900/20">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sleep Cycle</h1>
              <p className="text-gray-600">Track and optimize your sleep</p>
            </div>
            
            {/* Sleep Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{sleepScore}</div>
              <div className="text-sm text-gray-600">Sleep Score</div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8">
        
        {/* Sleep Tracking Control */}
        <section>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
            <div className="text-center">
              <Moon className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">
                {isTrackingSleep ? 'Sleep Tracking Active' : 'Ready for Sleep?'}
              </h2>
              <p className="text-indigo-100 mb-6">
                {isTrackingSleep 
                  ? 'Monitoring your sleep quality and patterns'
                  : 'Track your sleep to get personalized insights'
                }
              </p>
              
              <button
                onClick={handleSleepTracking}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                  isTrackingSleep
                    ? 'bg-white text-indigo-600 hover:bg-gray-100'
                    : 'bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30'
                }`}
              >
                {isTrackingSleep ? 'Stop Tracking' : 'Start Sleep Tracking'}
              </button>
              
              {isTrackingSleep && (
                <div className="mt-4 text-sm text-indigo-100">
                  Sleep started at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Today's Sleep Summary */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Last Night's Sleep</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentSleepData.sleepDuration}h
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${(currentSleepData.sleepDuration / sleepGoalHours) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentSleepData.sleepQuality}%
                  </div>
                  <div className="text-sm text-gray-600">Quality</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${currentSleepData.sleepQuality}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Moon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentSleepData.deepSleep}h
                  </div>
                  <div className="text-sm text-gray-600">Deep Sleep</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${(currentSleepData.deepSleep / currentSleepData.sleepDuration) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentSleepData.restingHeartRate}
                  </div>
                  <div className="text-sm text-gray-600">Resting HR</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: '75%' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sleep Phase Breakdown */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sleep Phase Analysis</h2>
          <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Sleep Phases Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep Stages Distribution</h3>
                <div className="space-y-4">
                  {sleepPhases.map((phase, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: phase.color }}
                        />
                        <span className="font-medium text-gray-900">{phase.phase}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{phase.duration}h</span>
                        <span className="text-sm font-medium text-gray-900">{phase.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sleep Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep Timeline</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <Sunset className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium">Bedtime</span>
                    </div>
                    <span className="text-sm text-gray-600">10:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-medium">Fell Asleep</span>
                    </div>
                    <span className="text-sm text-gray-600">10:45 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">Wake Up</span>
                    </div>
                    <span className="text-sm text-gray-600">6:30 AM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <Sunrise className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium">Out of Bed</span>
                    </div>
                    <span className="text-sm text-gray-600">6:45 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Sleep Trends */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Sleep Trends</h2>
          <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
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
                    dataKey="duration" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                    name="Sleep Duration (hours)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="quality" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                    name="Sleep Quality (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Sleep Sounds */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sleep Sounds & Music</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sleepSounds.map((sound) => (
              <div key={sound.id} className="bg-white rounded-2xl p-6 border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <sound.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{sound.name}</h3>
                      <p className="text-xs text-gray-500">{sound.duration}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handlePlaySound(sound.id)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      selectedSleepSound === sound.id && isPlayingSound
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {selectedSleepSound === sound.id && isPlayingSound ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{sound.description}</p>
                
                {selectedSleepSound === sound.id && isPlayingSound && (
                  <div className="flex items-center gap-2 py-2 px-3 bg-indigo-50 rounded-lg">
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                    <div className="flex-1 bg-indigo-200 rounded-full h-1">
                      <div className="bg-indigo-600 h-1 rounded-full animate-pulse" style={{ width: '45%' }} />
                    </div>
                    <span className="text-xs text-indigo-600 font-medium">Playing</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Sleep Recommendations */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personalized Recommendations</h2>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className={`bg-white rounded-2xl p-6 border-l-4 ${
                  rec.priority === 'high' ? 'border-red-500' :
                  rec.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
                } border-r border-t border-b border-gray-200/50`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{rec.title}</h3>
                    <p className="text-gray-600 mb-4">{rec.description}</p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200">
                    {rec.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sleep Settings */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sleep Settings</h2>
          <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bedtime Goal
                </label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Wake Up Goal
                </label>
                <input
                  type="time"
                  value={wakeupTime}
                  onChange={(e) => setWakeupTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sleep Goal (hours)
                </label>
                <select
                  value={sleepGoalHours}
                  onChange={(e) => setSleepGoalHours(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(hours => (
                    <option key={hours} value={hours}>{hours} hours</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
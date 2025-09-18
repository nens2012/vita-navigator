import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStepCounter, useScreenTime, ActivityDataProcessor } from '../lib/activityTracking';
import { MLPatternRecognition } from '../lib/mlPatternRecognition';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";

interface ProgressData {
  date: string;
  cardio: number;
  strength: number;
  flexibility: number;
  mindfulness: number;
  overall: number;
  steps: number;
  screenTime: {
    total: number;
    productive: number;
    entertainment: number;
    social: number;
    wellness: number;
  };
}

interface FactorBreakdown {
  factor: string;
  score: number;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
}

interface RecommendationAnalytics {
  taskId: string;
  taskName: string;
  overallScore: number;
  factorBreakdown: FactorBreakdown[];
  confidenceScore: number;
  alternativeRecommendations: string[];
}

interface ProgressVisualizationProps {
  progressData: ProgressData[];
  recommendationAnalytics: RecommendationAnalytics[];
  userMetrics: {
    consistency: number;
    improvement: number;
    adherence: number;
    challengeLevel: string;
  };
}

const colorMap = {
  cardio: '#ef4444',
  strength: '#3b82f6',
  flexibility: '#22c55e',
  mindfulness: '#8b5cf6',
  overall: '#64748b',
};

export function ProgressVisualization({
  progressData,
  recommendationAnalytics,
  userMetrics,
}: ProgressVisualizationProps) {
  const [activeTab, setActiveTab] = useState('progress');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const { stepData, isTracking } = useStepCounter();
  const { screenTimeData } = useScreenTime();

  // Initialize ML engine with proper type conversion
  const mlEngine = new MLPatternRecognition(
    stepData.map(step => ({
      id: String(step.timestamp),
      title: 'Step Activity',
      category: 'cardio',
      duration: step.count,
      intensity: step.count > 5000 ? 'high' : step.count > 2000 ? 'medium' : 'low',
      completed: true,
      description: `Step activity recorded from device: ${step.count} steps`,
      timeSlot: {
        hour: new Date(step.timestamp).getHours(),
        minute: new Date(step.timestamp).getMinutes(),
        period: new Date(step.timestamp).getHours() >= 12 ? 'PM' : 'AM'
      },
      priority: 'medium',
      frequency: 'daily',
      tags: ['steps', 'cardio', 'activity'],
      caloriesBurn: step.count * 0.04,
      recommendedFor: {
        age: [13, 80],
        gender: ['male', 'female', 'other'],
        fitnessLevel: ['beginner', 'intermediate', 'advanced'],
        medicalConditions: ['none']
      }
    })),
    Object.fromEntries(screenTimeData.map(screen => [
      String(screen.timestamp),
      screen.isWellnessApp // true for completed wellness app activities
    ]))
  );
  const patterns = mlEngine.getPatterns();

  // Format data for radar chart
  const radarData = progressData[progressData.length - 1] ? [
    {
      category: 'Cardio',
      value: progressData[progressData.length - 1].cardio,
      fullMark: 100,
    },
    {
      category: 'Strength',
      value: progressData[progressData.length - 1].strength,
      fullMark: 100,
    },
    {
      category: 'Flexibility',
      value: progressData[progressData.length - 1].flexibility,
      fullMark: 100,
    },
    {
      category: 'Mindfulness',
      value: progressData[progressData.length - 1].mindfulness,
      fullMark: 100,
    },
  ] : [];

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="steps">Step Counter</TabsTrigger>
          <TabsTrigger value="screenTime">Screen Time</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Track your improvement across different areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Line Chart */}
                <Card className="p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={selectedMetric}
                        stroke={colorMap[selectedMetric as keyof typeof colorMap]}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {Object.keys(colorMap).map(metric => (
                      <Button
                        key={metric}
                        variant={selectedMetric === metric ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMetric(metric)}
                        className="capitalize"
                      >
                        {metric}
                      </Button>
                    ))}
                  </div>
                </Card>

                {/* Radar Chart */}
                <Card className="p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis />
                      <Radar
                        name="Progress"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps" className="space-y-6">
          {/* Step Counter */}
          <Card>
            <CardHeader>
              <CardTitle>Step Counter Analytics</CardTitle>
              <CardDescription>Daily step tracking and activity patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Steps Chart */}
                <Card className="p-4">
                  <h4 className="text-sm font-semibold mb-4">Daily Steps Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={progressData.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="steps" fill={colorMap.cardio} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Step Goals and Progress */}
                <Card className="p-4">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Daily Goal Progress</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-gray-100">
                            <motion.div
                              className="h-full rounded-full bg-blue-500"
                              style={{ 
                                width: `${Math.min(
                                  (progressData[progressData.length - 1]?.steps || 0) / 10000 * 100,
                                  100
                                )}%`
                              }}
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${Math.min(
                                  (progressData[progressData.length - 1]?.steps || 0) / 10000 * 100,
                                  100
                                )}%`
                              }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium">
                          {progressData[progressData.length - 1]?.steps || 0} / 10,000
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-medium mb-1">Average Steps</h5>
                        <p className="text-2xl font-bold">
                          {Math.round(
                            progressData.reduce((acc, curr) => acc + curr.steps, 0) / progressData.length
                          )}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-medium mb-1">Peak Steps</h5>
                        <p className="text-2xl font-bold">
                          {Math.max(...progressData.map(d => d.steps))}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screenTime" className="space-y-6">
          {/* Screen Time */}
          <Card>
            <CardHeader>
              <CardTitle>Screen Time Analysis</CardTitle>
              <CardDescription>Track and analyze your digital wellness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Screen Time Distribution */}
                <Card className="p-4">
                  <h4 className="text-sm font-semibold mb-4">App Category Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Tooltip />
                      <Legend />
                      <Pie
                        data={Object.entries(progressData[progressData.length - 1]?.screenTime || {}).map(([key, value]) => ({
                          name: key,
                          value: value
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {Object.entries(progressData[progressData.length - 1]?.screenTime || {}).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(colorMap)[index % Object.values(colorMap).length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Digital Wellness Score */}
                <Card className="p-4">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-4">Digital Wellness Score</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Productive Time</span>
                            <span>{progressData[progressData.length - 1]?.screenTime.productive || 0}min</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100">
                            <motion.div
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${progressData[progressData.length - 1]?.screenTime.productive / 
                                (Object.values(progressData[progressData.length - 1]?.screenTime || {}).reduce((a, b) => a + b, 0)) * 100}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressData[progressData.length - 1]?.screenTime.productive / 
                                (Object.values(progressData[progressData.length - 1]?.screenTime || {}).reduce((a, b) => a + b, 0)) * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Wellness Apps</span>
                            <span>{progressData[progressData.length - 1]?.screenTime.wellness || 0}min</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100">
                            <motion.div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${progressData[progressData.length - 1]?.screenTime.wellness / 
                                (Object.values(progressData[progressData.length - 1]?.screenTime || {}).reduce((a, b) => a + b, 0)) * 100}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressData[progressData.length - 1]?.screenTime.wellness / 
                                (Object.values(progressData[progressData.length - 1]?.screenTime || {}).reduce((a, b) => a + b, 0)) * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Entertainment</span>
                            <span>{progressData[progressData.length - 1]?.screenTime.entertainment || 0}min</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100">
                            <motion.div
                              className="h-full rounded-full bg-yellow-500"
                              style={{ width: `${progressData[progressData.length - 1]?.screenTime.entertainment / 
                                (Object.values(progressData[progressData.length - 1]?.screenTime || {}).reduce((a, b) => a + b, 0)) * 100}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressData[progressData.length - 1]?.screenTime.entertainment / 
                                (Object.values(progressData[progressData.length - 1]?.screenTime || {}).reduce((a, b) => a + b, 0)) * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-semibold mb-4">Screen Time Goals</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-medium mb-1">Daily Limit</h5>
                          <p className="text-2xl font-bold">
                            {Object.values(progressData[progressData.length - 1]?.screenTime || {}).reduce((a, b) => a + b, 0)}
                            <span className="text-sm font-normal text-gray-500 ml-1">min</span>
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-medium mb-1">Wellness Ratio</h5>
                          <p className="text-2xl font-bold">
                            {Math.round((progressData[progressData.length - 1]?.screenTime.wellness || 0) / 
                              (Object.values(progressData[progressData.length - 1]?.screenTime || {}).reduce((a, b) => a + b, 0)) * 100)}
                            <span className="text-sm font-normal text-gray-500 ml-1">%</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Recommendation Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Analysis</CardTitle>
              <CardDescription>Understanding how recommendations are made</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recommendationAnalytics.map((analysis) => (
                  <Card key={analysis.taskId} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">{analysis.taskName}</h4>
                        <p className="text-sm text-gray-500">
                          Confidence Score: {analysis.confidenceScore}%
                        </p>
                      </div>
                      <Badge variant={analysis.overallScore > 0.7 ? "default" : "secondary"}>
                        {Math.round(analysis.overallScore * 100)}% Match
                      </Badge>
                    </div>

                    {/* Factor Breakdown */}
                    <div className="space-y-2">
                      {analysis.factorBreakdown.map((factor) => (
                        <div key={factor.factor} className="flex items-center gap-2">
                          <div className="w-32 text-sm">{factor.factor}</div>
                          <div className="flex-1">
                            <div className="h-2 rounded-full bg-gray-100">
                              <motion.div
                                className={`h-full rounded-full ${
                                  factor.impact === 'positive'
                                    ? 'bg-green-500'
                                    : factor.impact === 'negative'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                                }`}
                                style={{ width: `${factor.score * 100}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${factor.score * 100}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                          <div className="w-16 text-right text-sm">
                            {Math.round(factor.score * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle>AI Performance Insights</CardTitle>
              <CardDescription>Machine learning-based analysis of your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {/* Activity Pattern Insights */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-4">Activity Pattern Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium mb-2">Peak Activity Hours</h5>
                      <div className="space-y-2">
                        {patterns.timePreference.mostProductiveTime.map((hour) => (
                          <Badge key={hour} variant="secondary">
                            {hour}:00
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium mb-2">Optimal Exercise Time</h5>
                      <div className="space-y-2">
                        {patterns.timePreference.optimalExerciseTime.map((hour) => (
                          <Badge key={hour} variant="secondary">
                            {hour}:00
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium mb-2">Focus Periods</h5>
                      <div className="space-y-2">
                        {patterns.activityPatterns.screenTimeImpact.productiveHours.map((hour) => (
                          <Badge key={hour} variant="secondary">
                            {hour}:00
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Performance Metrics */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <h4 className="font-semibold">Consistency Score</h4>
                        <span className="text-sm text-gray-500">
                          {Math.round(userMetrics.consistency * 100)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <motion.div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${userMetrics.consistency * 100}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${userMetrics.consistency * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <h4 className="font-semibold">Improvement Rate</h4>
                        <span className="text-sm text-gray-500">
                          {Math.round(userMetrics.improvement * 100)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <motion.div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${userMetrics.improvement * 100}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${userMetrics.improvement * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <h4 className="font-semibold">Digital Wellness Score</h4>
                        <span className="text-sm text-gray-500">
                          {Math.round(patterns.activityPatterns.screenTimeImpact.wellnessAppCorrelation * 100)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <motion.div
                          className="h-full rounded-full bg-purple-500"
                          style={{ width: `${patterns.activityPatterns.screenTimeImpact.wellnessAppCorrelation * 100}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${patterns.activityPatterns.screenTimeImpact.wellnessAppCorrelation * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Challenge Level Analysis */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Activity Level & Recommendations</h4>
                    <Badge variant="secondary">{userMetrics.challengeLevel}</Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="flex h-2 mb-4 overflow-hidden rounded-full bg-blue-200">
                      <motion.div
                        className="bg-blue-500"
                        style={{
                          width: userMetrics.challengeLevel === 'beginner' ? '33%' :
                                userMetrics.challengeLevel === 'intermediate' ? '66%' : '100%'
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: userMetrics.challengeLevel === 'beginner' ? '33%' :
                                userMetrics.challengeLevel === 'intermediate' ? '66%' : '100%'
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
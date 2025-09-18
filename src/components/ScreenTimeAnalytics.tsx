import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Bell, Focus, Clock } from 'lucide-react';
import { ScreenTimeManager, DailyScreenTimeReport } from '@/lib/screenTimeTracking';

const CATEGORY_COLORS = {
  PRODUCTIVITY: '#2563eb',
  SOCIAL: '#ec4899',
  ENTERTAINMENT: '#f59e0b',
  WELLNESS: '#10b981',
  EDUCATIONAL: '#8b5cf6',
  OTHER: '#6b7280',
};

const ScreenTimeAnalytics: React.FC = () => {
  const [screenTimeData, setScreenTimeData] = useState<DailyScreenTimeReport | null>(null);
  const [focusModeActive, setFocusModeActive] = useState(false);

  useEffect(() => {
    const screenTimeManager = ScreenTimeManager.getInstance();
    const updateData = () => {
      setScreenTimeData(screenTimeManager.getDailyReport());
    };

    // Initial update
    updateData();

    // Update every 5 minutes
    const interval = setInterval(updateData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleFocusMode = () => {
    const screenTimeManager = ScreenTimeManager.getInstance();
    screenTimeManager.toggleFocusMode();
    setFocusModeActive(!focusModeActive);
  };

  if (!screenTimeData) return <div>Loading screen time data...</div>;

  const categoryData = [
    { name: 'Productive', value: screenTimeData.productiveTime },
    { name: 'Social', value: screenTimeData.socialTime },
    { name: 'Entertainment', value: screenTimeData.entertainmentTime },
    { name: 'Wellness', value: screenTimeData.wellnessTime },
    { name: 'Educational', value: screenTimeData.educationalTime },
  ];

  const appUsageData = screenTimeData.mostUsedApps.map(app => ({
    name: app.appName,
    time: Math.round(app.totalTime),
    category: app.category,
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Daily Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Screen Time Overview</CardTitle>
          <CardDescription>Today's digital wellness summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(screenTimeData.totalScreenTime)} min
                </p>
                <p className="text-sm text-muted-foreground">Total Screen Time</p>
              </div>
              <Button
                variant={focusModeActive ? "secondary" : "outline"}
                onClick={handleFocusMode}
              >
                <Focus className="mr-2 h-4 w-4" />
                Focus Mode
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Focus Score</span>
                <span>{Math.round(screenTimeData.focusScore * 100)}%</span>
              </div>
              <Progress value={screenTimeData.focusScore * 100} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Time Distribution</CardTitle>
          <CardDescription>How you spent your screen time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name.toUpperCase() as keyof typeof CATEGORY_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Most Used Apps */}
      <Card>
        <CardHeader>
          <CardTitle>Most Used Applications</CardTitle>
          <CardDescription>Time spent per application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="time">
                  {appUsageData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.category]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Productivity Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {screenTimeData.productivityTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Wellness Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {screenTimeData.wellnessRecommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScreenTimeAnalytics;
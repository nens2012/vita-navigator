import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStepCounter, useScreenTime, ActivityDataProcessor } from '@/lib/activityTracking';
import type { DailyActivitySummary } from '@/lib/activityTracking';
import { Progress } from "@/components/ui/progress";

const CHART_COLORS = {
  primary: '#2563eb',
  secondary: '#9333ea',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
};

const ActivityDashboard: React.FC = () => {
  const { stepData, isTracking, startTracking, stopTracking } = useStepCounter();
  const { screenTimeData: appScreenTimeData } = useScreenTime();
  const [activitySummary, setActivitySummary] = useState<DailyActivitySummary | null>(null);

  useEffect(() => {
    // Start tracking when component mounts
    startTracking();
    return () => stopTracking();
  }, []);

  useEffect(() => {
    // Update summary whenever new data comes in
    const summary = ActivityDataProcessor.summarizeDaily(stepData, appScreenTimeData);
    setActivitySummary(summary);
  }, [stepData, appScreenTimeData]);

  if (!activitySummary) return <div>Loading activity data...</div>;

  const stepProgress = (activitySummary.totalSteps / activitySummary.stepGoal) * 100;

  const screenTimeChartData = Object.entries(activitySummary.screenTime.byCategory).map(
    ([category, duration]) => ({
      name: category,
      value: duration,
    })
  );

  const hourlyStepsData = activitySummary.hourlySteps.map((steps, hour) => ({
    hour: hour.toString().padStart(2, '0') + ':00',
    steps,
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Step Counter Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Step Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {activitySummary.totalSteps.toLocaleString()}
              </span>
              <span className="text-muted-foreground">
                Goal: {activitySummary.stepGoal.toLocaleString()}
              </span>
            </div>
            <Progress value={stepProgress} />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold">
                  {activitySummary.distanceCovered.toFixed(2)} km
                </p>
                <p className="text-sm text-muted-foreground">Distance</p>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {activitySummary.activeMinutes} min
                </p>
                <p className="text-sm text-muted-foreground">Active Time</p>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {Math.round(activitySummary.caloriesBurned)} cal
                </p>
                <p className="text-sm text-muted-foreground">Calories</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyStepsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="steps" fill={CHART_COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Screen Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Screen Time Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {Math.round(activitySummary.screenTime.total)} min
              </span>
              <span className="text-muted-foreground">
                Wellness Apps: {Math.round(activitySummary.screenTime.wellnessApps)} min
              </span>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={screenTimeChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {screenTimeChartData.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={Object.values(CHART_COLORS)[index % Object.keys(CHART_COLORS).length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Activity Times */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Activity Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activitySummary.peakActivityHours.map((hour, index) => (
              <div
                key={hour}
                className="flex items-center justify-between p-2 bg-muted rounded-lg"
              >
                <span className="font-medium">
                  {hour.toString().padStart(2, '0')}:00 - {(hour + 1).toString().padStart(2, '0')}:00
                </span>
                <span className="text-muted-foreground">
                  {activitySummary.hourlySteps[hour]} steps
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityDashboard;
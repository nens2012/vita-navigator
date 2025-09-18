import { useState } from "react";
import { 
  Home, User, Target, Calendar, MessageCircle, Activity, 
  Heart, Moon, Zap, TrendingUp, Settings, LogOut, Dumbbell, 
  Flower2, BrainCircuit, BarChart3, Clock
} from "lucide-react";

interface WellnessDashboardProps {
  userData: any;
  onLogout: () => void;
}

export const WellnessDashboard = ({ userData, onLogout }: WellnessDashboardProps) => {
  const [activeTab, setActiveTab] = useState("home");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const todaysTasks = [
    { id: 1, title: "Morning Yoga", duration: "15 min", completed: true, type: "yoga" },
    { id: 2, title: "Cardio Workout", duration: "30 min", completed: false, type: "exercise" },
    { id: 3, title: "Meditation", duration: "10 min", completed: false, type: "meditation" },
    { id: 4, title: "Evening Walk", duration: "20 min", completed: false, type: "exercise" },
  ];

  const quickAccessTiles = [
    { id: "exercise", title: "Exercise", icon: Dumbbell, color: "bg-red-500" },
    { id: "yoga", title: "Yoga", icon: Flower2, color: "bg-green-500" },
    { id: "meditation", title: "Meditation", icon: BrainCircuit, color: "bg-purple-500" },
    { id: "sleep", title: "Sleep", icon: Moon, color: "bg-indigo-500" },
    { id: "chatbot", title: "AI Coach", icon: MessageCircle, color: "bg-wellness-blue" },
    { id: "reports", title: "Reports", icon: BarChart3, color: "bg-orange-500" },
  ];

  // Add period tracker for female users
  if (userData.gender === "female") {
    quickAccessTiles.push({
      id: "period",
      title: "Period Tracker",
      icon: Calendar,
      color: "bg-pink-500"
    });
  }

  const stats = [
    { label: "Current Streak", value: "7 days", icon: Zap },
    { label: "Calories Burned", value: "1,240", icon: Activity },
    { label: "Active Minutes", value: "45 min", icon: Clock },
    { label: "Progress", value: "78%", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-wellness-blue text-white px-6 py-8 rounded-b-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{getGreeting()}</h1>
            <p className="text-blue-100">{userData.name || "User"}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Overview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Today's Progress</span>
            <span className="text-sm">3/4 tasks</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{ width: "75%" }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="wellness-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-wellness-blue/10 rounded-lg">
                  <stat.icon className="w-5 h-5 text-wellness-blue" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-bold text-lg">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Today's Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Today's Tasks</h2>
          <div className="space-y-3">
            {todaysTasks.map((task) => (
              <div
                key={task.id}
                className={`wellness-card p-4 flex items-center gap-4 ${
                  task.completed ? "opacity-60" : ""
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    task.completed ? "bg-success" : "bg-muted"
                  }`}
                >
                  {task.type === "yoga" && <Flower2 className="w-6 h-6 text-white" />}
                  {task.type === "exercise" && <Dumbbell className="w-6 h-6 text-white" />}
                  {task.type === "meditation" && <BrainCircuit className="w-6 h-6 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.duration}</p>
                </div>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    task.completed
                      ? "bg-success text-white"
                      : "bg-wellness-blue text-white hover:bg-wellness-blue-dark"
                  }`}
                >
                  {task.completed ? "Completed" : "Start"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Quick Access</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickAccessTiles.map((tile) => (
              <button
                key={tile.id}
                className="wellness-card p-6 text-left hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div className={`w-12 h-12 ${tile.color} rounded-xl flex items-center justify-center mb-3`}>
                  <tile.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium">{tile.title}</h3>
              </button>
            ))}
          </div>
        </div>

        {/* Gender-specific Features */}
        {userData.gender === "female" && (
          <div className="wellness-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Women's Health
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
              <button className="w-full text-sm text-wellness-blue font-medium py-2">
                Log Symptoms
              </button>
            </div>
          </div>
        )}

        {/* Weekly Summary */}
        <div className="wellness-card p-6">
          <h3 className="font-bold mb-4">This Week's Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Workouts Completed</span>
              <span className="text-sm font-medium">5/7</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Active Time</span>
              <span className="text-sm font-medium">4.5 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Meditation Sessions</span>
              <span className="text-sm font-medium">6/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-4">
        <div className="flex items-center justify-around">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "activity", icon: Activity, label: "Activity" },
            { id: "progress", icon: TrendingUp, label: "Progress" },
            { id: "profile", icon: User, label: "Profile" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "text-wellness-blue bg-wellness-blue/10"
                  : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom padding for fixed navigation */}
      <div className="h-20" />
    </div>
  );
};
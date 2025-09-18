const APP_CATEGORIES = {
  PRODUCTIVITY: [
    'Microsoft Word',
    'Microsoft Excel',
    'Microsoft PowerPoint',
    'Google Docs',
    'Notion',
    'Slack',
    'Visual Studio Code',
    'Trello',
    'Asana',
    'Monday.com',
  ],
  SOCIAL: [
    'WhatsApp',
    'Facebook',
    'Instagram',
    'Twitter',
    'LinkedIn',
    'Telegram',
    'Discord',
    'TikTok',
    'Snapchat',
  ],
  ENTERTAINMENT: [
    'Netflix',
    'YouTube',
    'Spotify',
    'Amazon Prime',
    'Disney+',
    'Twitch',
    'HBO Max',
    'Games',
  ],
  WELLNESS: [
    'Vita Navigator',
    'MyFitnessPal',
    'Strava',
    'Headspace',
    'Calm',
    'Nike Training Club',
    'Fitbod',
    'Sleep Cycle',
  ],
  EDUCATIONAL: [
    'Coursera',
    'Udemy',
    'edX',
    'Duolingo',
    'Khan Academy',
    'Brilliant',
    'Codecademy',
  ],
};

export interface AppUsageStats {
  appName: string;
  category: string;
  totalTime: number; // in minutes
  sessions: number;
  avgSessionLength: number;
  lastUsed: Date;
  focusScore: number; // 0-1, how focused the sessions were
}

export interface DailyScreenTimeReport {
  date: string;
  totalScreenTime: number;
  productiveTime: number;
  socialTime: number;
  entertainmentTime: number;
  wellnessTime: number;
  educationalTime: number;
  focusScore: number;
  mostUsedApps: AppUsageStats[];
  productivityTips: string[];
  wellnessRecommendations: string[];
}

export class ScreenTimeManager {
  private static instance: ScreenTimeManager;
  private appUsage: Record<string, AppUsageStats> = {};
  private focusMode: boolean = false;
  private sessionStartTime: number = Date.now();
  private currentApp: string = '';
  private activeWindow: boolean = true;
  private idleThreshold: number = 5 * 60 * 1000; // 5 minutes
  private lastActivity: number = Date.now();

  private constructor() {
    this.initializeTracking();
  }

  public static getInstance(): ScreenTimeManager {
    if (!ScreenTimeManager.instance) {
      ScreenTimeManager.instance = new ScreenTimeManager();
    }
    return ScreenTimeManager.instance;
  }

  private initializeTracking(): void {
    if (typeof window !== 'undefined') {
      // Track window focus/blur
      window.addEventListener('focus', () => this.handleWindowFocus());
      window.addEventListener('blur', () => this.handleWindowBlur());

      // Track user activity
      document.addEventListener('mousemove', () => this.updateActivity());
      document.addEventListener('keypress', () => this.updateActivity());
      document.addEventListener('click', () => this.updateActivity());
      document.addEventListener('scroll', () => this.updateActivity());

      // Check for idle state periodically
      setInterval(() => this.checkIdleState(), 60000); // Check every minute

      // Initialize current app tracking
      this.updateCurrentApp();
    }
  }

  private updateActivity(): void {
    this.lastActivity = Date.now();
    if (!this.activeWindow) {
      this.activeWindow = true;
      this.sessionStartTime = Date.now();
    }
  }

  private checkIdleState(): void {
    const now = Date.now();
    if (now - this.lastActivity > this.idleThreshold) {
      this.recordCurrentSession();
      this.activeWindow = false;
    }
  }

  private handleWindowFocus(): void {
    this.activeWindow = true;
    this.sessionStartTime = Date.now();
    this.updateCurrentApp();
  }

  private handleWindowBlur(): void {
    this.recordCurrentSession();
    this.activeWindow = false;
  }

  private updateCurrentApp(): void {
    // In a real implementation, this would use the browser's Active Tab API
    // or a native app API to get the current application name
    const mockCurrentApp = 'Vita Navigator';
    if (this.currentApp !== mockCurrentApp) {
      if (this.currentApp) {
        this.recordCurrentSession();
      }
      this.currentApp = mockCurrentApp;
      this.sessionStartTime = Date.now();
    }
  }

  private recordCurrentSession(): void {
    if (!this.currentApp || !this.activeWindow) return;

    const sessionDuration = (Date.now() - this.sessionStartTime) / 1000 / 60; // Convert to minutes
    if (sessionDuration < 0.5) return; // Ignore sessions shorter than 30 seconds

    const category = this.getAppCategory(this.currentApp);
    const focusScore = this.calculateFocusScore(sessionDuration);

    if (!this.appUsage[this.currentApp]) {
      this.appUsage[this.currentApp] = {
        appName: this.currentApp,
        category,
        totalTime: 0,
        sessions: 0,
        avgSessionLength: 0,
        lastUsed: new Date(),
        focusScore: 0,
      };
    }

    const stats = this.appUsage[this.currentApp];
    stats.totalTime += sessionDuration;
    stats.sessions += 1;
    stats.avgSessionLength = stats.totalTime / stats.sessions;
    stats.lastUsed = new Date();
    stats.focusScore = (stats.focusScore * (stats.sessions - 1) + focusScore) / stats.sessions;
  }

  private calculateFocusScore(sessionDuration: number): number {
    const factors = {
      duration: 0,
      timeOfDay: 0,
      appCategory: 0,
      userActivity: 0,
    };

    // Duration factor: longer sessions might indicate better focus
    factors.duration = Math.min(sessionDuration / 30, 1); // Cap at 30 minutes

    // Time of day factor: typical productive hours
    const hour = new Date().getHours();
    factors.timeOfDay = hour >= 9 && hour <= 17 ? 1 : 0.5;

    // App category factor
    const category = this.getAppCategory(this.currentApp);
    factors.appCategory = 
      category === 'PRODUCTIVITY' || category === 'EDUCATIONAL' ? 1 :
      category === 'WELLNESS' ? 0.8 :
      category === 'SOCIAL' || category === 'ENTERTAINMENT' ? 0.3 :
      0.5;

    // User activity factor (based on input frequency)
    const activityInterval = (Date.now() - this.lastActivity) / 1000;
    factors.userActivity = Math.max(0, 1 - (activityInterval / 300)); // Decay over 5 minutes

    // Weighted average of all factors
    return (
      factors.duration * 0.3 +
      factors.timeOfDay * 0.2 +
      factors.appCategory * 0.3 +
      factors.userActivity * 0.2
    );
  }

  private getAppCategory(appName: string): string {
    for (const [category, apps] of Object.entries(APP_CATEGORIES)) {
      if (apps.includes(appName)) {
        return category;
      }
    }
    return 'OTHER';
  }

  public toggleFocusMode(): void {
    this.focusMode = !this.focusMode;
    // In a real implementation, this would integrate with the OS's focus/DND mode
  }

  public getDailyReport(): DailyScreenTimeReport {
    const today = new Date().toISOString().split('T')[0];
    const stats = Object.values(this.appUsage)
      .filter(app => app.lastUsed.toISOString().split('T')[0] === today);

    const categoryTimes = stats.reduce((acc, app) => {
      acc[app.category] = (acc[app.category] || 0) + app.totalTime;
      return acc;
    }, {} as Record<string, number>);

    const totalTime = stats.reduce((sum, app) => sum + app.totalTime, 0);
    const avgFocusScore = stats.reduce((sum, app) => sum + app.focusScore, 0) / stats.length || 0;

    const recommendations = this.generateRecommendations(categoryTimes, avgFocusScore);

    return {
      date: today,
      totalScreenTime: totalTime,
      productiveTime: categoryTimes.PRODUCTIVITY || 0,
      socialTime: categoryTimes.SOCIAL || 0,
      entertainmentTime: categoryTimes.ENTERTAINMENT || 0,
      wellnessTime: categoryTimes.WELLNESS || 0,
      educationalTime: categoryTimes.EDUCATIONAL || 0,
      focusScore: avgFocusScore,
      mostUsedApps: stats
        .sort((a, b) => b.totalTime - a.totalTime)
        .slice(0, 5),
      productivityTips: recommendations.productivityTips,
      wellnessRecommendations: recommendations.wellnessRecommendations,
    };
  }

  private generateRecommendations(
    categoryTimes: Record<string, number>,
    focusScore: number
  ): {
    productivityTips: string[];
    wellnessRecommendations: string[];
  } {
    const tips: string[] = [];
    const wellnessRecs: string[] = [];

    const totalTime = Object.values(categoryTimes).reduce((sum, time) => sum + time, 0);
    const productivityRatio = (categoryTimes.PRODUCTIVITY || 0) / totalTime;
    const socialRatio = (categoryTimes.SOCIAL || 0) / totalTime;
    const wellnessRatio = (categoryTimes.WELLNESS || 0) / totalTime;

    // Productivity recommendations
    if (focusScore < 0.6) {
      tips.push('Consider using the Pomodoro technique to improve focus');
      tips.push('Try working in shorter, more focused sessions');
    }
    if (productivityRatio < 0.4) {
      tips.push('Schedule dedicated productivity blocks in your calendar');
      tips.push('Use website blockers during work hours');
    }
    if (socialRatio > 0.3) {
      tips.push('Set specific times for checking social media');
      tips.push('Use app limits for social platforms');
    }

    // Wellness recommendations
    if (totalTime > 480) { // More than 8 hours
      wellnessRecs.push('Take regular screen breaks using the 20-20-20 rule');
      wellnessRecs.push('Consider using blue light filters in the evening');
    }
    if (wellnessRatio < 0.1) {
      wellnessRecs.push('Schedule short wellness breaks throughout the day');
      wellnessRecs.push('Try mindfulness exercises between tasks');
    }
    if (focusScore < 0.4) {
      wellnessRecs.push('Take a short walk to refresh your mind');
      wellnessRecs.push('Practice deep breathing exercises');
    }

    return {
      productivityTips: tips.slice(0, 3),
      wellnessRecommendations: wellnessRecs.slice(0, 3),
    };
  }
}
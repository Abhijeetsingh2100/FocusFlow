import UsageStatsModule from './src/UsageStatsModule';

export type UsageStat = {
  packageName: string;
  appName: string;
  totalTimeInForeground: number;
  icon: string;
};

export function checkForPermission(): boolean {
  if (!UsageStatsModule) return false;
  return UsageStatsModule.checkForPermission();
}

export function showUsageAccessSettings(): void {
  if (!UsageStatsModule) return;
  UsageStatsModule.showUsageAccessSettings();
}

export function getDailyUsage(): UsageStat[] {
  if (!UsageStatsModule) return [];
  return UsageStatsModule.getDailyUsage();
}

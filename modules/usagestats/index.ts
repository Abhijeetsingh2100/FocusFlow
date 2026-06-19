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

export type DailyUsageResponse = {
  totalScreenTime: number;
  apps: UsageStat[];
};

export function getDailyUsage(): DailyUsageResponse {
  if (!UsageStatsModule) return { totalScreenTime: 0, apps: [] };
  return UsageStatsModule.getDailyUsage();
}

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Platform, TouchableOpacity, Image } from 'react-native';
import { Smartphone, Play, Music, Settings } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

// Import our local Expo module
let UsageStats: any = null;
if (Platform.OS === 'android') {
  try {
    UsageStats = require('../../../modules/usagestats');
  } catch (e) {
    console.log('UsageStats module not available', e);
  }
}

const AnimatedView = Animated.createAnimatedComponent(View);

const COLORS = ['#EC4899', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#14B8A6'];

export default function DashboardScreen() {
  const [apps, setApps] = useState<any[]>([]);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // Mock data for fallback (iOS / web / permission denied)
  const mockApps = [
    { id: '1', name: 'Instagram', category: 'Social Media', time: '2h 15m', minutes: 135, color: '#EC4899', iconData: null },
    { id: '2', name: 'YouTube', category: 'Entertainment', time: '1h 20m', minutes: 80, color: '#EF4444', iconData: null },
    { id: '3', name: 'TikTok', category: 'Entertainment', time: '45m', minutes: 45, color: '#0F172A', iconData: null },
  ];

  const loadUsageStats = () => {
    if (Platform.OS === 'android' && UsageStats) {
      const permitted = UsageStats.checkForPermission();
      setHasPermission(permitted);

      if (permitted) {
        const response = UsageStats.getDailyUsage() || { totalScreenTime: 0, apps: [] };
        const stats = response.apps || [];
        // Sort by time descending
        stats.sort((a: any, b: any) => b.totalTimeInForeground - a.totalTimeInForeground);
        
        // Use true total screen time directly from device screen-on events
        const totalMins = Math.floor(response.totalScreenTime / 1000 / 60);
        setTotalMinutes(totalMins);

        // Take top 5 apps
        const topStats = stats.slice(0, 5);
        
        const formattedApps = topStats.map((stat: any, index: number) => {
          const minutes = Math.floor(stat.totalTimeInForeground / 1000 / 60);
          const h = Math.floor(minutes / 60);
          const m = minutes % 60;
          return {
            id: stat.packageName,
            name: stat.appName || stat.packageName,
            category: 'App', // We don't have category from UsageStats API
            time: h > 0 ? `${h}h ${m}m` : `${m}m`,
            minutes: minutes,
            color: COLORS[index % COLORS.length],
            iconData: stat.icon // Base64 string
          };
        });
        
        setApps(formattedApps.length > 0 ? formattedApps : mockApps);
      } else {
        setApps(mockApps);
        setTotalMinutes(mockApps.reduce((acc, app) => acc + app.minutes, 0));
      }
    } else {
      setApps(mockApps);
      setTotalMinutes(mockApps.reduce((acc, app) => acc + app.minutes, 0));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsageStats();
    // Poll for changes when they return from settings
    const interval = setInterval(() => {
      if (Platform.OS === 'android' && !hasPermission) {
         loadUsageStats();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [hasPermission]);

  const requestPermission = () => {
    if (UsageStats) {
      UsageStats.showUsageAccessSettings();
    }
  };

  const usedHoursDisplay = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = -90;

  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: false,
      })
    ).start();
  }, [colorAnim]);

  const animatedShadowColor = colorAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['#06B6D4', '#EC4899', '#38BDF8', '#1E3A8A', '#06B6D4']
  });

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      <View className="absolute top-0 left-0 w-full h-96 bg-blue-100/50 rounded-b-[100px] blur-3xl" />

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-[#64748B] text-sm font-bold uppercase tracking-wider mb-1">Overview</Text>
            <Text className="text-[#0F172A] text-3xl font-extrabold tracking-tight">Today</Text>
          </View>
        </View>

        {!hasPermission && Platform.OS === 'android' && (
          <TouchableOpacity 
            onPress={requestPermission}
            className="w-full bg-blue-600 rounded-[24px] p-5 mb-6 flex-row items-center"
          >
            <View className="bg-white/20 p-3 rounded-full mr-4">
              <Settings color="#FFFFFF" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">Grant Usage Access</Text>
              <Text className="text-blue-100 text-sm mt-1">Required to show real app screen time.</Text>
            </View>
          </TouchableOpacity>
        )}

        <AnimatedView 
          style={[styles.mainCard, { shadowColor: animatedShadowColor }]} 
          className="w-full bg-white rounded-[32px] p-8 mb-6 items-center"
        >
          <Text className="text-[#0F172A] text-lg font-bold mb-6">Total Screen Time</Text>
          
          <View className="items-center justify-center relative mb-2">
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} fill="none" />
              {apps.map((app) => {
                if (totalMinutes === 0) return null;
                const dashLength = (app.minutes / totalMinutes) * circumference;
                const dashGap = circumference - dashLength;
                const strokeDasharray = `${dashLength} ${dashGap}`;
                const rotateAngle = cumulativeAngle;
                cumulativeAngle += (app.minutes / totalMinutes) * 360;

                return (
                  <Circle 
                    key={app.id}
                    cx={size / 2} cy={size / 2} r={radius} 
                    stroke={app.color} strokeWidth={strokeWidth} fill="none" 
                    strokeDasharray={strokeDasharray} strokeDashoffset={0} strokeLinecap="butt" 
                    transform={`rotate(${rotateAngle} ${size / 2} ${size / 2})`}
                  />
                );
              })}
            </Svg>
            
            <View className="absolute items-center justify-center">
              <Text className="text-[#0F172A] text-4xl font-black tracking-tighter">{usedHoursDisplay}</Text>
              <Text className="text-[#64748B] text-sm font-bold mt-1">Screen Time</Text>
            </View>
          </View>
        </AnimatedView>

        <Text className="text-[#0F172A] text-xl font-bold tracking-tight mb-4 mt-2">App Breakdown</Text>
        
        {apps.map((app) => (
          <View key={app.id} style={styles.appCard} className="w-full bg-white rounded-[28px] p-5 flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <View className="w-14 h-14 bg-slate-100 rounded-[18px] items-center justify-center mr-4 overflow-hidden">
                {app.iconData ? (
                  <Image source={{ uri: app.iconData }} style={{ width: 40, height: 40 }} />
                ) : (
                  <Smartphone color={app.color} size={28} strokeWidth={2.5} />
                )}
              </View>
              <View className="flex-1 pr-4">
                <Text className="text-[#0F172A] text-lg font-bold" numberOfLines={1}>{app.name}</Text>
                <Text className="text-[#64748B] text-sm font-medium mt-0.5">{app.category}</Text>
              </View>
            </View>
            <View className="items-end pl-2">
              <Text className="text-[#0F172A] text-lg font-bold">{app.time}</Text>
              <Text style={{ color: app.color }} className="text-sm font-extrabold mt-1">
                {totalMinutes > 0 ? Math.round((app.minutes / totalMinutes) * 100) : 0}%
              </Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },
  appCard: {
    shadowColor: '#8E9EAB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  }
});

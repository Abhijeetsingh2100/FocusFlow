import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { Smartphone, Play, Music } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function DashboardScreen() {
  // Mock data for multiple apps
  const apps = [
    { id: 1, name: 'Instagram', category: 'Social Media', time: '2h 15m', minutes: 135, color: '#EC4899', Icon: Smartphone, bgClass: 'bg-pink-50' },
    { id: 2, name: 'YouTube', category: 'Entertainment', time: '1h 20m', minutes: 80, color: '#EF4444', Icon: Play, bgClass: 'bg-red-50' },
    { id: 3, name: 'TikTok', category: 'Entertainment', time: '45m', minutes: 45, color: '#0F172A', Icon: Music, bgClass: 'bg-slate-100' },
  ];

  const totalUsedMinutes = apps.reduce((acc, app) => acc + app.minutes, 0);
  const usedHoursDisplay = `${Math.floor(totalUsedMinutes / 60)}h ${totalUsedMinutes % 60}m`;

  const size = 200;
  const strokeWidth = 16; // Slightly thicker for a full donut chart
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = -90; // Start at the top

  // Animated Shadow Gradient
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: false, // shadowColor animation does not support native driver
      })
    ).start();
  }, [colorAnim]);

  const animatedShadowColor = colorAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['#06B6D4', '#EC4899', '#38BDF8', '#1E3A8A', '#06B6D4'] // Cyan -> Pink -> Sky Blue -> Navy Blue -> Cyan
  });

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      {/* Very Soft Background Orbs */}
      <View className="absolute top-0 left-0 w-full h-96 bg-blue-100/50 rounded-b-[100px] blur-3xl" />

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-[#64748B] text-sm font-bold uppercase tracking-wider mb-1">Overview</Text>
            <Text className="text-[#0F172A] text-3xl font-extrabold tracking-tight">Today</Text>
          </View>
        </View>

        {/* Main Progress Card */}
        <AnimatedView 
          style={[
            styles.mainCard, 
            { 
              shadowColor: animatedShadowColor, 
            }
          ]} 
          className="w-full bg-white rounded-[32px] p-8 mb-6 items-center"
        >
          
          <Text className="text-[#0F172A] text-lg font-bold mb-6">Total Screen Time</Text>
          
          {/* Elegant Segmented Circular Chart */}
          <View className="items-center justify-center relative mb-2">
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Background Track (Only visible if apps array is empty, otherwise covered by full pie) */}
              <Circle 
                cx={size / 2} 
                cy={size / 2} 
                r={radius} 
                stroke="#F1F5F9" 
                strokeWidth={strokeWidth} 
                fill="none" 
              />
              {/* App Segments */}
              {apps.map((app) => {
                const dashLength = (app.minutes / totalUsedMinutes) * circumference;
                const dashGap = circumference - dashLength;
                const strokeDasharray = `${dashLength} ${dashGap}`;
                const rotateAngle = cumulativeAngle;
                
                // Add the current segment's angle to the cumulative for the next one
                // Subtracting a tiny amount like 0.5 degrees visually creates perfect pie slices without gaps
                cumulativeAngle += (app.minutes / totalUsedMinutes) * 360;

                return (
                  <Circle 
                    key={app.id}
                    cx={size / 2} 
                    cy={size / 2} 
                    r={radius} 
                    stroke={app.color} 
                    strokeWidth={strokeWidth} 
                    fill="none" 
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={0}
                    strokeLinecap="butt" 
                    transform={`rotate(${rotateAngle} ${size / 2} ${size / 2})`}
                  />
                );
              })}
            </Svg>
            
            {/* Center Text */}
            <View className="absolute items-center justify-center">
              <Text className="text-[#0F172A] text-4xl font-black tracking-tighter">{usedHoursDisplay}</Text>
              <Text className="text-[#64748B] text-sm font-bold mt-1">Screen Time</Text>
            </View>
          </View>

        </AnimatedView>

        {/* App Breakdown List */}
        <Text className="text-[#0F172A] text-xl font-bold tracking-tight mb-4 mt-2">App Breakdown</Text>
        
        {apps.map((app) => (
          <View key={app.id} style={styles.appCard} className="w-full bg-white rounded-[28px] p-5 flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className={`w-14 h-14 ${app.bgClass} rounded-[18px] items-center justify-center mr-4`}>
                <app.Icon color={app.color} size={28} strokeWidth={2.5} />
              </View>
              <View>
                <Text className="text-[#0F172A] text-xl font-bold">{app.name}</Text>
                <Text className="text-[#64748B] text-sm font-medium mt-0.5">{app.category}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-[#0F172A] text-xl font-bold">{app.time}</Text>
              <Text style={{ color: app.color }} className="text-sm font-extrabold mt-1">
                {Math.round((app.minutes / totalUsedMinutes) * 100)}%
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
    elevation: 20, // Required on Android for shadows, though colored shadows on Android require Pie/SDK28+
  },
  card: {
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  appCard: {
    shadowColor: '#8E9EAB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  }
});

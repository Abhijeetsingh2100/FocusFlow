import React from 'react';
import { View, Text } from 'react-native';
import { Timer } from 'lucide-react-native';

export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-[#E8EEF2] items-center justify-center p-6">
      {/* Soft Background Orbs */}
      <View className="absolute top-10 left-10 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl" />
      <View className="absolute bottom-40 right-10 w-72 h-72 bg-indigo-300/30 rounded-full blur-3xl" />

      <View className="w-24 h-24 bg-white rounded-[32px] items-center justify-center mb-8 shadow-xl shadow-blue-500/20">
        <Timer color="#4F46E5" size={48} strokeWidth={2} />
      </View>
      <Text className="text-[#1E293B] text-3xl font-black mb-2">Main Dashboard</Text>
      <Text className="text-[#64748B] text-center px-6">
        This is where you will see your daily screen time limits and progress.
      </Text>
    </View>
  );
}

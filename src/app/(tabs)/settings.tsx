import React from 'react';
import { View, Text } from 'react-native';
import { Settings as SettingsIcon } from 'lucide-react-native';

export default function SettingsScreen() {
  return (
    <View className="flex-1 bg-[#E8EEF2] items-center justify-center p-6">
      {/* Soft Background Orbs */}
      <View className="absolute top-10 left-10 w-64 h-64 bg-pink-300/30 rounded-full blur-3xl" />
      <View className="absolute bottom-40 right-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />

      <View className="w-24 h-24 bg-white rounded-[32px] items-center justify-center mb-8 shadow-xl shadow-pink-500/20">
        <SettingsIcon color="#EC4899" size={48} strokeWidth={2} />
      </View>
      <Text className="text-[#1E293B] text-3xl font-black mb-2">Settings</Text>
      <Text className="text-[#64748B] text-center px-6">
        Manage your profile, alarms, and app lock schedules here.
      </Text>
    </View>
  );
}

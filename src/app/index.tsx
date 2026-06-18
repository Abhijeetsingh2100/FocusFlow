import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Timer } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#E8EEF2] items-center px-6 pb-12">
      
      <View className="absolute top-10 left-10 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl" />
      <View className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300/30 rounded-full blur-3xl" />

      
      <View className="flex-1 items-center justify-center w-full">
        
        <View style={styles.box3d} className="w-36 h-36 bg-[#F5F8FA] rounded-[36px] items-center justify-center mb-12">
         
          <View className="absolute w-full h-full rounded-[36px] border-b-[8px] border-r-[4px] border-[#D1D9E0]" />
          <Timer color="#4F46E5" size={64} strokeWidth={2} />
        </View>

        <Text className="text-[#1E293B] text-4xl font-black text-center tracking-tight mb-4">
          Moniter Your{"\n"}Digital Life
        </Text>
        
        <Text className="text-[#64748B] text-base text-center leading-relaxed px-4 font-medium">
          Take control of your screen time, build better habits, and reclaim your focus with personalized insights.
        </Text>
      </View>

      
      <View className="w-full">
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.push("/onboarding")}
          style={styles.buttonShadow}
          className="w-full bg-[#4F46E5] rounded-2xl items-center justify-center py-5"
        >
          <Text className="text-white font-extrabold text-xl tracking-wide">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box3d: {
    shadowColor: '#8E9EAB',
    shadowOffset: { width: 10, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  buttonShadow: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  }
});

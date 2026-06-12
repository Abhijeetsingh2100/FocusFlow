import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Check, Clock, BellRing } from 'lucide-react-native';

const slides = [
  {
    id: 0,
    title: "Why Time Management?",
    description: "Time is your most valuable asset. Managing it properly helps you reduce stress, increase productivity, and achieve your goals faster.",
    Icon: Clock,
    color: "#4F46E5"
  },
  {
    id: 1,
    title: "Manage Alarms & Locks",
    description: "Set daily limits and schedule locks for distracting apps. Our smart alarms will gently remind you when it's time to disconnect.",
    Icon: BellRing,
    color: "#EC4899"
  },
  {
    id: 2,
    title: "Welcome to FocusFlow!",
    description: "You're all set to take control of your digital life. Let's build better habits together.",
    Icon: Check,
    color: "#10B981"
  }
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    rotation.setValue(0);
    scale.setValue(1);

    if (step === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotation, { toValue: -15, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(rotation, { toValue: 15, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(rotation, { toValue: 0, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    } else if (step === 1) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotation, { toValue: -20, duration: 100, useNativeDriver: true }),
          Animated.timing(rotation, { toValue: 20, duration: 200, useNativeDriver: true }),
          Animated.timing(rotation, { toValue: 0, duration: 100, useNativeDriver: true })
        ])
      ).start();
    } else {
      scale.setValue(0);
      Animated.spring(scale, {
        toValue: 1.2,
        friction: 4,
        tension: 80,
        useNativeDriver: true
      }).start();
    }
  }, [step]);

  const spin = rotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg']
  });

  const nextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const CurrentIcon = slides[step].Icon;
  const isLast = step === 2;

  return (
    <View className="flex-1 bg-[#E8EEF2] items-center px-6 pb-12">
      {/* Background Soft Orbs */}
      <View className="absolute top-10 left-10 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl" />
      <View className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl" />

      {/* Center 3D Content */}
      <View className="flex-1 items-center justify-center w-full">
        <Animated.View 
          style={[styles.box3d, { transform: [{ rotateZ: spin }, { scale: scale }] }]} 
          className="w-36 h-36 bg-[#F5F8FA] rounded-[36px] items-center justify-center mb-12"
        >
          {/* 3D Depth Layer */}
          <View className="absolute w-full h-full rounded-[36px] border-b-[8px] border-r-[4px] border-[#D1D9E0]" />
          <CurrentIcon color={slides[step].color} size={64} strokeWidth={2} />
        </Animated.View>

        <Text className="text-[#1E293B] text-3xl font-black text-center tracking-tight mb-4">
          {slides[step].title}
        </Text>
        
        <Text className="text-[#64748B] text-base text-center leading-relaxed px-4 font-medium">
          {slides[step].description}
        </Text>
      </View>

      {/* Bottom Section */}
      <View className="w-full">
        {/* Pagination Dots */}
        <View className="flex-row justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <View 
              key={index} 
              className={`h-2.5 rounded-full transition-all duration-300 ${step === index ? 'w-10 bg-[#4F46E5]' : 'w-2.5 bg-[#CBD5E1]'}`} 
            />
          ))}
        </View>

        {/* Clean Next Button */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={nextStep}
          style={isLast ? styles.buttonShadowGreen : styles.buttonShadow}
          className={`w-full rounded-2xl items-center justify-center py-5 ${isLast ? 'bg-[#10B981]' : 'bg-[#4F46E5]'}`}
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-white font-extrabold text-xl mr-2 tracking-wide">
              {isLast ? "Hop in!" : "Next"}
            </Text>
            {!isLast && <ArrowRight color="white" size={24} strokeWidth={3} />}
          </View>
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
  },
  buttonShadowGreen: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  }
});

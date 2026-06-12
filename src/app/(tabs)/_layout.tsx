import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Settings } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

function GlassTabBar({ state, descriptors, navigation }: any) {
  const animatedIndex = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(animatedIndex, {
      toValue: state.index,
      useNativeDriver: false, // Animating 'left' cannot use native driver
      friction: 6,
      tension: 60,
    }).start();
  }, [state.index]);

  const tabWidthPercent = 100 / state.routes.length;
  const animatedLeft = animatedIndex.interpolate({
    inputRange: state.routes.map((_: any, i: number) => i),
    outputRange: state.routes.map((_: any, i: number) => `${i * tabWidthPercent}%`),
  });

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={80} tint="light" style={styles.blurView}>
        {/* Animated Sliding Indicator */}
        <Animated.View style={[styles.indicatorWrapper, { width: `${tabWidthPercent}%`, left: animatedLeft }]}>
          <View style={styles.indicator} />
        </Animated.View>

        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                {options.tabBarIcon && options.tabBarIcon({ 
                  color: isFocused ? '#4F46E5' : '#94A3B8', 
                  focused: isFocused 
                })}
              </View>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs 
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={focused ? 28 : 24} strokeWidth={focused ? 2.5 : 2} />
          )
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          tabBarIcon: ({ color, focused }) => (
            <Settings color={color} size={focused ? 28 : 24} strokeWidth={focused ? 2.5 : 2} />
          )
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    height: 64,
    borderRadius: 32,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden', // Critical for liquid glass rounded corners
  },
  blurView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Enhances the frosted glass effect
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    width: 48,
  },
  indicatorWrapper: {
    position: 'absolute',
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8, // Spacing from bottom
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
  }
});

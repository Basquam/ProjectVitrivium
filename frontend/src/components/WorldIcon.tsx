import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { StoryTheme, GLOBAL_THEME } from '../theme';

interface WorldIconProps {
  theme: StoryTheme;
  delay: number;
}

const WorldIcon: React.FC<WorldIconProps> = ({ theme, delay }) => {
  // Entrance animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const rotation = useSharedValue(-30);
  // Continuous breathing glow
  const glow = useSharedValue(0);

  useEffect(() => {
    // Entrance: scale-in + fade + rotate-in with spring
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 8, stiffness: 120, mass: 0.6 })
    );
    rotation.value = withDelay(
      delay,
      withSpring(0, { damping: 10, stiffness: 100 })
    );

    // Continuous breathing glow - starts after entrance settles
    glow.value = withDelay(
      delay + 800,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1, // infinite
        false
      )
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + glow.value * 0.45,
    transform: [{ scale: 1 + glow.value * 0.15 }],
  }));

  return (
    <Animated.View style={[styles.wrapper, containerStyle]}>
      {/* Soft breathing halo behind icon */}
      <Animated.View
        style={[
          styles.halo,
          { backgroundColor: theme.primary },
          glowStyle,
        ]}
      />
      {/* The icon itself */}
      <View style={[styles.icon, { borderColor: theme.primary }]}>
        <Text style={styles.iconText}>{theme.emoji}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  halo: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
});

export default WorldIcon;

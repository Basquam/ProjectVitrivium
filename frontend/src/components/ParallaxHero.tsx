import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { DeviceMotion } from 'expo-sensors';
import { GLOBAL_THEME } from '../theme';

interface ParallaxHeroProps {
  imageUrl: string;
  tintColor: string;
  height: number;
  /**
   * Pixels the image can drift in each direction. Higher = more dramatic motion.
   * Defaults to 24 for a subtle effect.
   */
  intensity?: number;
  /**
   * If true, applies a downward gradient fade to merge with the background.
   */
  fadeToBackground?: boolean;
  style?: ViewStyle;
}

// Web/older devices fallback - just render static
const isMotionSupported = Platform.OS === 'ios' || Platform.OS === 'android';

const ParallaxHero: React.FC<ParallaxHeroProps> = ({
  imageUrl,
  tintColor,
  height,
  intensity = 24,
  fadeToBackground = true,
  style,
}) => {
  // Shared values for X/Y offset (in px) and scale
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  useEffect(() => {
    if (!isMotionSupported) return;

    let subscription: any;
    let isMounted = true;

    const startMotion = async () => {
      try {
        const available = await DeviceMotion.isAvailableAsync();
        if (!available || !isMounted) return;

        DeviceMotion.setUpdateInterval(60); // ~16fps - smooth enough, low CPU

        subscription = DeviceMotion.addListener(({ rotation }) => {
          if (!rotation) return;
          // rotation.gamma: left-right tilt (-π/2 to π/2)
          // rotation.beta:  forward-back tilt (-π to π)
          // Normalize to -1..1 with a forgiving range (~30 degrees feels natural)
          const gx = Math.max(-1, Math.min(1, (rotation.gamma || 0) / 0.5));
          const gy = Math.max(-1, Math.min(1, (rotation.beta || 0) / 0.5));

          // Inverse so image moves opposite to tilt (window pane illusion)
          offsetX.value = withSpring(-gx * intensity, {
            damping: 25,
            stiffness: 80,
            mass: 0.8,
          });
          offsetY.value = withSpring(-gy * intensity * 0.6, {
            damping: 25,
            stiffness: 80,
            mass: 0.8,
          });
        });
      } catch (e) {
        // silently degrade - keep static image
        console.warn('DeviceMotion unavailable:', e);
      }
    };

    startMotion();

    return () => {
      isMounted = false;
      if (subscription) subscription.remove();
    };
  }, [intensity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
  }));

  return (
    <View style={[styles.container, { height, pointerEvents: 'none' as any }, style]}>
      <Animated.View style={[styles.imageWrap, animatedStyle]}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
      </Animated.View>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: tintColor }]} />
      {fadeToBackground && (
        <LinearGradient
          colors={['transparent', 'rgba(10,10,10,0.4)', 'rgba(10,10,10,0.85)', GLOBAL_THEME.background]}
          locations={[0, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  imageWrap: {
    // Slightly bigger than container so movement doesn't reveal edges
    position: 'absolute',
    top: -30,
    left: -30,
    right: -30,
    bottom: -30,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ParallaxHero;

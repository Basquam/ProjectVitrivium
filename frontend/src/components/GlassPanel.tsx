import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderColor?: string;
}

const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  style,
  intensity = 30,
  tint = 'dark',
  borderColor = 'rgba(255, 255, 255, 0.1)',
}) => {
  // BlurView works well on iOS/Android. On web, fallback to semi-transparent background.
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.webGlass,
          { borderColor },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[styles.glass, { borderColor }, style]}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  glass: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  webGlass: {
    borderRadius: 16,
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    borderWidth: 1,
    backdropFilter: 'blur(20px)' as any,
  },
});

export default GlassPanel;

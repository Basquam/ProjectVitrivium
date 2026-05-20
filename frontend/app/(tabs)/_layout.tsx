import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GLOBAL_THEME } from '../../src/theme';
import { Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GLOBAL_THEME.gold,
        tabBarInactiveTintColor: GLOBAL_THEME.textMuted,
        tabBarStyle: {
          backgroundColor: 'rgba(10, 10, 10, 0.92)',
          borderTopColor: GLOBAL_THEME.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          position: 'absolute',
        },
        tabBarBackground: () =>
          Platform.OS !== 'web' ? (
            <BlurView
              tint="dark"
              intensity={60}
              style={{ flex: 1, backgroundColor: 'rgba(10,10,10,0.6)' }}
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: 'rgba(10,10,10,0.92)' }} />
          ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Quest',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Missions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          title: 'Worlds',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="planet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hero',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

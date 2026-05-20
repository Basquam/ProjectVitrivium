import React from 'react';
import { Stack } from 'expo-router';
import { AppProvider } from '../src/contexts/AppContext';
import { StatusBar } from 'expo-status-bar';
import { useFonts as useRye, Rye_400Regular } from '@expo-google-fonts/rye';
import { useFonts as useOrbitron, Orbitron_700Bold } from '@expo-google-fonts/orbitron';
import { useFonts as useCinzel, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { useFonts as useOswald, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { useFonts as useCourier, CourierPrime_700Bold } from '@expo-google-fonts/courier-prime';

export default function RootLayout() {
  // Fonts load asynchronously in the background.
  // The app renders IMMEDIATELY with system-font fallbacks (React Native auto-falls
  // back when a fontFamily isn't loaded yet). Once a font finishes loading, the
  // matching Text components automatically swap to the custom face.
  // This prevents Expo Go from hanging on the loading screen while fonts download.
  useRye({ Rye_400Regular });
  useOrbitron({ Orbitron_700Bold });
  useCinzel({ Cinzel_700Bold });
  useOswald({ Oswald_700Bold });
  useCourier({ CourierPrime_700Bold });

  return (
    <AppProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="create-story" options={{ presentation: 'modal' }} />
      </Stack>
    </AppProvider>
  );
}

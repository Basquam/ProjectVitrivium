import React from 'react';
import { Stack } from 'expo-router';
import { AppProvider } from '../src/contexts/AppContext';
import { StatusBar } from 'expo-status-bar';
import { useFonts as useRye, Rye_400Regular } from '@expo-google-fonts/rye';
import { useFonts as useOrbitron, Orbitron_700Bold } from '@expo-google-fonts/orbitron';
import { useFonts as useCinzel, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { useFonts as useOswald, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { useFonts as useCourier, CourierPrime_700Bold } from '@expo-google-fonts/courier-prime';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootLayout() {
  const [ryeLoaded] = useRye({ Rye_400Regular });
  const [orbitronLoaded] = useOrbitron({ Orbitron_700Bold });
  const [cinzelLoaded] = useCinzel({ Cinzel_700Bold });
  const [oswaldLoaded] = useOswald({ Oswald_700Bold });
  const [courierLoaded] = useCourier({ CourierPrime_700Bold });

  const fontsLoaded = ryeLoaded && orbitronLoaded && cinzelLoaded && oswaldLoaded && courierLoaded;

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F4C430" />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

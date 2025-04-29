// app/_layout.tsx

import { useEffect, useState } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Image, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/context/ThemeContext';
import { RefreshProvider } from '@/context/RefreshContext';
import { AuthProvider } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [isSplashReady, setSplashReady] = useState(false);
  const fadeAnim = new Animated.Value(1);

  const [fontsLoaded, fontError] = useFonts({
    'SpaceGrotesk-Regular': SpaceGrotesk_400Regular,
    'SpaceGrotesk-Medium': SpaceGrotesk_500Medium,
    'SpaceGrotesk-SemiBold': SpaceGrotesk_600SemiBold,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          setSplashReady(true);
          SplashScreen.hideAsync();
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?q=80&w=2067&auto=format&fit=crop' }}
          style={styles.splashImage}
        />
      </View>
    );
  }

  if (!isSplashReady) {
    return (
      <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?q=80&w=2940&auto=format&fit=crop' }}
          style={styles.splashImage}
        />
      </Animated.View>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <RefreshProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
            </Stack>
            <Toast />
            <StatusBar style="light" />
          </SafeAreaView>
        </RefreshProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  splashImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
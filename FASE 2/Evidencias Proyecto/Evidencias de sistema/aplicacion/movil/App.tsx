import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaInsetsContext, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
} from '@expo-google-fonts/figtree';
import AppNavigator from './src/navigation/AppNavigator';
import { goToSessionExpired, navigationRef } from './src/navigation/ref';
import { OfflineBanner, ToastProvider, useToast } from './src/components';
import { onSessionExpired } from './src/services/session';
import { useOnline } from './src/services/network';
import { colors } from './src/theme';

function Shell() {
  const insets = useSafeAreaInsets();
  const online = useOnline();
  const toast = useToast();
  const wasOffline = useRef(false);

  useEffect(() => onSessionExpired(goToSessionExpired), []);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      wasOffline.current = false;
      toast.show('Volvió la conexión. Todo al día.');
    }
  }, [online, toast]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      {online ? null : <OfflineBanner />}
      <SafeAreaInsetsContext.Provider value={online ? insets : { ...insets, top: 0 }}>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.ground,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </SafeAreaProvider>
  );
}

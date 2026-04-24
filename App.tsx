import React, { useEffect } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
  Inter_700Bold,    Inter_800ExtraBold, Inter_900Black,
} from '@expo-google-fonts/inter';
import { LanguageProvider } from './src/store/LanguageContext';
import { ThemeProvider, useTheme } from './src/store/ThemeContext';
import { UserProvider } from './src/store/UserContext';
import { FastsProvider } from './src/store/FastsContext';
import { setupNotificationChannel } from './src/utils/notifications';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/theme';

// Apply Inter as the default font for every <Text> once it's loaded.
// This is cheaper than wrapping each screen in a custom Text component.
function installDefaultFont() {
  const anyText = Text as any;
  anyText.defaultProps = anyText.defaultProps ?? {};
  anyText.defaultProps.style = [anyText.defaultProps.style, { fontFamily: 'Inter_500Medium' }];
}

function AppContent() {
  const { theme, colors } = useTheme();

  useEffect(() => {
    // Create Android notification channel on first launch
    setupNotificationChannel();
  }, []);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <RootNavigator />
      </View>
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
    Inter_700Bold,    Inter_800ExtraBold, Inter_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F4F8FE', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  installDefaultFont();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <ThemeProvider>
          <UserProvider>
            <FastsProvider>
              <AppContent />
            </FastsProvider>
          </UserProvider>
        </ThemeProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}

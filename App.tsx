import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from './src/store/LanguageContext';
import { ThemeProvider, useTheme } from './src/store/ThemeContext';
import { UserProvider } from './src/store/UserContext';
import { FastsProvider } from './src/store/FastsContext';
import { setupNotificationChannel } from './src/utils/notifications';
import RootNavigator from './src/navigation/RootNavigator';

function AppContent() {
  const { theme } = useTheme();

  useEffect(() => {
    // Create Android notification channel on first launch
    setupNotificationChannel();
  }, []);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
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

import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabs from './BottomTabs';
import OnboardingNavigator from './OnboardingNavigator';
import SplashScreen from '../screens/Onboarding/SplashScreen';
import { useUser } from '../store/UserContext';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import BookingScreen from '../screens/Booking/BookingScreen';
import PaywallScreen from '../screens/Paywall/PaywallScreen';
import FastDetailScreen from '../screens/History/FastDetailScreen';
import TipDetailScreen from '../screens/Tips/TipDetailScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { profile, isTrialExpired } = useUser();
  const navRef = useRef<NavigationContainerRef<any>>(null);

  // When onboardingComplete flips to false (e.g. dev reset), go back to Splash
  useEffect(() => {
    if (profile && !profile.onboardingComplete && navRef.current?.isReady()) {
      navRef.current.reset({ index: 0, routes: [{ name: 'Splash' }] });
    }
  }, [profile?.onboardingComplete]);

  // When trial expires, redirect to Paywall
  useEffect(() => {
    if (profile && profile.onboardingComplete && isTrialExpired && navRef.current?.isReady()) {
      navRef.current.reset({ index: 0, routes: [{ name: 'Paywall' }] });
    }
  }, [profile?.onboardingComplete, isTrialExpired]);

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"     component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        {/* Trial gate: Show paywall if trial expired, otherwise show main app */}
        {isTrialExpired ? (
          <Stack.Screen name="Paywall" component={PaywallScreen} />
        ) : (
          <Stack.Screen name="Main"       component={BottomTabs} />
        )}
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="FastDetail" component={FastDetailScreen} />
        <Stack.Screen name="TipDetail" component={TipDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

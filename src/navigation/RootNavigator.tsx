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

  // Remember the previous trial-gate state so we only reset the stack when
  // something actually changes. Otherwise this effect fires on the very first
  // profile load and slams the user straight to Main, killing the Splash
  // screen's entrance animation.
  const prevTrialRef = useRef<boolean | null>(null);

  // When onboarding flips back to incomplete (e.g. dev reset), return to Splash
  useEffect(() => {
    if (profile && !profile.onboardingComplete && navRef.current?.isReady()) {
      navRef.current.reset({ index: 0, routes: [{ name: 'Splash' }] });
    }
  }, [profile?.onboardingComplete]);

  // Keep the root-stack in sync with the trial/subscription gate, but ONLY on
  // transitions (trial expiring mid-session, or subscription unlocking the
  // app). The initial Splash → Main transition is handled by SplashScreen
  // itself so its animation has time to play.
  useEffect(() => {
    if (!profile?.onboardingComplete || !navRef.current?.isReady()) return;
    const prev = prevTrialRef.current;
    prevTrialRef.current = isTrialExpired;
    if (prev === null) return; // first observation — don't reset
    if (prev === isTrialExpired) return; // no transition
    const target = isTrialExpired ? 'Paywall' : 'Main';
    navRef.current.reset({ index: 0, routes: [{ name: target }] });
  }, [profile?.onboardingComplete, isTrialExpired]);

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"     component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        {/* Trial gate: show Paywall if the trial has expired and there's no active subscription */}
        {isTrialExpired ? (
          <Stack.Screen name="Paywall" component={PaywallScreen} />
        ) : (
          <Stack.Screen name="Main" component={BottomTabs} />
        )}
        <Stack.Screen name="Settings"   component={SettingsScreen} />
        <Stack.Screen name="Booking"    component={BookingScreen} />
        <Stack.Screen name="FastDetail" component={FastDetailScreen} />
        <Stack.Screen name="TipDetail"  component={TipDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

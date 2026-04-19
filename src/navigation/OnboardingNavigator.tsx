import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeSlides from '../screens/Onboarding/WelcomeSlides';
import ProfileSetupName from '../screens/Onboarding/ProfileSetupName';
import ProfileSetupBody from '../screens/Onboarding/ProfileSetupBody';
import ProfileSetupLifestyle from '../screens/Onboarding/ProfileSetupLifestyle';

const Stack = createStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="WelcomeSlides" component={WelcomeSlides} />
      <Stack.Screen name="ProfileSetupName" component={ProfileSetupName} />
      <Stack.Screen name="ProfileSetupBody" component={ProfileSetupBody} />
      <Stack.Screen name="ProfileSetupLifestyle" component={ProfileSetupLifestyle} />
    </Stack.Navigator>
  );
}

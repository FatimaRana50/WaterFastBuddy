import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../store/ThemeContext';
import { COLORS } from '../constants/theme';
import i18n from '../i18n';

// Screen placeholders — replace with real screens as they're built
import FastsScreen from '../screens/Fasts/FastsScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import TipsScreen from '../screens/Tips/TipsScreen';
import CaloriesScreen from '../screens/Calories/CaloriesScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    Fasts: 'water-outline',
    History: 'calendar-outline',
    Tips: 'library-outline',
    Calories: 'flash-outline',
    Profile: 'person-circle-outline',
  };

  const activeColors = [COLORS.primary, COLORS.accent] as const;

  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      {focused ? (
        <LinearGradient colors={activeColors} style={styles.iconGradient}>
          <Ionicons name={icons[name]} size={18} color="#fff" />
        </LinearGradient>
      ) : (
        <Ionicons name={icons[name]} size={20} color="#7D96B4" />
      )}
    </View>
  );
}

export default function BottomTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 14,
          height: 76,
          borderRadius: 28,
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          shadowColor: '#2D7DE3',
          shadowOpacity: 0.18,
          shadowRadius: 18,
          elevation: 12,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(255,255,255,0.98)', 'rgba(245,251,255,0.96)']}
            style={StyleSheet.absoluteFillObject}
          />
        ),
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
        tabBarItemStyle: { paddingTop: 4 },
      })}
    >
      <Tab.Screen name="Fasts" component={FastsScreen} options={{ title: i18n.t('tabs.fasts') }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: i18n.t('tabs.history') }} />
      <Tab.Screen name="Tips" component={TipsScreen} options={{ title: i18n.t('tabs.tips') }} />
      <Tab.Screen name="Calories" component={CaloriesScreen} options={{ title: i18n.t('tabs.calories') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: i18n.t('tabs.profile') }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(148, 173, 204, 0.22)',
    marginBottom: 2,
  },
  iconWrapActive: {
    borderColor: 'rgba(42,133,242,0.38)',
    shadowColor: '#2D7DE3',
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
  iconGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

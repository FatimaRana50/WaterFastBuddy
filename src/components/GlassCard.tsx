// Frosted glass card — translucent surface with a soft edge highlight.
// Used for hero panels sitting on top of the starfield / gradient backgrounds
// where a solid white/navy card would feel heavy.
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../store/ThemeContext';
import { BORDER_RADIUS, SPACING } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  radius?: number;
}

export default function GlassCard({ children, style, padding = SPACING.lg, radius = BORDER_RADIUS.xl }: Props) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  const tintA = isDark ? 'rgba(22,40,72,0.78)' : 'rgba(255,255,255,0.85)';
  const tintB = isDark ? 'rgba(22,40,72,0.55)' : 'rgba(255,255,255,0.62)';

  return (
    <View style={[styles.wrap, { borderRadius: radius, borderColor: colors.pillBorder }, style]}>
      <LinearGradient
        colors={[tintA, tintB]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
      />
      <View style={{ padding }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#0B5DD1',
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
});

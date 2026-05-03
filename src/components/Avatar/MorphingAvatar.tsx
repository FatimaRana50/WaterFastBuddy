/**
 * MorphingAvatar — crossfades the user's current body shape with their
 * goal body shape using two stacked WaterBodyAvatars. Opacity is animated
 * in antiphase so the SVG paths are NOT recomputed every frame.
 *
 * Migrated to react-native-reanimated v3.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, withDelay,
  Easing, interpolate,
} from 'react-native-reanimated';

import WaterBodyAvatar from './WaterBodyAvatar';
import { UserProfile } from '../../types';
import { COLORS, FONT_SIZE } from '../../constants/theme';

interface Props {
  profile: UserProfile;
  goalWeightKg: number;
  size?: number;
  nowLabel: string;
  goalLabel: string;
}

export default function MorphingAvatar({
  profile, goalWeightKg, size = 120, nowLabel, goalLabel,
}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.cubic) }),
        withDelay(900, withTiming(1, { duration: 1 })),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.cubic) }),
        withDelay(900, withTiming(0, { duration: 1 })),
      ),
      -1, false,
    );
  }, []);

  const nowStyle = useAnimatedStyle(() => ({
    opacity:   interpolate(t.value, [0, 1], [1, 0]),
    transform: [{ scale: interpolate(t.value, [0, 1], [1, 0.96]) }],
  }));
  const goalStyle = useAnimatedStyle(() => ({
    opacity:   t.value,
    transform: [{ scale: interpolate(t.value, [0, 1], [0.96, 1]) }],
  }));
  const nowLabelStyle  = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0, 1], [1, 0]) }));
  const goalLabelStyle = useAnimatedStyle(() => ({ opacity: t.value }));

  return (
    <View style={[styles.wrap, { height: size * 1.85 }]}>
      <Animated.View style={[styles.layer, nowStyle]}>
        <WaterBodyAvatar profile={profile} size={size} />
      </Animated.View>
      <Animated.View style={[styles.layer, goalStyle]}>
        <WaterBodyAvatar profile={{ ...profile, weightKg: goalWeightKg }} size={size} />
      </Animated.View>

      <View style={styles.labels} pointerEvents="none">
        <Animated.Text style={[styles.label, { color: COLORS.primary }, nowLabelStyle]}>
          {nowLabel}
        </Animated.Text>
        <Animated.Text style={[styles.label, { color: COLORS.success }, goalLabelStyle]}>
          {goalLabel}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:   { alignItems: 'center', justifyContent: 'center' },
  layer:  { position: 'absolute', top: 0, alignItems: 'center', justifyContent: 'center' },
  labels: { position: 'absolute', bottom: 0, alignItems: 'center', justifyContent: 'center' },
  label:  { position: 'absolute', fontSize: FONT_SIZE.sm, fontWeight: '800', letterSpacing: 0.5 },
});

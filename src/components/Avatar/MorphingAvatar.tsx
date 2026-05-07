/**
 * MorphingAvatar — animated transformation between current body and goal body.
 *
 * IMAGE-BASED VERSION: since each body shape is baked into a pre-rendered
 * 3D portrait, "morphing" is now a smooth crossfade between two
 * <WaterBodyAvatar /> instances — one driven by the current profile, the
 * other by a synthesised "goal profile" (same person at goalWeightKg).
 *
 * Public API preserved.
 *
 * Loop: 4s morph in → 2s hold → 4s morph out → 2s hold.
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSequence, withDelay, Easing, interpolate,
} from 'react-native-reanimated';

import WaterBodyAvatar from './WaterBodyAvatar';
import { UserProfile } from '../../types';
import { FONT_SIZE } from '../../constants/theme';

interface Props {
  profile: UserProfile;
  goalWeightKg: number;
  size?: number;
  nowLabel: string;
  goalLabel: string;
}

/* ── Shimmering particle between the two avatars ──────────────── */
function Sparkle({ delay, x, color }: { delay: number; x: number; color: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 0 }),
        ), -1, false,
      ),
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity:   interpolate(t.value, [0, 0.15, 0.85, 1], [0, 1, 1, 0]),
    transform: [
      { translateY: interpolate(t.value, [0, 1], [20, -60]) },
      { scale:       interpolate(t.value, [0, 0.5, 1], [0.4, 1, 0.6]) },
    ],
  }));
  return (
    <Animated.View style={[{
      position: 'absolute', left: x,
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: color,
      shadowColor: color, shadowOpacity: 1, shadowRadius: 6,
    }, style]} />
  );
}

export default function MorphingAvatar({
  profile, goalWeightKg, size = 140, nowLabel, goalLabel,
}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.cubic) }),
        withDelay(2000, withTiming(1, { duration: 1 })),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.cubic) }),
        withDelay(2000, withTiming(0, { duration: 1 })),
      ), -1, false,
    );
  }, []);

  // Synthesise the goal profile (same person, target weight). The
  // pre-rendered avatar art for each mood already encodes BMI variation,
  // so the visual delta between "now" and "goal" comes through naturally.
  const goalProfile: UserProfile = useMemo(
    () => ({ ...profile, weightKg: goalWeightKg }),
    [profile, goalWeightKg],
  );

  const nowOp  = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0, 1], [1, 0]) }));
  const goalOp = useAnimatedStyle(() => ({ opacity: t.value }));
  const nowLab = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0, 1], [1, 0]) }));
  const goalLab= useAnimatedStyle(() => ({ opacity: t.value }));

  const sparkles = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => ({
      x: (i - 3) * 9 + 60,
      color: i % 2 ? '#21C7FF' : '#FFFFFF',
      delay: i * 220,
    })),
    [],
  );

  return (
    <View style={[styles.wrap, { height: size * 1.95 }]}>
      {/* "Now" avatar — current body */}
      <Animated.View style={[styles.layer, nowOp]}>
        <WaterBodyAvatar profile={profile}     size={size} fillPct={0.55} />
      </Animated.View>

      {/* "Goal" avatar — target body, crossfades on top */}
      <Animated.View style={[styles.layer, goalOp]}>
        <WaterBodyAvatar profile={goalProfile} size={size} fillPct={0.85} />
      </Animated.View>

      {/* Sparkle trail floating up between the figures */}
      <View style={styles.sparkleField} pointerEvents="none">
        {sparkles.map((sp, i) => (
          <Sparkle key={i} x={sp.x} color={sp.color} delay={sp.delay} />
        ))}
      </View>

      {/* Labels */}
      <View style={styles.labels} pointerEvents="none">
        <Animated.Text style={[styles.label, { color: '#1B8CFF' }, nowLab]}>
          {nowLabel}
        </Animated.Text>
        <Animated.Text style={[styles.label, { color: '#10B981' }, goalLab]}>
          {goalLabel}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:   { alignItems: 'center', justifyContent: 'center' },
  layer:  { position: 'absolute', top: 0, alignItems: 'center', justifyContent: 'center' },
  sparkleField: {
    position: 'absolute', bottom: 30, width: 130, height: 80,
  },
  labels: { position: 'absolute', bottom: 0, alignItems: 'center', justifyContent: 'center' },
  label:  {
    position: 'absolute',
    fontSize: FONT_SIZE.sm, fontWeight: '900', letterSpacing: 0.6,
  },
});

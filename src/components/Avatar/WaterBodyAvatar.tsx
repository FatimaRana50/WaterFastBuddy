/**
 * WaterBodyAvatar — Premium full-body human companion for WaterFastBuddy.
 *
 * IMAGE-BASED VERSION: instead of drawing the character with SVG, we now
 * display a pre-rendered 3D PNG portrait selected from `assets/avatars/`
 * based on (gender, mood). Mood is derived from purity + fasting hours
 * exactly as before (calcPurity → calcMood), with fillPct nudging it.
 *
 * Public API (props) is preserved 1:1 so existing callers keep working:
 *   <WaterBodyAvatar profile fastingHours fillPct size animate />
 *
 * Animations preserved:
 *   - Soft floating bob, breathing scale
 *   - Distress shake
 *   - Pulsing colored aura behind the figure (matches mood)
 */

import React, { useEffect, useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence,
  Easing, interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { UserProfile } from '../../types';
import {
  calcPurity, calcMood, moodToFace,
  avatarImageFor,
  VW, VH,
  type MoodState,
} from './avatarUtils';

interface Props {
  profile: UserProfile;
  fastingHours?: number;
  fillPct?: number;
  size?: number;
  animate?: boolean;
}

export default function WaterBodyAvatar({
  profile, fastingHours = 0, fillPct = 0.5, size = 200, animate = true,
}: Props) {
  // ─── Mood derivation (same pipeline as before, with fill nudging) ────────
  const purity = useMemo(() => {
    const base = calcPurity(profile, fastingHours);
    return base * 0.6 + Math.max(0, Math.min(1, fillPct)) * 0.4;
  }, [profile, fastingHours, fillPct]);

  const mood: MoodState = useMemo(() => calcMood(purity, fastingHours), [purity, fastingHours]);
  const face = useMemo(() => moodToFace(mood), [mood]);
  const imgSrc = useMemo(() => avatarImageFor(profile.gender, mood), [profile.gender, mood]);

  // ─── Reanimated shared values ────────────────────────────────────────────
  const bob       = useSharedValue(0);
  const breathe   = useSharedValue(1);
  const shake     = useSharedValue(0);
  const auraPulse = useSharedValue(0);

  useEffect(() => {
    if (!animate) return;

    const bobAmp =
      mood === 'ecstatic'   ? -10 :
      mood === 'happy'      ? -4  :
      mood === 'sad'        ?  3  :
      mood === 'distressed' ?  4  : -1.5;
    const bobDur =
      mood === 'ecstatic'   ?  480 :
      mood === 'happy'      ? 1400 :
      mood === 'sad'        ? 2400 :
      mood === 'distressed' ? 2200 : 2800;

    bob.value = withRepeat(
      withSequence(
        withTiming(bobAmp, { duration: bobDur, easing: Easing.inOut(Easing.quad) }),
        withTiming(0,      { duration: bobDur, easing: Easing.inOut(Easing.quad) }),
      ), -1, false,
    );

    breathe.value = withRepeat(
      withSequence(
        withTiming(1.025, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0,   { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    );

    if (mood === 'distressed') {
      shake.value = withRepeat(
        withSequence(
          withTiming(-1.2, { duration: 90 }),
          withTiming( 1.2, { duration: 90 }),
        ), -1, true,
      );
    } else {
      shake.value = withTiming(0, { duration: 200 });
    }

    auraPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    );
  }, [animate, mood]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bob.value },
      { translateX: shake.value },
      { scale: breathe.value },
    ],
  }));

  const auraStyle = useAnimatedStyle(() => ({
    opacity:   interpolate(auraPulse.value, [0, 1], [0.25, 0.65]),
    transform: [{ scale: interpolate(auraPulse.value, [0, 1], [0.95, 1.08]) }],
  }));

  // Portrait ratio: height is 1.8× the width
  const aspectH    = size * (VH / VW);
  const ovalRadius = size * 0.46;

  // BMI-driven horizontal scale — avatar looks slimmer or fuller based on weight.
  // Range kept narrow (0.86–1.20) so it stays flattering, not distorted.
  const bmi = profile.weightKg / ((profile.heightCm / 100) ** 2);
  const bmiScaleX =
    bmi < 17   ? 0.86 :
    bmi < 20   ? 0.92 :
    bmi < 25   ? 1.00 :
    bmi < 30   ? 1.10 :
    bmi < 35   ? 1.16 : 1.20;

  return (
    <View style={[styles.wrap, { width: size, height: aspectH }]}>
      {/* Soft mood-coloured glow ring — pulsing oval, no hard edge */}
      <Animated.View
        style={[
          styles.aura,
          auraStyle,
          { width: size * 1.18, height: aspectH * 0.92, borderRadius: size * 0.55 },
        ]}
      >
        <LinearGradient
          colors={[face.auraColor + '44', face.auraColor + '00']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.5, y: 0.15 }} end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* 3D portrait clipped to a tall oval — hides rectangular PNG background.
          scaleX driven by BMI: slim avatars appear narrower, fuller ones wider. */}
      <Animated.View style={wrapStyle}>
        <View style={{
          width: size,
          height: aspectH,
          transform: [{ scaleX: bmiScaleX }],
          borderRadius: ovalRadius,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Slightly oversize so cover-fill pushes PNG edges past the clip boundary */}
          <Image
            source={imgSrc}
            style={{ width: size * 1.08, height: aspectH * 1.08 }}
            resizeMode="cover"
            accessibilityLabel={`${profile.gender} avatar — ${mood}`}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  aura: {
    position: 'absolute',
    alignSelf: 'center',
    top: '4%',
  },
});

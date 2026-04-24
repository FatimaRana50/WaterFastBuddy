// Crossfades between the user's current body shape and their goal body shape
// so the transformation feels alive rather than a static before/after.
// Implemented as two stacked WaterBodyAvatars whose opacities are animated in
// antiphase — this avoids re-rendering the SVG path every frame.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet } from 'react-native';
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

export default function MorphingAvatar({ profile, goalWeightKg, size = 120, nowLabel, goalLabel }: Props) {
  // 0 = fully showing current, 1 = fully showing goal
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        Animated.delay(900),
        Animated.timing(t, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        Animated.delay(900),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  const nowOpacity  = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const goalOpacity = t;
  const nowScale    = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });
  const goalScale   = t.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });

  return (
    <View style={[styles.wrap, { height: size * 1.7 }]}>
      <Animated.View style={[styles.layer, { opacity: nowOpacity, transform: [{ scale: nowScale }] }]}>
        <WaterBodyAvatar profile={profile} size={size} />
      </Animated.View>
      <Animated.View style={[styles.layer, { opacity: goalOpacity, transform: [{ scale: goalScale }] }]}>
        <WaterBodyAvatar profile={{ ...profile, weightKg: goalWeightKg }} size={size} />
      </Animated.View>

      <View style={styles.labels} pointerEvents="none">
        <Animated.Text style={[styles.label, { color: COLORS.primary, opacity: nowOpacity }]}>
          {nowLabel}
        </Animated.Text>
        <Animated.Text style={[styles.label, { color: COLORS.success, opacity: goalOpacity }]}>
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

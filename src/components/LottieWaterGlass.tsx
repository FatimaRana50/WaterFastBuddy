import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface LottieWaterGlassProps {
  fillPct: number; // 0 to 1
  size?: number;
  loop?: boolean;
}

/**
 * LottieWaterGlass — Animated water glass filling based on hydration percentage
 * The water continuously animates/moves in the glass, filling to the desired level
 */
export default function LottieWaterGlass({
  fillPct,
  size = 200,
  loop = true,
}: LottieWaterGlassProps) {
  // Clamp fillPct between 0 and 1
  const progress = useMemo(() => Math.max(0, Math.min(1, fillPct)), [fillPct]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LottieView
        source={require('../../assets/glass-water.json')}
        autoPlay={true}
        loop={loop}
        progress={progress}
        style={styles.animation}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

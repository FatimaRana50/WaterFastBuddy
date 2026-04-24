// Decorative animated particle field — mirrors the website's "blue dust"
// hero background. Uses plain Animated.Views so it works everywhere without
// pulling in Skia or a canvas. Stars drift slowly and twinkle.
//
// Usage: drop <Starfield /> as the first child inside a screen root.
// It pins to absoluteFillObject and renders beneath everything else.
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions } from 'react-native';
import { useTheme } from '../store/ThemeContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Star = {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  phase: number;
  driftRange: number;
  duration: number;
};

function seed(count: number, width: number, height: number): Star[] {
  const out: Star[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2.4,
      baseOpacity: 0.25 + Math.random() * 0.55,
      phase: Math.random(),
      driftRange: 10 + Math.random() * 30,
      duration: 2500 + Math.random() * 3500,
    });
  }
  return out;
}

interface Props {
  density?: number;      // roughly how many stars per 1000 px² — default 0.12
  fadeBottom?: boolean;  // when true, fades to transparent at the bottom
}

export default function Starfield({ density = 0.12, fadeBottom = true }: Props) {
  const { colors } = useTheme();
  const count = Math.floor((SCREEN_W * SCREEN_H) / 1000 * density);
  const stars = useMemo(() => seed(count, SCREEN_W, SCREEN_H), [count]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((s, i) => (
        <Twinkle key={i} star={s} color={colors.text} />
      ))}
      {fadeBottom && (
        <View
          pointerEvents="none"
          style={[
            styles.fade,
            { backgroundColor: colors.background },
          ]}
        />
      )}
    </View>
  );
}

function Twinkle({ star, color }: { star: Star; color: string }) {
  const opacity = useRef(new Animated.Value(star.baseOpacity * 0.4)).current;
  const drift   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopOpacity = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: star.baseOpacity,
          duration: star.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: star.baseOpacity * 0.25,
          duration: star.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const loopDrift = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: star.duration * 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: star.duration * 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loopOpacity.start();
    loopDrift.start();
    return () => {
      loopOpacity.stop();
      loopDrift.stop();
    };
  }, [opacity, drift, star.baseOpacity, star.duration]);

  const translateY = drift.interpolate({
    inputRange:  [0, 1],
    outputRange: [-star.driftRange / 2, star.driftRange / 2],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: star.x,
        top:  star.y,
        width:  star.size,
        height: star.size,
        borderRadius: star.size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  fade: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 120,
    opacity: 0.4,
  },
});

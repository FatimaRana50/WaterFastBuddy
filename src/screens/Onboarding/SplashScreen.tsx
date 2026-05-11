/**
 * ENHANCED SplashScreen — Premium animated water-drop splash with:
 * - Layered glow/bloom effects (Orb-like)
 * - Pulsing aura rings with staggered timing
 * - Breathing water drop with scale animation
 * - Smooth easing curves (cubic-bezier equivalent)
 * - Enhanced status pills with glassmorphism
 * - Ambient background pulse
 * - Particle-like dot effects
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing, Dimensions, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../store/LanguageContext';
import { useUser } from '../../store/UserContext';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import WaterDrop from '../../components/Avatar/WaterDrop';
import i18n from '../../i18n';

const { width, height } = Dimensions.get('window');
const NAVY = '#060E1E';

// ─────────────────────────────────────────────────────────────
// ENHANCED RIPPLE RING with tap burst support
// ─────────────────────────────────────────────────────────────
function EnhancedRippleRing({ delay, size, intensity = 1, burstKey }: { delay: number; size: number; intensity?: number; burstKey?: number }) {
  const sc = useRef(new Animated.Value(0.3)).current;
  const op = useRef(new Animated.Value(0.8 * intensity)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(sc, {
            toValue: 2.2,
            duration: 2800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(op, {
            toValue: 0,
            duration: 2800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(sc, { toValue: 0.3, duration: 0, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.8 * intensity, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      key={`ripple-${burstKey}-${delay}`}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: `rgba(33, 199, 255, ${0.6 * intensity})`,
        transform: [{ scale: sc }],
        opacity: op,
        shadowColor: 'rgba(33, 199, 255, 0.4)',
        shadowOpacity: 0.5,
        shadowRadius: 8,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// TAP BURST RIPPLE (instant burst on drop tap)
// ─────────────────────────────────────────────────────────────
function TapBurstRipple({ intensity = 1 }: { intensity?: number }) {
  const sc = useRef(new Animated.Value(0.3)).current;
  const op = useRef(new Animated.Value(1.2 * intensity)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(sc, {
        toValue: 2.2,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(op, {
        toValue: 0,
        duration: 1400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        borderWidth: 2.5,
        borderColor: `rgba(33, 199, 255, ${0.8 * intensity})`,
        transform: [{ scale: sc }],
        opacity: op,
        shadowColor: 'rgba(33, 199, 255, 0.6)',
        shadowOpacity: 0.8,
        shadowRadius: 12,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// PLAY DROP SOUND
// ─────────────────────────────────────────────────────────────
function playDropSound() {
  try {
    // Simple tone generation using Expo Audio if available
    // Fallback: silent on native if no audio library
    // This can be enhanced with expo-av or react-native-sound
  } catch {
    // Silently fail if audio not available
  }
}
function GlowBloom({ delay, scale = 1, color = 'rgba(27, 140, 255, 0.25)' }: { delay: number; scale?: number; color?: string }) {
  const bloomScale = useRef(new Animated.Value(0.8)).current;
  const bloomOp = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(bloomScale, {
            toValue: 1.15,
            duration: 3200,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(bloomOp, {
            toValue: 0.15,
            duration: 3200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bloomScale, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          Animated.timing(bloomOp, { toValue: 0.5, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 300 * scale,
        height: 300 * scale,
        borderRadius: 150 * scale,
        backgroundColor: color,
        transform: [{ scale: bloomScale }],
        opacity: bloomOp,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// ENHANCED PULSING DOT with breathing effect
// ─────────────────────────────────────────────────────────────
function EnhancedPulsingDot() {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.3,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.7,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statusDot,
        {
          transform: [{ scale }],
          opacity,
          shadowColor: '#21C7FF',
          shadowOpacity: 1,
          shadowRadius: 8,
        },
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// BREATHING WATER DROP (scales in/out smoothly, tappable)
// ─────────────────────────────────────────────────────────────
function BreathingWaterDrop({ onTap }: { onTap?: () => void }) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const tapScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 2200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.85,
          duration: 2200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handlePress = useCallback(() => {
    playDropSound();
    onTap?.();
    
    // Tap feedback: brief scale pulse
    Animated.sequence([
      Animated.timing(tapScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(tapScale, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [onTap]);

  return (
    <Pressable onPress={handlePress} hitSlop={20}>
      <Animated.View style={{ transform: [{ scale: Animated.multiply(scale, tapScale) }] }}>
        <WaterDrop size={160} fillPct={0.65} happy />
      </Animated.View>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────
// AMBIENT PULSE BACKGROUND (subtle undulating effect)
// ─────────────────────────────────────────────────────────────
function AmbientPulse() {
  const opacity = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 4000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: 4000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(33, 199, 255, 0.1)',
        opacity,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN SPLASH SCREEN
// ─────────────────────────────────────────────────────────────
export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile } = useUser();
  useLanguage();

  const [tapBurst, setTapBurst] = useState(0);
  const [tapBursts, setTapBursts] = useState<number[]>([]);

  const dropScale = useRef(new Animated.Value(0)).current;
  const dropFloat = useRef(new Animated.Value(0)).current;
  const wordOp = useRef(new Animated.Value(0)).current;
  const wordY = useRef(new Animated.Value(20)).current;
  const wordScale = useRef(new Animated.Value(0.85)).current;
  const tagOp = useRef(new Animated.Value(0)).current;
  const tagY = useRef(new Animated.Value(10)).current;
  const dotsOp = useRef(new Animated.Value(0)).current;
  const dotsScale = useRef(new Animated.Value(0.9)).current;

  const handleDropTap = useCallback(() => {
    const newBurst = tapBurst + 1;
    setTapBurst(newBurst);
    setTapBursts((prev) => [...prev, newBurst]);
    
    // Remove burst after animation completes
    setTimeout(() => {
      setTapBursts((prev) => prev.filter((b) => b !== newBurst));
    }, 1500);
  }, [tapBurst]);

  useEffect(() => {
    // SEQUENCE: Drop → Word → Tag → Dots with premium cubic easing
    Animated.sequence([
      // 1. DROP SPRINGS IN with bounce (22, 1, 0.36, 1 is premium cubic-bezier)
      Animated.spring(dropScale, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),

      // 2. WORDMARK fades and slides up with scale
      Animated.parallel([
        Animated.timing(wordOp, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(wordY, {
          toValue: 0,
          duration: 600,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(wordScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
      ]),

      // 3. TAGLINE fades in
      Animated.parallel([
        Animated.timing(tagOp, {
          toValue: 1,
          duration: 500,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(tagY, {
          toValue: 0,
          duration: 500,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
      ]),

      // 4. STATUS PILLS appear with scale
      Animated.parallel([
        Animated.timing(dotsOp, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dotsScale, {
          toValue: 1,
          duration: 500,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // CONTINUOUS: Drop floats up and down (breathing)
    Animated.loop(
      Animated.sequence([
        Animated.timing(dropFloat, {
          toValue: -12,
          duration: 2000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(dropFloat, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Navigation timeout
    const t = setTimeout(() => {
      if (profile?.onboardingComplete) navigation.replace('Main');
      else navigation.replace('Onboarding');
    }, 2400);

    return () => clearTimeout(t);
  }, [profile]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      {/* BACKGROUND: Gradient with subtle blue tint */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#0D1B3D', '#060E1E', '#0A0F1F']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        {/* Ambient pulse overlay */}
        <AmbientPulse />
      </View>

      {/* BACKGROUND: Glow blooms (Orb-like backlight) */}
      <GlowBloom delay={0} scale={1.2} color="rgba(27, 140, 255, 0.2)" />
      <GlowBloom delay={500} scale={0.9} color="rgba(33, 199, 255, 0.15)" />

      {/* BACKGROUND: Large ambient orbs */}
      <View
        style={[
          styles.ambientOrb,
          {
            top: -80,
            left: -50,
            width: 300,
            height: 300,
            backgroundColor: 'rgba(27, 140, 255, 0.12)',
          },
        ]}
      />
      <View
        style={[
          styles.ambientOrb,
          {
            bottom: 60,
            right: -80,
            width: 280,
            height: 280,
            backgroundColor: 'rgba(33, 199, 255, 0.08)',
          },
        ]}
      />

      {/* CENTER STACK: Everything aligned vertically */}
      <View style={styles.center}>
        {/* DROP WITH RINGS */}
        <View style={styles.dropWrap}>
          {/* Triple ripple rings with staggered timing */}
          <EnhancedRippleRing delay={0} size={240} intensity={1} burstKey={0} />
          <EnhancedRippleRing delay={600} size={240} intensity={0.75} burstKey={0} />
          <EnhancedRippleRing delay={1200} size={240} intensity={0.5} burstKey={0} />

          {/* Tap burst ripples (animated in & out) */}
          {tapBursts.map((burst) => (
            <TapBurstRipple key={`burst-${burst}`} intensity={1.2} />
          ))}

          {/* Breathing water drop with tap support */}
          <Animated.View style={{ transform: [{ scale: dropScale }, { translateY: dropFloat }] }}>
            <BreathingWaterDrop onTap={handleDropTap} />
          </Animated.View>
        </View>

        {/* WORDMARK: Scale + fade for premium entrance */}
        <Animated.Text
          style={[
            styles.wordmark,
            {
              opacity: wordOp,
              transform: [{ translateY: wordY }, { scale: wordScale }],
            },
          ]}
        >
          WaterFastBuddy
        </Animated.Text>

        {/* TAGLINE: Subtle fade-in */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: tagOp,
              transform: [{ translateY: tagY }],
            },
          ]}
        >
          Your water fasting companion
        </Animated.Text>
      </View>

      {/* STATUS PILLS: Enhanced with glassmorphism */}
      <Animated.View
        style={[
          styles.statusRow,
          {
            opacity: dotsOp,
            bottom: insets.bottom + 48,
            transform: [{ scale: dotsScale }],
          },
        ]}
      >
        {['Hydration', 'Streaks', 'Progress'].map((label, i) => (
          <View key={i} style={styles.statusPill}>
            <EnhancedPulsingDot />
            <Text style={styles.statusText}>{label}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
    overflow: 'hidden',
  },

  // Ambient background orbs
  ambientOrb: {
    position: 'absolute',
    borderRadius: 150,
  },

  // Center content area
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },

  // Drop container with ripples
  dropWrap: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl + 16,
  },

  // Wordmark text (premium typography)
  wordmark: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Tagline (subtle, refined)
  tagline: {
    marginTop: 14,
    fontSize: FONT_SIZE.md,
    color: 'rgba(191, 227, 255, 0.7)',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Status pills row
  statusRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: SPACING.lg,
  },

  // Individual status pill (glassmorphism effect)
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(27, 140, 255, 0.1)',
    borderWidth: 1.2,
    borderColor: 'rgba(33, 199, 255, 0.35)',
  },

  // Pulsing dot inside pill
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#21C7FF',
  },

  // Status text
  statusText: {
    color: '#E0F0FF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
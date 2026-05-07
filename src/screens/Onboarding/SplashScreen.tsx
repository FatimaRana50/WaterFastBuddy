/**
 * SplashScreen — first screen on app open.
 * Dark navy background, animated water-drop logo, wordmark fade-in,
 * tagline + 3 pulsing status pills.
 *
 * Required image assets: none.
 */

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing, Dimensions,
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

function RippleRing({ delay, size }: { delay: number; size: number }) {
  const sc = useRef(new Animated.Value(0.4)).current;
  const op = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(sc, { toValue: 1.9, duration: 2400, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0,   duration: 2400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(sc, { toValue: 0.4, duration: 0, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size, height: size, borderRadius: size / 2,
        borderWidth: 1.5, borderColor: 'rgba(33,199,255,0.45)',
        transform: [{ scale: sc }], opacity: op,
      }}
    />
  );
}

function PulsingDot() {
  const a = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return <Animated.View style={[styles.statusDot, { opacity: a }]} />;
}

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile } = useUser();
  useLanguage();

  const dropScale  = useRef(new Animated.Value(0)).current;
  const dropFloat  = useRef(new Animated.Value(0)).current;
  const wordOp     = useRef(new Animated.Value(0)).current;
  const wordY      = useRef(new Animated.Value(14)).current;
  const tagOp      = useRef(new Animated.Value(0)).current;
  const dotsOp     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(dropScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(wordOp, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(wordY,  { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(tagOp,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(dotsOp, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dropFloat, { toValue: -8, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(dropFloat, { toValue:  0, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();

    const t = setTimeout(() => {
      if (profile?.onboardingComplete) navigation.replace('Main');
      else navigation.replace('Onboarding');
    }, 2200);
    return () => clearTimeout(t);
  }, [profile]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      {/* Deep navy with very subtle blue radial glow at top */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#0A1736', NAVY, NAVY]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
        />
      </View>

      {/* Ambient orbs */}
      <View style={[styles.orb, { top: -60, left: -40, backgroundColor: 'rgba(27,140,255,0.18)' }]} />
      <View style={[styles.orb, { bottom: 80, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(33,199,255,0.10)' }]} />

      {/* Centre stack */}
      <View style={styles.center}>
        <View style={styles.dropWrap}>
          <RippleRing delay={0}    size={210} />
          <RippleRing delay={700}  size={210} />
          <RippleRing delay={1400} size={210} />

          <Animated.View style={{ transform: [{ scale: dropScale }, { translateY: dropFloat }] }}>
            <WaterDrop size={160} fillPct={0.65} happy />
          </Animated.View>
        </View>

        <Animated.Text
          style={[styles.wordmark, { opacity: wordOp, transform: [{ translateY: wordY }] }]}
        >
          WaterFastBuddy
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: tagOp }]}>
          Your water fasting companion
        </Animated.Text>
      </View>

      {/* Status pills */}
      <Animated.View style={[styles.statusRow, { opacity: dotsOp, bottom: insets.bottom + 48 }]}>
        {['Hydration', 'Streaks', 'Progress'].map((label, i) => (
          <View key={i} style={styles.statusPill}>
            <PulsingDot />
            <Text style={styles.statusText}>{label}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  orb: {
    position: 'absolute',
    width: 260, height: 260, borderRadius: 130,
  },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  dropWrap: {
    width: 240, height: 240,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  wordmark: {
    fontSize: 30, fontWeight: '900',
    color: '#FFFFFF', letterSpacing: 0.4,
  },
  tagline: {
    marginTop: 10,
    fontSize: FONT_SIZE.md,
    color: 'rgba(191,227,255,0.75)',
    letterSpacing: 0.3,
  },
  statusRow: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center',
    gap: 10,
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(27,140,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(33,199,255,0.25)',
  },
  statusDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#21C7FF',
    shadowColor: '#21C7FF', shadowOpacity: 0.9, shadowRadius: 6,
  },
  statusText: { color: '#E0F0FF', fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
});
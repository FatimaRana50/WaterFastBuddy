import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../store/LanguageContext';
import { useUser } from '../../store/UserContext';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import i18n from '../../i18n';

const { width, height } = Dimensions.get('window');

// Water ripple ring component — expands outward and fades
function RippleRing({ delay, size }: { delay: number; size: number }) {
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.8, duration: 2200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 2200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 0.4, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size, height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

// Water drop avatar — bobs up and down gently
function WaterAvatar({ gender }: { gender?: 'male' | 'female' }) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -12, duration: 900, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0,   duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY: bob }], alignItems: 'center' }}>
      <Text style={{ fontSize: 90 }}>{gender === 'female' ? '👩' : '🧑'}</Text>
    </Animated.View>
  );
}

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useUser();
  useLanguage();

  // Animation values
  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const avatarOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance sequence
    Animated.sequence([
      // Logo pops in
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      // Greeting fades in
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      // Avatar fades in
      Animated.timing(avatarOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      // Hold for 1 second
      Animated.delay(900),
    ]).start(() => {
      // Navigate once animation is done
      if (profile?.onboardingComplete) {
        navigation.replace('Main');
      } else {
        navigation.replace('Onboarding');
      }
    });
  }, [profile]);

  const onboardingDone = profile?.onboardingComplete === true;

  return (
    <LinearGradient
      colors={[COLORS.primaryDark, COLORS.primary, COLORS.gradientEnd]}
      style={styles.container}
      start={{ x: 0.12, y: 0 }}
      end={{ x: 0.9, y: 1 }}
    >
      <View style={styles.orbLarge} />
      <View style={styles.orbSmall} />

      {/* Ripple rings behind everything */}
      <View style={styles.rippleContainer}>
        <RippleRing delay={0}    size={180} />
        <RippleRing delay={600}  size={180} />
        <RippleRing delay={1200} size={180} />
      </View>

      <Animated.View style={[styles.panel, { opacity: textOpacity }]}> 
        <Animated.View
          style={[styles.logoWrapper, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoMono}>WF</Text>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: logoOpacity, alignItems: 'center' }}>
          <Text style={styles.brandName}>WaterFastBuddy</Text>
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity, alignItems: 'center', marginTop: SPACING.md }}>
          {onboardingDone ? (
            <Text style={styles.greeting}>{i18n.t('splash.greeting', { name: profile!.name })}</Text>
          ) : (
            <Text style={styles.tagline}>{i18n.t('splash.tagline')}</Text>
          )}
          <Text style={styles.subline}>{i18n.t('splash.subline')}</Text>
        </Animated.View>

        <View style={styles.statusRow}>
          <View style={styles.statusPill}><Text style={styles.statusText}>{i18n.t('splash.statusHydration')}</Text></View>
          <View style={styles.statusPill}><Text style={styles.statusText}>{i18n.t('splash.statusStreaks')}</Text></View>
          <View style={styles.statusPill}><Text style={styles.statusText}>{i18n.t('splash.statusProgress')}</Text></View>
        </View>

        {onboardingDone && (
          <Animated.View style={[styles.avatarWrapper, { opacity: avatarOpacity }]}> 
            <WaterAvatar gender={profile?.gender} />
          </Animated.View>
        )}

        {!onboardingDone && (
          <Animated.View style={[styles.loadingDots, { opacity: textOpacity }]}> 
            {[0, 1, 2].map((i) => (
              <LoadingDot key={i} delay={i * 200} />
            ))}
          </Animated.View>
        )}
      </Animated.View>
    </LinearGradient>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1,   duration: 400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.loadingDot, { opacity: anim }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  orbLarge: {
    position: 'absolute',
    top: 90,
    left: -40,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orbSmall: {
    position: 'absolute',
    bottom: 120,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  rippleContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 180, height: 180,
  },

  avatarWrapper: {
    marginBottom: SPACING.lg,
  },

  panel: {
    width: '100%',
    maxWidth: 420,
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
  },

  logoWrapper: {
    marginBottom: SPACING.md,
  },
  logoCircle: {
    width: 92, height: 92,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoMono: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1.5 },

  brandName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: FONT_SIZE.xl,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  tagline: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 0.3,
  },
  subline: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.68)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  statusText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },

  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.sm,
  },
  loadingDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});

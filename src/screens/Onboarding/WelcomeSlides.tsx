/**
 * WelcomeSlides — premium 4-slide onboarding.
 * Slide 1: human silhouette + water-droplet motif transformation.
 * Slide 2: timeline/clock with fasting stage milestones (0h/8h/16h/24h).
 * Slide 3: trophy + confetti celebration.
 * Slide 4: warm coach card, star rating, "Free to book" chip.
 *
 * Required image assets (already in repo):
 *   assets/avatars/d1.jpg   (used as the friendly coach photo on slide 4)
 * No new image assets required — all illustrations are vector / RN primitives.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing,
  Dimensions, Image, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import { useLanguage } from '../../store/LanguageContext';
import i18n from '../../i18n';

const { width, height } = Dimensions.get('window');

const BLUE       = '#1B8CFF';
const CYAN       = '#21C7FF';
const NAVY       = '#0B5DD1';
const NAVY_DEEP  = '#082C6B';

/* ─── Floating particles overlay (whole screen) ──────────────────── */
function Particle({ x, size, color, delay }: { x: number; size: number; color: string; delay: number }) {
  const y  = useRef(new Animated.Value(height * 0.6)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y,  { toValue: height * 0.05, duration: 4200, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.7, duration: 700,  useNativeDriver: true }),
            Animated.timing(op, { toValue: 0,   duration: 3500, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(y,  { toValue: height * 0.6, duration: 0, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0,            duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: x,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, opacity: op,
        transform: [{ translateY: y }],
      }}
    />
  );
}

/* ─── SLIDE 1: human silhouette + droplet ────────────────────────── */
function Slide1() {
  const float = useRef(new Animated.Value(0)).current;
  const drop  = useRef(new Animated.Value(0)).current;
  const ring  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -8, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue:  0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(drop, { toValue: 1, duration: 1600, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(drop, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(600),
      ]),
    ).start();
    Animated.loop(
      Animated.timing(ring, { toValue: 1, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ).start();
  }, []);

  const dropY     = drop.interpolate({ inputRange: [0, 1], outputRange: [-60, 90] });
  const dropOp    = drop.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] });
  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.6] });
  const ringOp    = ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <View style={s.illustration}>
      <Animated.View style={{
        position: 'absolute', top: 100,
        width: 230, height: 230, borderRadius: 115,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
        transform: [{ scale: ringScale }], opacity: ringOp,
      }} />

      <Animated.View style={{ transform: [{ translateY: float }] }}>
        <Svg width={180} height={300} viewBox="0 0 180 300">
          <Defs>
            <SvgGrad id="silh" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#BFE3FF" stopOpacity="0.85" />
            </SvgGrad>
          </Defs>
          {/* Head */}
          <Circle cx={90} cy={36} r={26} fill="url(#silh)" />
          {/* Body */}
          <Path
            d="M 64 70
               Q 50 78 46 110
               L 42 170
               Q 40 200 56 200
               L 60 270 Q 60 290 76 290
               L 86 290 Q 90 250 90 220
               Q 90 250 94 290
               L 104 290 Q 120 290 120 270
               L 124 200 Q 140 200 138 170
               L 134 110 Q 130 78 116 70 Z"
            fill="url(#silh)"
          />
        </Svg>
      </Animated.View>

      {/* Falling droplet onto the figure */}
      <Animated.View style={{
        position: 'absolute', top: 30,
        opacity: dropOp, transform: [{ translateY: dropY }],
      }}>
        <Svg width={28} height={36} viewBox="0 0 28 36">
          <Path
            d="M 14 2 C 18 12, 26 18, 26 26 C 26 32, 20 34, 14 34 C 8 34, 2 32, 2 26 C 2 18, 10 12, 14 2 Z"
            fill={CYAN}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

/* ─── SLIDE 2: clock with fasting stages ─────────────────────────── */
function Slide2() {
  const sweep = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(sweep, { toValue: 1, duration: 4500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const rot = sweep.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '270deg'] });
  const dotScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });

  const stages = [
    { h: '0h',  label: 'Start',    angle: -90,  color: '#7DD3FC' },
    { h: '8h',  label: 'Glycogen', angle: 0,    color: '#60A5FA' },
    { h: '16h', label: 'Fat burn', angle: 90,   color: '#34D399' },
    { h: '24h', label: 'Autophagy',angle: 180,  color: '#F472B6' },
  ];
  const R = 110;

  return (
    <View style={s.illustration}>
      <View style={{ width: 260, height: 260, alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer ring */}
        <View style={{
          position: 'absolute', width: 240, height: 240, borderRadius: 120,
          borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)', borderStyle: 'dashed',
        }} />

        {/* Sweep hand */}
        <Animated.View style={{
          position: 'absolute', width: 240, height: 240,
          alignItems: 'flex-end', justifyContent: 'center',
          transform: [{ rotate: rot }],
        }}>
          <View style={{
            width: 110, height: 3, borderRadius: 2, backgroundColor: CYAN,
            shadowColor: CYAN, shadowOpacity: 1, shadowRadius: 6,
          }} />
        </Animated.View>

        {/* Stage markers */}
        {stages.map((st) => {
          const rad = (st.angle * Math.PI) / 180;
          const x = Math.cos(rad) * R;
          const y = Math.sin(rad) * R;
          return (
            <Animated.View
              key={st.h}
              style={{
                position: 'absolute',
                transform: [{ translateX: x }, { translateY: y }, { scale: dotScale }],
                alignItems: 'center',
              }}
            >
              <View style={{
                width: 14, height: 14, borderRadius: 7,
                backgroundColor: st.color, borderWidth: 2, borderColor: '#FFFFFF',
                shadowColor: st.color, shadowOpacity: 0.9, shadowRadius: 8,
              }} />
            </Animated.View>
          );
        })}

        {/* Centre */}
        <View style={{
          width: 120, height: 120, borderRadius: 60,
          backgroundColor: 'rgba(255,255,255,0.10)',
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 }}>16:00</Text>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2, letterSpacing: 1 }}>FASTING</Text>
        </View>
      </View>

      {/* Stage labels */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: SPACING.lg, flexWrap: 'wrap', justifyContent: 'center' }}>
        {stages.map((st) => (
          <View key={st.h} style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            paddingHorizontal: 10, paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.10)',
            borderWidth: 1, borderColor: st.color + '60',
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: st.color }} />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>{st.h} · {st.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ─── SLIDE 3: trophy + confetti ─────────────────────────────────── */
function Confetti({ x, color, delay, rotate }: { x: number; color: string; delay: number; rotate: string }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 2600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(800),
      ]),
    ).start();
  }, []);
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [-20, 220] });
  const op = t.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] });
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: 30,
      width: 8, height: 12, borderRadius: 2,
      backgroundColor: color, opacity: op,
      transform: [{ translateY: ty }, { rotate }],
    }} />
  );
}

function Slide3() {
  const bounce = useRef(new Animated.Value(0)).current;
  const glow   = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -10, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounce, { toValue:  0,  duration: 700, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const glowOp    = glow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  const colors = [CYAN, '#FDE047', '#34D399', '#F472B6', '#FFFFFF', BLUE];

  return (
    <View style={s.illustration}>
      {/* Confetti */}
      {Array.from({ length: 14 }).map((_, i) => (
        <Confetti
          key={i}
          x={20 + i * 22}
          color={colors[i % colors.length]}
          delay={i * 180}
          rotate={`${(i * 37) % 360}deg`}
        />
      ))}

      {/* Glow */}
      <Animated.View style={{
        position: 'absolute',
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(253,224,71,0.28)',
        opacity: glowOp, transform: [{ scale: glowScale }],
      }} />

      {/* Trophy */}
      <Animated.View style={{ transform: [{ translateY: bounce }], alignItems: 'center' }}>
        <View style={{
          width: 130, height: 130, borderRadius: 28,
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="trophy" size={78} color="#FDE047" />
        </View>

        <View style={{
          marginTop: SPACING.lg,
          paddingHorizontal: 18, paddingVertical: 10,
          borderRadius: 999,
          backgroundColor: 'rgba(253,224,71,0.18)',
          borderWidth: 1, borderColor: 'rgba(253,224,71,0.55)',
          flexDirection: 'row', alignItems: 'center', gap: 8,
        }}>
          <Ionicons name="flame" size={16} color="#FDE047" />
          <Text style={{ color: '#FDE047', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 }}>
            7-DAY STREAK
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

/* ─── SLIDE 4: coach card ────────────────────────────────────────── */
function Slide4() {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -6, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue:  0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  let coachImg: any = null;
  try { coachImg = require('../../../assets/avatars/d1.jpg'); } catch {}

  return (
    <View style={s.illustration}>
      <Animated.View style={{
        transform: [{ translateY: float }],
        width: width - SPACING.xl * 2,
        maxWidth: 360,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: 28,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
        padding: SPACING.lg,
        alignItems: 'center',
      }}>
        {/* Avatar with online dot */}
        <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
          <View style={{
            width: 110, height: 110, borderRadius: 55,
            borderWidth: 3, borderColor: '#FFFFFF',
            backgroundColor: 'rgba(255,255,255,0.15)',
            overflow: 'hidden',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {coachImg
              ? <Image source={coachImg} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              : <Ionicons name="person" size={56} color="#FFFFFF" />}
          </View>
          <View style={{
            position: 'absolute', bottom: 4, right: 4,
            width: 18, height: 18, borderRadius: 9,
            backgroundColor: '#10B981', borderWidth: 2.5, borderColor: '#FFFFFF',
          }} />
        </View>

        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900' }}>Coach Krish</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2, fontWeight: '600' }}>
          Certified fasting coach · 6 yrs
        </Text>

        {/* Stars */}
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 10 }}>
          {[1,2,3,4,5].map(i => (
            <Ionicons key={i} name="star" size={16} color="#FDE047" />
          ))}
          <Text style={{ color: '#FFFFFF', fontWeight: '800', marginLeft: 6, fontSize: 13 }}>4.9</Text>
        </View>

        {/* Free to book chip */}
        <View style={{
          marginTop: SPACING.md,
          flexDirection: 'row', alignItems: 'center', gap: 6,
          paddingHorizontal: 14, paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: 'rgba(16,185,129,0.18)',
          borderWidth: 1, borderColor: 'rgba(16,185,129,0.55)',
        }}>
          <Ionicons name="checkmark-circle" size={14} color="#34D399" />
          <Text style={{ color: '#A7F3D0', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 }}>
            FREE TO BOOK
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function WelcomeSlides() {
  useLanguage();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const slides = [
    {
      key: '1',
      gradient: [NAVY_DEEP, NAVY, BLUE] as [string, string, string],
      headline: 'The fast that\nchanges things',
      body: 'A simple, guided water fast — built around your body, not someone else\'s rules.',
      Illustration: Slide1,
    },
    {
      key: '2',
      gradient: ['#062456', NAVY, '#1672D8'] as [string, string, string],
      headline: 'Know what your\nbody is doing',
      body: 'See live fasting stages — from glycogen to fat burn to autophagy — as they happen.',
      Illustration: Slide2,
    },
    {
      key: '3',
      gradient: ['#082C6B', '#0F5BCB', BLUE] as [string, string, string],
      headline: 'Earn it.\nOwn it.',
      body: 'Streaks, badges, and milestones that actually mean something. Real progress, not vanity.',
      Illustration: Slide3,
    },
    {
      key: '4',
      gradient: [NAVY_DEEP, NAVY, '#0D9488'] as [string, string, string],
      headline: 'Stuck? Talk to\na real human.',
      body: 'Book a free 1-on-1 with a certified fasting coach — no bots, no scripts.',
      Illustration: Slide4,
    },
  ];

  const [active, setActive] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const fade    = useRef(new Animated.Value(1)).current;

  const goTo = (i: number) => {
    Animated.timing(fade, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      flatRef.current?.scrollToIndex({ index: i, animated: false });
      setActive(i);
      Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    });
  };

  const onNext = () => {
    if (active === slides.length - 1) navigation.navigate('ProfileSetupName');
    else goTo(active + 1);
  };

  const slide = slides[active];
  const { Illustration } = slide;

  return (
    <View style={s.screen}>
      <LinearGradient colors={slide.gradient} style={StyleSheet.absoluteFill} />

      {/* Floating particles */}
      {[0.08, 0.22, 0.38, 0.55, 0.72, 0.88].map((x, i) => (
        <Particle key={i} x={width * x} size={6 + (i % 3) * 5}
                  color="rgba(255,255,255,0.18)" delay={i * 600} />
      ))}

      <FlatList
        ref={flatRef}
        data={slides}
        keyExtractor={(it) => it.key}
        horizontal pagingEnabled scrollEnabled={false}
        style={{ height: 0, position: 'absolute' }}
        renderItem={() => null}
      />

      {/* Top half: illustration */}
      <Animated.View style={[s.top, { paddingTop: insets.top + 16, opacity: fade }]}>
        <Illustration />
      </Animated.View>

      {/* Bottom frosted sheet */}
      <View style={[s.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <View style={s.sheetGlass} />
        <Animated.View style={{ opacity: fade }}>
          <Text style={s.headline}>{slide.headline}</Text>
          <Text style={s.body}>{slide.body}</Text>
        </Animated.View>

        <View style={s.dotsRow}>
          {slides.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)} hitSlop={8}>
              <View style={[s.dot, i === active && s.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={onNext} activeOpacity={0.85} style={s.cta}>
          <LinearGradient
            colors={[CYAN, BLUE]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.ctaGrad}
          >
            <Text style={s.ctaText}>{active === slides.length - 1 ? 'Get started' : 'Next'}</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {active < slides.length - 1 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileSetupName')}
            style={{ alignSelf: 'center', paddingVertical: 8, marginTop: 6 }}
          >
            <Text style={s.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  top: {
    flex: 1,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  illustration: {
    width: '100%',
    minHeight: height * 0.42,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  sheet: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  sheetGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,30,80,0.35)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  headline: {
    fontSize: 32, fontWeight: '900',
    color: '#FFFFFF', lineHeight: 38,
    marginBottom: SPACING.sm,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 28, borderRadius: 4, backgroundColor: '#FFFFFF',
  },
  cta: { borderRadius: 999, overflow: 'hidden' },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, gap: 10,
  },
  ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },
  skip: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
});
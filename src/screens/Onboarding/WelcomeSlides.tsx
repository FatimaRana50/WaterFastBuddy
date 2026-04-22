import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import WaterDrop from '../../components/Avatar/WaterDrop';
import { useLanguage } from '../../store/LanguageContext';
import i18n from '../../i18n';

const { width, height } = Dimensions.get('window');

// ─── Floating particle ────────────────────────────────────────────────────────
function Particle({ x, size, color, delay }: { x: number; size: number; color: string; delay: number }) {
  const y   = useRef(new Animated.Value(height * 0.6)).current;
  const op  = useRef(new Animated.Value(0)).current;
  const sc  = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y,  { toValue: height * 0.1, duration: 3500, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.8, duration: 600, useNativeDriver: true }),
            Animated.timing(op, { toValue: 0,   duration: 2900, useNativeDriver: true }),
          ]),
          Animated.spring(sc, { toValue: 1, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(y,  { toValue: height * 0.6, duration: 0, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0,            duration: 0, useNativeDriver: true }),
          Animated.timing(sc, { toValue: 0.4,          duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color,
        opacity: op,
        transform: [{ translateY: y }, { scale: sc }],
      }}
    />
  );
}

// ─── Ripple ring (for slide 1) ────────────────────────────────────────────────
function RippleRing({ delay, size }: { delay: number; size: number }) {
  const sc = useRef(new Animated.Value(0.3)).current;
  const op = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(sc, { toValue: 1.6, duration: 2000, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0,   duration: 2000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(sc, { toValue: 0.3, duration: 0, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute',
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
      transform: [{ scale: sc }], opacity: op,
    }} />
  );
}

// ─── Slide 1: Hero drop ───────────────────────────────────────────────────────
function Slide1Illustration() {
  useLanguage();
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -14, duration: 1200, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0,   duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.illustrationBox}>
      {/* Ripples */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <RippleRing delay={0}    size={220} />
        <RippleRing delay={700}  size={220} />
        <RippleRing delay={1400} size={220} />
        <Animated.View style={{ transform: [{ translateY: float }] }}>
          <WaterDrop size={160} fillPct={0.6} happy />
        </Animated.View>
      </View>

      {/* Floating stat badges */}
      <Animated.View style={[styles.badge, styles.badge1]}>
        <Text style={styles.badgeEmoji}>•</Text>
        <Text style={styles.badgeText}>{i18n.t('onboarding.fatBurning')}</Text>
      </Animated.View>
      <Animated.View style={[styles.badge, styles.badge2]}>
        <Text style={styles.badgeEmoji}>•</Text>
        <Text style={styles.badgeText}>{i18n.t('onboarding.autophagy')}</Text>
      </Animated.View>
      <Animated.View style={[styles.badge, styles.badge3]}>
        <Text style={styles.badgeEmoji}>•</Text>
        <Text style={styles.badgeText}>{i18n.t('onboarding.cellRenewal')}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Slide 2: Timer visualization ─────────────────────────────────────────────
function Slide2Illustration() {
  useLanguage();
  const progress = useRef(new Animated.Value(0)).current;
  const spin     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0, duration: 800,  useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 6000, useNativeDriver: true }),
    ).start();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.illustrationBox}>
      {/* Spinning orbit ring */}
      <Animated.View style={[styles.orbitRing, { transform: [{ rotate }] }]}>
        <View style={styles.orbitDot} />
      </Animated.View>

      {/* Central timer circle */}
      <View style={styles.timerCircle}>
        <View style={[styles.timerCircleInner, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Text style={styles.timerDisplay}>16:00:00</Text>
          <Text style={styles.timerSub}>{i18n.t('ui.elapsed')}</Text>
        </View>
      </View>

      {/* Stage pills */}
      {[
        { label: i18n.t('onboarding.hour0to8'),  desc: i18n.t('onboarding.bloodSugarDrops'), color: '#60A5FA' },
        { label: i18n.t('onboarding.hour8to16'), desc: i18n.t('onboarding.fatBurningBegins'), color: '#34D399' },
        { label: i18n.t('onboarding.hour16plus'),  desc: i18n.t('onboarding.autophagyKicksIn'), color: '#F472B6' },
      ].map((s, i) => (
        <View key={i} style={[styles.stagePill, { top: 40 + i * 52, backgroundColor: s.color + '30', borderColor: s.color + '60' }]}>
          <View style={[styles.stageDot, { backgroundColor: s.color }]} />
          <View>
            <Text style={styles.stagePillLabel}>{s.label}</Text>
            <Text style={styles.stagePillDesc}>{s.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Slide 3: Transformation ──────────────────────────────────────────────────
function Slide3Illustration() {
  useLanguage();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.delay(1000),
        Animated.timing(slideAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        Animated.delay(1000),
      ]),
    ).start();
  }, []);

  const arrowScale = slideAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1] });

  return (
    <View style={styles.illustrationBox}>
      {/* Before / After drops */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.xl, marginBottom: SPACING.lg }}>
        {/* Before — fuller */}
        <View style={{ alignItems: 'center' }}>
          <WaterDrop size={100} fillPct={0.85} happy={false} />
          <View style={styles.beforeAfterLabel}>
            <Text style={styles.beforeAfterText}>{i18n.t('ui.now')}</Text>
          </View>
        </View>

        {/* Arrow */}
        <Animated.Text style={[styles.transformArrow, { transform: [{ scale: arrowScale }] }]}>
          →
        </Animated.Text>

        {/* After — slimmer / full happy */}
        <View style={{ alignItems: 'center' }}>
          <WaterDrop size={100} fillPct={0.35} happy />
          <View style={[styles.beforeAfterLabel, { backgroundColor: '#10B981' }]}>
            <Text style={styles.beforeAfterText}>{i18n.t('ui.goal')}</Text>
          </View>
        </View>
      </View>

      {/* Progress bars */}
      {[
        { label: i18n.t('onboarding.weightLost'),    pct: 0.72, color: '#3B82F6' },
        { label: i18n.t('onboarding.energyGained'),  pct: 0.88, color: '#10B981' },
        { label: i18n.t('onboarding.mentalClarity'), pct: 0.65, color: '#0F7AB8' },
      ].map((b) => (
        <View key={b.label} style={styles.progressRow}>
          <Text style={styles.progressLabel}>{b.label}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${b.pct * 100}%` as any, backgroundColor: b.color }]} />
          </View>
          <Text style={[styles.progressPct, { color: b.color }]}>{Math.round(b.pct * 100)}%</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Slide 4: Coach ───────────────────────────────────────────────────────────
function Slide4Illustration() {
  useLanguage();
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.illustrationBox}>
      {/* Coach avatar */}
      <Animated.View style={[styles.coachCircle, { transform: [{ scale: pulse }] }]}>
        <Text style={{ fontSize: 46, color: '#fff', fontWeight: '900' }}>WF</Text>
      </Animated.View>

      {/* Stars */}
      <View style={styles.starsRow}>
        {[1,2,3,4,5].map(i => <Text key={i} style={styles.star}>•</Text>)}
      </View>
      <Text style={styles.coachTagline}>{i18n.t('onboarding.fastingCoach')}</Text>

      {/* Feature chips */}
      <View style={styles.chipsRow}>
        {[i18n.t('onboarding.oneOnOneSessions'), i18n.t('onboarding.freeToBook'), i18n.t('onboarding.personalisedPlan'), i18n.t('onboarding.directSupport')].map((c) => (
          <View key={c} style={styles.featureChip}>
            <Text style={styles.featureChipText}>{c}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Slide data ───────────────────────────────────────────────────────────────
// ─── Main component ───────────────────────────────────────────────────────────
export default function WelcomeSlides() {
  useLanguage();

  const slides = [
    {
      key: '1',
      gradient: [COLORS.primaryDark, COLORS.primary, COLORS.gradientEnd] as [string, string, string],
      headline: i18n.t('onboarding.slide1.headline') as string,
      body: i18n.t('onboarding.slide1.body') as string,
      Illustration: Slide1Illustration,
      btnLabel: i18n.t('common.next') as string,
    },
    {
      key: '2',
      gradient: [COLORS.primaryDark, '#1646AF', COLORS.primary] as [string, string, string],
      headline: i18n.t('onboarding.slide2.headline') as string,
      body: i18n.t('onboarding.slide2.body') as string,
      Illustration: Slide2Illustration,
      btnLabel: i18n.t('common.next') as string,
    },
    {
      key: '3',
      gradient: [COLORS.primaryDark, '#0F5B8D', COLORS.gradientEnd] as [string, string, string],
      headline: i18n.t('onboarding.slide3.headline') as string,
      body: i18n.t('onboarding.slide3.body') as string,
      Illustration: Slide3Illustration,
      btnLabel: i18n.t('common.next') as string,
    },
    {
      key: '4',
      gradient: [COLORS.primaryDark, COLORS.primary, '#0D9488'] as [string, string, string],
      headline: i18n.t('onboarding.slide4.headline') as string,
      body: i18n.t('onboarding.slide4.body') as string,
      Illustration: Slide4Illustration,
      btnLabel: i18n.t('common.done') as string,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef  = useRef<FlatList>(null);
  const navigation   = useNavigation<any>();
  const textOpacity  = useRef(new Animated.Value(1)).current;
  const contentScale = useRef(new Animated.Value(1)).current;

  const goTo = (index: number) => {
    // Fade out → scroll → fade in
    Animated.parallel([
      Animated.timing(textOpacity,  { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(contentScale, { toValue: 0.95, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      flatListRef.current?.scrollToIndex({ index, animated: false });
      setActiveIndex(index);
      Animated.parallel([
        Animated.timing(textOpacity,  { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(contentScale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (activeIndex === slides.length - 1) {
      navigation.navigate('ProfileSetupName');
    } else {
      goTo(activeIndex + 1);
    }
  };

  const slide = slides[activeIndex];
  const { Illustration } = slide;

  return (
    <View style={styles.screen}>
      {/* Full-screen gradient — changes per slide */}
      <LinearGradient colors={slide.gradient} style={StyleSheet.absoluteFill} />

      {/* Floating particles */}
      {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((x, i) => (
        <Particle
          key={i}
          x={width * x}
          size={8 + (i % 3) * 6}
          color="rgba(255,255,255,0.18)"
          delay={i * 500}
        />
      ))}

      {/* Hidden FlatList — used only for index tracking, not rendering */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(s) => s.key}
        horizontal pagingEnabled
        scrollEnabled={false}
        style={{ height: 0, position: 'absolute' }}
        renderItem={() => null}
      />

      {/* Illustration area */}
      <Animated.View style={[styles.illustrationArea, { opacity: textOpacity, transform: [{ scale: contentScale }] }]}>
        <Illustration />
      </Animated.View>

      {/* Bottom sheet */}
      <View style={styles.bottomSheet}>
        {/* Slide headline */}
        <Animated.View style={{ opacity: textOpacity, transform: [{ scale: contentScale }] }}>
          <Text style={styles.headline}>{slide.headline}</Text>
          <Text style={styles.body}>{slide.body}</Text>
        </Animated.View>

        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <Animated.View style={[styles.dot, i === activeIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Next button */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.nextBtnGrad}
          >
            <Text style={styles.nextBtnText}>{slide.btnLabel}</Text>
            <Text style={styles.nextBtnArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Skip */}
        {activeIndex < slides.length - 1 && (
          <TouchableOpacity onPress={() => navigation.navigate('ProfileSetupName')} style={styles.skipBtn}>
            <Text style={styles.skipText}>{i18n.t('onboarding.skipForNow')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },

  illustrationArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },

  illustrationBox: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    position: 'relative',
    minHeight: height * 0.42,
  },

  // Bottom sheet
  bottomSheet: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: SPACING.xl,
    paddingBottom: 44,
  },
  headline: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 38,
    marginBottom: SPACING.sm,
  },
  body: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },

  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 28, borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  nextBtn: { borderRadius: BORDER_RADIUS.round, overflow: 'hidden', marginBottom: SPACING.md },
  nextBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: SPACING.sm,
  },
  nextBtnText:  { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '800' },
  nextBtnArrow: { color: '#fff', fontSize: FONT_SIZE.xl, fontWeight: '800' },

  skipBtn: { alignItems: 'center' },
  skipText: { color: 'rgba(255,255,255,0.5)', fontSize: FONT_SIZE.sm },

  // Badges (slide 1)
  badge: {
    position: 'absolute',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  badge1: { top: 10,  left: 20 },
  badge2: { top: 10,  right: 20 },
  badge3: { bottom: 10, left: width * 0.25 },
  badgeEmoji: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Slide 2
  orbitRing: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    alignItems: 'flex-start', justifyContent: 'center',
  },
  orbitDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#60A5FA',
    marginLeft: -7,
    shadowColor: '#60A5FA', shadowOpacity: 0.8, shadowRadius: 6, elevation: 4,
  },
  timerCircle: {
    width: 170, height: 170, borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  timerCircleInner: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: 'center', justifyContent: 'center',
  },
  timerDisplay: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  timerSub:     { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4 },

  stagePill: {
    position: 'absolute',
    right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  stageDot:      { width: 8, height: 8, borderRadius: 4 },
  stagePillLabel:{ color: '#fff', fontSize: 11, fontWeight: '700' },
  stagePillDesc: { color: 'rgba(255,255,255,0.65)', fontSize: 10 },

  // Slide 3
  beforeAfterLabel: {
    marginTop: 8, backgroundColor: '#3B82F6',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 12, paddingVertical: 3,
  },
  beforeAfterText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  transformArrow:  { fontSize: 36, color: '#fff', fontWeight: '900', marginBottom: 20 },

  progressRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    width: width * 0.82, marginBottom: 10,
  },
  progressLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, width: 100 },
  progressTrack: { flex: 1, height: 7, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 4 },
  progressPct:   { fontSize: 11, fontWeight: '800', width: 32, textAlign: 'right' },

  // Slide 4
  coachCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.sm,
    shadowColor: '#fff', shadowOpacity: 0.2, shadowRadius: 20, elevation: 6,
  },
  starsRow:      { flexDirection: 'row', gap: 4, marginBottom: 6 },
  star:          { fontSize: 18 },
  coachTagline:  { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: SPACING.md },
  chipsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  featureChip:   {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  featureChipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});

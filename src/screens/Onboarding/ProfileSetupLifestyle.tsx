import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import { useUser } from '../../store/UserContext';
import { useLanguage } from '../../store/LanguageContext';
import { ActivityLevel, ClimateType } from '../../types';
import i18n from '../../i18n';

const BLUE      = '#1B8CFF';
const CYAN      = '#21C7FF';
const NAVY      = '#0B5DD1';
const NAVY_DEEP = '#082C6B';

/* ── Floating particle (matches WelcomeSlides) ─────────────────── */
function Particle({ x, size, delay }: { x: number; size: number; delay: number }) {
  const y  = useRef(new Animated.Value(700)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y,  { toValue: 40,  duration: 4000, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.5, duration: 600,  useNativeDriver: true }),
            Animated.timing(op, { toValue: 0,   duration: 3400, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(y,  { toValue: 700, duration: 0, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0,   duration: 0, useNativeDriver: true }),
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
        backgroundColor: 'rgba(255,255,255,0.55)',
        opacity: op, transform: [{ translateY: y }],
      }}
    />
  );
}

/* ── Age stepper — same pattern as ProfileSetupBody ───────────── */
function AgeStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={s.ageCard}>
      <TouchableOpacity
        style={s.ageBtn}
        onPress={() => onChange(Math.max(10, value - 1))}
        activeOpacity={0.7}
      >
        <Ionicons name="remove" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={s.ageDisplay}>
        <Text style={s.ageNum}>{value}</Text>
        <Text style={s.ageUnit}>years old</Text>
      </View>

      <TouchableOpacity
        style={[s.ageBtn, s.ageBtnPlus]}
        onPress={() => onChange(Math.min(100, value + 1))}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/* ── Activity row ──────────────────────────────────────────────── */
const ACTIVITIES: { key: ActivityLevel; icon: string; label: string; desc: string }[] = [
  { key: 'sedentary',   icon: '🛋️', label: 'Sedentary',         desc: 'Little or no exercise' },
  { key: 'light',       icon: '🚶', label: 'Lightly active',    desc: '1–3 days / week' },
  { key: 'moderate',    icon: '🏃', label: 'Moderately active', desc: '3–5 days / week' },
  { key: 'active',      icon: '🏋️', label: 'Active',            desc: '6–7 days / week' },
  { key: 'very_active', icon: '⚡', label: 'Very active',       desc: 'Twice daily training' },
];

function ActivityRow({
  opt, selected, onPress,
}: {
  opt: typeof ACTIVITIES[number];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.actRow, selected && s.actRowActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={s.actIcon}>{opt.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[s.actLabel, selected && s.actLabelActive]}>{opt.label}</Text>
        <Text style={s.actDesc}>{opt.desc}</Text>
      </View>
      {selected && (
        <View style={s.actCheck}>
          <Ionicons name="checkmark" size={13} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ── Climate pill ──────────────────────────────────────────────── */
const CLIMATES: { key: ClimateType; icon: string; label: string }[] = [
  { key: 'cold',      icon: '❄️', label: 'Cold' },
  { key: 'temperate', icon: '🌤', label: 'Temperate' },
  { key: 'hot',       icon: '☀️', label: 'Hot' },
];

/* ── Screen ────────────────────────────────────────────────────── */
export default function ProfileSetupLifestyle() {
  const [age,      setAge]      = useState(28);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [climate,  setClimate]  = useState<ClimateType>('temperate');

  const navigation    = useNavigation<any>();
  const route         = useRoute<any>();
  const insets        = useSafeAreaInsets();
  const { saveProfile } = useUser();
  useLanguage();

  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleFinish = async () => {
    await saveProfile({
      ...route.params,
      age,
      activityLevel: activity,
      climateType: climate,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    });
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <View style={s.screen}>
      {/* Background */}
      <LinearGradient
        colors={[NAVY_DEEP, NAVY, BLUE]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />

      {/* Particles */}
      {[0.08, 0.3, 0.52, 0.72, 0.9].map((xPct, i) => (
        <Particle key={i} x={xPct * 375} size={4 + (i % 3) * 4} delay={i * 800} />
      ))}

      {/* Step indicator */}
      <View style={[s.dotsRow, { marginTop: insets.top + 18 }]}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              s.dot,
              i === 3 && s.dotActive,
              i < 3  && s.dotDone,
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <Text style={s.eyebrow}>STEP 3 OF 3</Text>
          <Text style={s.title}>Your lifestyle{'\n'}&amp; habits.</Text>
          <Text style={s.subtitle}>
            Helps us tailor your fasting tips, hydration goals, and energy calculations.
          </Text>

          {/* ── Age ── */}
          <Text style={s.sectionLabel}>Your age</Text>
          <AgeStepper value={age} onChange={setAge} />

          {/* ── Activity ── */}
          <Text style={[s.sectionLabel, { marginTop: SPACING.xl }]}>Activity level</Text>
          <View style={s.actList}>
            {ACTIVITIES.map(opt => (
              <ActivityRow
                key={opt.key}
                opt={opt}
                selected={activity === opt.key}
                onPress={() => setActivity(opt.key)}
              />
            ))}
          </View>

          {/* ── Climate ── */}
          <Text style={[s.sectionLabel, { marginTop: SPACING.xl }]}>Your climate</Text>
          <View style={s.climateRow}>
            {CLIMATES.map(c => (
              <TouchableOpacity
                key={c.key}
                style={[s.climateCard, climate === c.key && s.climateCardActive]}
                onPress={() => setClimate(c.key)}
                activeOpacity={0.8}
              >
                <Text style={s.climateIcon}>{c.icon}</Text>
                <Text style={[s.climateLabel, climate === c.key && { color: '#fff' }]}>{c.label}</Text>
                {climate === c.key && (
                  <View style={s.climateCheck}>
                    <Ionicons name="checkmark" size={11} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Small disclaimer */}
          <Text style={s.disclaimer}>
            You can update any of these at any time from your profile.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 24 }]}>
        <LinearGradient
          colors={['rgba(8,30,80,0)', 'rgba(8,44,107,0.92)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <TouchableOpacity onPress={handleFinish} activeOpacity={0.85}>
          <LinearGradient
            colors={[CYAN, BLUE]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.cta}
          >
            <Text style={s.ctaText}>{i18n.t('onboarding.startJourney')}</Text>
            <Ionicons name="rocket-outline" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  screen: { flex: 1 },

  dotsRow: {
    flexDirection: 'row', gap: 8,
    alignSelf: 'center', marginBottom: SPACING.lg,
  },
  dot:       { width: 30, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.22)' },
  dotActive: { backgroundColor: '#fff' },
  dotDone:   { backgroundColor: 'rgba(255,255,255,0.55)' },

  scroll: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm },

  eyebrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11, fontWeight: '800', letterSpacing: 1.8,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 36, fontWeight: '900', color: '#fff',
    lineHeight: 44, marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md, color: 'rgba(255,255,255,0.6)',
    lineHeight: 22, marginBottom: SPACING.sm,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11, fontWeight: '800', letterSpacing: 1.4,
    marginBottom: SPACING.sm,
  },

  // Age
  ageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)',
    padding: SPACING.md,
  },
  ageBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  ageBtnPlus: {
    backgroundColor: BLUE,
    shadowColor: BLUE, shadowOpacity: 0.5,
    shadowRadius: 8, elevation: 4,
  },
  ageDisplay:  { alignItems: 'center' },
  ageNum:      { fontSize: 52, fontWeight: '900', color: '#fff', lineHeight: 58 },
  ageUnit:     { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  // Activity
  actList: { gap: SPACING.sm },
  actRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.16)',
    paddingVertical: 14, paddingHorizontal: SPACING.md,
  },
  actRowActive: {
    backgroundColor: 'rgba(27,140,255,0.22)',
    borderColor: BLUE,
    shadowColor: BLUE, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  actIcon:      { fontSize: 24, width: 32, textAlign: 'center' },
  actLabel:     { color: 'rgba(255,255,255,0.75)', fontSize: FONT_SIZE.md, fontWeight: '700' },
  actLabelActive: { color: '#fff' },
  actDesc:      { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  actCheck: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: BLUE,
    alignItems: 'center', justifyContent: 'center',
  },

  // Climate
  climateRow: { flexDirection: 'row', gap: SPACING.sm },
  climateCard: {
    flex: 1, alignItems: 'center', paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.16)',
    position: 'relative',
  },
  climateCardActive: {
    backgroundColor: 'rgba(27,140,255,0.22)',
    borderColor: BLUE,
    shadowColor: BLUE, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  climateIcon:  { fontSize: 26, marginBottom: 6 },
  climateLabel: { color: 'rgba(255,255,255,0.65)', fontSize: FONT_SIZE.sm, fontWeight: '700' },
  climateCheck: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: BLUE,
    alignItems: 'center', justifyContent: 'center',
  },

  disclaimer: {
    marginTop: SPACING.xl,
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11, fontWeight: '600', textAlign: 'center',
  },

  // Footer
  footer: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },
  cta: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17,
    borderRadius: BORDER_RADIUS.round,
  },
  ctaText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '800' },
});

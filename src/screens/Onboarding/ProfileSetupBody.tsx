/**
 * ProfileSetupBody — onboarding step 2.
 * Live WaterBodyAvatar that updates as user changes height/weight/goal.
 * Two stat cards (BMI, Body Fat %) beside the avatar.
 * Three brand-blue steppers + gradient Next button.
 *
 * Required image assets: none.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Easing, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import WaterBodyAvatar from '../../components/Avatar/WaterBodyAvatar';
import { useLanguage } from '../../store/LanguageContext';
import i18n from '../../i18n';

const BLUE = '#1B8CFF';
const CYAN = '#21C7FF';
const NAVY = '#0B5DD1';
const NAVY_DEEP = '#082C6B';

function calcBmi(weightKg: number, heightCm: number) {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

/**
 * Deurenberg body fat % formula:
 *   1.20 * BMI + 0.23 * age − 10.8 * sex − 5.4
 *   (sex: male = 1, female = 0)
 */
function calcBodyFat(bmi: number, age: number, gender: 'male' | 'female') {
  const sex = gender === 'male' ? 1 : 0;
  return 1.20 * bmi + 0.23 * age - 10.8 * sex - 5.4;
}

function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#60A5FA' };
  if (bmi < 25)   return { label: 'Healthy',     color: '#34D399' };
  if (bmi < 30)   return { label: 'Overweight',  color: '#FBBF24' };
  return                  { label: 'Obese',      color: '#F87171' };
}

/* ── Stepper ─────────────────────────────────────────────────── */
function Stepper({
  label, value, unit, min, max, step = 1, onChange,
}: {
  label: string; value: number; unit: string;
  min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={s.stepCard}>
      <Text style={s.stepLabel}>{label}</Text>
      <View style={s.stepRow}>
        <TouchableOpacity
          style={s.stepBtn}
          onPress={() => onChange(Math.max(min, +(value - step).toFixed(1)))}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={s.stepValueWrap}>
          <Text style={s.stepValue}>{value}</Text>
          <Text style={s.stepUnit}>{unit}</Text>
        </View>

        <TouchableOpacity
          style={[s.stepBtn, s.stepBtnPrimary]}
          onPress={() => onChange(Math.min(max, +(value + step).toFixed(1)))}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── Screen ──────────────────────────────────────────────────── */
export default function ProfileSetupBody() {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const insets     = useSafeAreaInsets();
  const gender: 'male' | 'female' = route.params?.gender ?? 'male';
  const age: number               = route.params?.age    ?? 30;
  useLanguage();

  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [goalW,  setGoalW]  = useState(65);

  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const bmi      = useMemo(() => calcBmi(weight, height), [weight, height]);
  const bodyFat  = useMemo(() => calcBodyFat(bmi, age, gender), [bmi, age, gender]);
  const cat      = bmiCategory(bmi);

  // fillPct drives BODY SHAPE in WaterBodyAvatar:
  //  0 = slim/goal silhouette, 1 = heavier silhouette.
  // Map BMI 18..32 → 0.1..0.9
  const shape = useMemo(
    () => Math.min(0.95, Math.max(0.1, (bmi - 18) / 14 * 0.8 + 0.1)),
    [bmi],
  );

  const avatarProfile: any = {
    name: 'You', gender, weightKg: weight, heightCm: height, age,
  };

  return (
    <View style={s.screen}>
      <LinearGradient
        colors={[NAVY_DEEP, NAVY, BLUE]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />

      {/* Step indicator */}
      <View style={[s.stepperRow, { marginTop: insets.top + 16 }]}>
        {[1,2,3].map(i => (
          <View key={i} style={[
            s.stepDot,
            i === 2 && s.stepDotActive,
            i < 2 && s.stepDotDone,
          ]} />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <Text style={s.eyebrow}>STEP 2 OF 3</Text>
          <Text style={s.title}>About your body</Text>
          <Text style={s.subtitle}>
            We use this to personalise your fasting plan and track real progress.
          </Text>

          {/* Live avatar + stats */}
          <View style={s.preview}>
            <View style={s.avatarBox}>
              <WaterBodyAvatar profile={avatarProfile} size={160} fillPct={shape} />
            </View>

            <View style={s.statsCol}>
              <View style={s.statCard}>
                <Text style={s.statLabel}>BMI</Text>
                <Text style={s.statValue}>{bmi.toFixed(1)}</Text>
                <View style={[s.statChip, { backgroundColor: cat.color + '25', borderColor: cat.color + '70' }]}>
                  <View style={[s.statChipDot, { backgroundColor: cat.color }]} />
                  <Text style={[s.statChipText, { color: cat.color }]}>{cat.label}</Text>
                </View>
              </View>

              <View style={s.statCard}>
                <Text style={s.statLabel}>Body Fat</Text>
                <Text style={s.statValue}>{bodyFat.toFixed(1)}%</Text>
                <Text style={s.statHint}>Deurenberg estimate</Text>
              </View>
            </View>
          </View>

          {/* Steppers */}
          <Stepper label="Height"      unit="cm" value={height} min={120} max={220} onChange={setHeight} />
          <Stepper label="Weight"      unit="kg" value={weight} min={30}  max={250} onChange={setWeight} />
          <Stepper label="Goal weight" unit="kg" value={goalW}  min={30}  max={250} onChange={setGoalW} />
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 20 }]}>
        <LinearGradient
          colors={['rgba(8,30,80,0)', 'rgba(8,30,80,0.85)']}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ProfileSetupLifestyle', {
            ...route.params, heightCm: height, weightKg: weight, goalWeightKg: goalW,
          })}
        >
          <LinearGradient
            colors={[CYAN, BLUE]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.cta}
          >
            <Text style={s.ctaText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  stepperRow: {
    flexDirection: 'row', gap: 8, alignSelf: 'center', marginBottom: SPACING.lg,
  },
  stepDot:       { width: 28, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.22)' },
  stepDotActive: { backgroundColor: '#FFFFFF', width: 36 },
  stepDotDone:   { backgroundColor: 'rgba(255,255,255,0.55)' },

  scroll: { paddingHorizontal: SPACING.xl },
  eyebrow: {
    color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '800',
    letterSpacing: 1.4, marginBottom: 6,
  },
  title:    { fontSize: 32, fontWeight: '900', color: '#FFFFFF', lineHeight: 38, marginBottom: 6 },
  subtitle: { fontSize: FONT_SIZE.md, color: 'rgba(255,255,255,0.7)', lineHeight: 22, marginBottom: SPACING.lg },

  preview: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarBox: {
    width: 160, height: 290,
    alignItems: 'center', justifyContent: 'center',
  },
  statsCol: { flex: 1, gap: SPACING.sm },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  statValue: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', marginTop: 2 },
  statHint:  { color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 4, fontWeight: '600' },
  statChip: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
    marginTop: 6, borderWidth: 1,
  },
  statChipDot: { width: 6, height: 6, borderRadius: 3 },
  statChipText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  stepLabel: { color: '#FFFFFF', fontSize: FONT_SIZE.md, fontWeight: '800', marginBottom: 10 },
  stepRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn:   {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  stepBtnPrimary: {
    backgroundColor: BLUE, borderColor: CYAN,
    shadowColor: CYAN, shadowOpacity: 0.5, shadowRadius: 10,
  },
  stepValueWrap: { alignItems: 'center', minWidth: 90 },
  stepValue:     { color: '#FFFFFF', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  stepUnit:      { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },

  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg,
  },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 18,
    borderRadius: 999,
  },
  ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },
});
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import WaterDrop from '../../components/Avatar/WaterDrop';
import { useLanguage } from '../../store/LanguageContext';
import i18n from '../../i18n';

// +/− stepper
function Stepper({ label, value, unit, min, max, step = 1, hint, onChange }: {
  label: string; value: number; unit: string;
  min: number; max: number; step?: number;
  hint?: string;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.stepperCard}>
      <View>
        <Text style={styles.stepperLabel}>{label}</Text>
        {hint && <Text style={styles.stepperHint}>{hint}</Text>}
      </View>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => onChange(Math.max(min, +(value - step).toFixed(1)))}
        >
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.stepperValueBox}>
          <Text style={styles.stepperValue}>{value}</Text>
          <Text style={styles.stepperUnit}>{unit}</Text>
        </View>
        <TouchableOpacity
          style={[styles.stepperBtn, { backgroundColor: COLORS.primary }]}
          onPress={() => onChange(Math.min(max, +(value + step).toFixed(1)))}
        >
          <Text style={[styles.stepperBtnText, { color: '#fff' }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProfileSetupBody() {
  const [height, setHeight]   = useState(170);
  const [weight, setWeight]   = useState(70);
  const [goalW,  setGoalW]    = useState(65);
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  useLanguage();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  // Avatar fill based on weight vs goal
  const bmi     = weight / ((height / 100) ** 2);
  const fillPct = Math.min(Math.max((bmi - 16) / 20, 0.1), 0.95);

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#0F172A', '#1E3A8A', '#3B82F6']} style={StyleSheet.absoluteFill} />

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {[1,2,3].map(i => (
          <View key={i} style={[styles.stepDot, i === 2 && styles.stepDotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideY }] }}>
          <Text style={styles.stepLabel}>{i18n.t('onboarding.step2')}</Text>
          <Text style={styles.title}>{i18n.t('onboarding.setup.bodyTitle')}</Text>
          <Text style={styles.subtitle}>{i18n.t('onboarding.setup.bodySubtitle')}</Text>

          {/* Live avatar preview */}
          <View style={styles.avatarPreview}>
            <WaterDrop size={110} fillPct={fillPct} happy={bmi < 30} />
            <View style={styles.avatarStatBubble}>
              <Text style={styles.avatarStatLabel}>{i18n.t('ui.bmi')}</Text>
              <Text style={styles.avatarStatVal}>{bmi.toFixed(1)}</Text>
              <Text style={styles.avatarStatCat}>
                {bmi < 18.5 ? i18n.t('profile.underweight') : bmi < 25 ? `${i18n.t('profile.normal')} ✓` : bmi < 30 ? i18n.t('profile.overweight') : i18n.t('profile.obese')}
              </Text>
            </View>
          </View>

          {/* Steppers */}
          <Stepper label={i18n.t('onboarding.setup.height')} unit="cm" value={height} min={100} max={220}
            hint={i18n.t('onboarding.setup.heightHint')} onChange={setHeight} />
          <Stepper label={i18n.t('onboarding.setup.weight')} unit="kg" value={weight} min={30} max={250}
            hint={i18n.t('onboarding.setup.weightHint')} onChange={setWeight} />
          <Stepper label={i18n.t('onboarding.setup.goalWeight')} unit="kg" value={goalW} min={30} max={250}
            hint={i18n.t('onboarding.setup.goalWeightHint')} onChange={setGoalW} />
        </Animated.View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileSetupLifestyle', { ...route.params, heightCm: height, weightKg: weight, goalWeightKg: goalW })}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.continueBtn}
          >
            <Text style={styles.continueBtnText}>{i18n.t('common.next')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  stepRow: {
    flexDirection: 'row', gap: 8, alignSelf: 'center',
    marginTop: 60, marginBottom: SPACING.lg,
  },
  stepDot:       { width: 28, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  stepDotActive: { backgroundColor: '#fff' },

  scroll:   { paddingHorizontal: SPACING.xl, paddingBottom: 20 },
  stepLabel:{ color: 'rgba(255,255,255,0.55)', fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: 6 },
  title:    { fontSize: 34, fontWeight: '900', color: '#fff', lineHeight: 42, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZE.md, color: 'rgba(255,255,255,0.65)', marginBottom: SPACING.lg, lineHeight: 22 },

  avatarPreview: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.lg, gap: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarStatBubble: { flex: 1 },
  avatarStatLabel:  { color: 'rgba(255,255,255,0.55)', fontSize: FONT_SIZE.sm, fontWeight: '600' },
  avatarStatVal:    { fontSize: 40, fontWeight: '900', color: '#fff' },
  avatarStatCat:    { fontSize: FONT_SIZE.sm, color: '#10B981', fontWeight: '700', marginTop: 2 },

  stepperCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  stepperLabel:    { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '700' },
  stepperHint:     { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  stepperBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepperBtnText:  { fontSize: 22, color: '#fff', fontWeight: '300', lineHeight: 26 },
  stepperValueBox: { alignItems: 'center', minWidth: 64 },
  stepperValue:    { fontSize: FONT_SIZE.xl, fontWeight: '800', color: '#fff' },
  stepperUnit:     { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  footer: { paddingHorizontal: SPACING.xl, paddingBottom: 44 },
  continueBtn:     { borderRadius: BORDER_RADIUS.round, paddingVertical: 18, alignItems: 'center' },
  continueBtnText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '800' },
});

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import { useUser } from '../../store/UserContext';
import { useLanguage } from '../../store/LanguageContext';
import { ActivityLevel, ClimateType } from '../../types';
import i18n from '../../i18n';

const ACTIVITY_OPTIONS: { key: ActivityLevel; icon: string }[] = [
  { key: 'sedentary',   icon: '🛋️' },
  { key: 'light',       icon: '🚶' },
  { key: 'moderate',    icon: '🏃' },
  { key: 'active',      icon: '🏋️' },
  { key: 'very_active', icon: '⚡' },
];

const CLIMATE_OPTIONS: { key: ClimateType; icon: string }[] = [
  { key: 'cold',      icon: '❄️' },
  { key: 'temperate', icon: '🌤' },
  { key: 'hot',       icon: '☀️' },
];

export default function ProfileSetupLifestyle() {
  const [age,      setAge]      = useState(28);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [climate,  setClimate]  = useState<ClimateType>('temperate');
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const { saveProfile } = useUser();
  useLanguage();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true }),
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
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#1E1B4B', '#4338CA', '#7C3AED']} style={StyleSheet.absoluteFill} />

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {[1,2,3].map(i => (
          <View key={i} style={[styles.stepDot, i === 3 && styles.stepDotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideY }] }}>
          <Text style={styles.stepLabel}>{i18n.t('onboarding.step3')}</Text>
          <Text style={styles.title}>{i18n.t('onboarding.setup.lifestyleTitle')}</Text>
          <Text style={styles.subtitle}>{i18n.t('onboarding.setup.lifestyleSubtitle')}</Text>

          {/* Age */}
          <Text style={styles.sectionLabel}>{i18n.t('onboarding.setup.age')}</Text>
          <View style={styles.ageCard}>
            <TouchableOpacity
              style={styles.ageBtn}
              onPress={() => setAge(a => Math.max(10, a - 1))}
            >
              <Text style={styles.ageBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.ageDisplay}>
              <Text style={styles.ageNum}>{age}</Text>
              <Text style={styles.ageUnit}>{i18n.t('onboarding.setup.yearsOld')}</Text>
            </View>
            <TouchableOpacity
              style={[styles.ageBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => setAge(a => Math.min(100, a + 1))}
            >
              <Text style={[styles.ageBtnText, { color: '#fff' }]}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Activity */}
          <Text style={styles.sectionLabel}>{i18n.t('onboarding.setup.activityLevel')}</Text>
          <View style={styles.activityList}>
            {ACTIVITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.activityRow, activity === opt.key && styles.activityRowActive]}
                onPress={() => setActivity(opt.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.activityIcon}>{opt.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activityLabel, activity === opt.key && { color: '#fff' }]}>{i18n.t(`onboarding.setup.${opt.key}`)}</Text>
                  <Text style={[styles.activityDesc, activity === opt.key && { color: 'rgba(255,255,255,0.7)' }]}>{i18n.t(`onboarding.setup.${opt.key}Desc`)}</Text>
                </View>
                {activity === opt.key && <Text style={{ color: '#fff', fontSize: 18 }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Climate */}
          <Text style={styles.sectionLabel}>{i18n.t('onboarding.setup.climateType')}</Text>
          <View style={styles.climateRow}>
            {CLIMATE_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[styles.climateCard, climate === c.key && styles.climateCardActive]}
                onPress={() => setClimate(c.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.climateIcon}>{c.icon}</Text>
                <Text style={[styles.climateLabel, climate === c.key && { color: '#fff' }]}>{i18n.t(`onboarding.setup.${c.key}`)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: SPACING.xxl }} />
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleFinish} activeOpacity={0.85}>
          <LinearGradient
            colors={['#7C3AED', '#3B82F6']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.finishBtn}
          >
            <Text style={styles.finishBtnText}>🚀  {i18n.t('onboarding.startJourney')}</Text>
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

  scroll:    { paddingHorizontal: SPACING.xl, paddingBottom: 20 },
  stepLabel: { color: 'rgba(255,255,255,0.55)', fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: 6 },
  title:     { fontSize: 34, fontWeight: '900', color: '#fff', lineHeight: 42, marginBottom: SPACING.sm },
  subtitle:  { fontSize: FONT_SIZE.md, color: 'rgba(255,255,255,0.65)', marginBottom: SPACING.lg, lineHeight: 22 },

  sectionLabel: { color: 'rgba(255,255,255,0.6)', fontSize: FONT_SIZE.sm, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.md },

  // Age
  ageCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  ageBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  ageBtnText: { fontSize: 26, color: '#fff', fontWeight: '300', lineHeight: 30 },
  ageDisplay: { alignItems: 'center' },
  ageNum:     { fontSize: 48, fontWeight: '900', color: '#fff' },
  ageUnit:    { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  // Activity
  activityList: { gap: SPACING.sm },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)',
  },
  activityRowActive: {
    backgroundColor: 'rgba(59,130,246,0.35)',
    borderColor: COLORS.primary,
  },
  activityIcon:  { fontSize: 26 },
  activityLabel: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZE.md, fontWeight: '700' },
  activityDesc:  { color: 'rgba(255,255,255,0.45)', fontSize: FONT_SIZE.xs, marginTop: 2 },

  // Climate
  climateRow: { flexDirection: 'row', gap: SPACING.sm },
  climateCard: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.md, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  climateCardActive: { backgroundColor: 'rgba(59,130,246,0.35)', borderColor: COLORS.primary },
  climateIcon:  { fontSize: 28, marginBottom: 6 },
  climateLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZE.sm, fontWeight: '700' },

  footer: { paddingHorizontal: SPACING.xl, paddingBottom: 44 },
  finishBtn:     { borderRadius: BORDER_RADIUS.round, paddingVertical: 18, alignItems: 'center' },
  finishBtnText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '800' },
});

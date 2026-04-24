import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { useUser } from '../../store/UserContext';
import { calculateTDEE, calculateBmi, calculateBodyFatPercentage } from '../../utils/bmi';
import { FONT, FONT_SIZE, SPACING, COLORS, BORDER_RADIUS } from '../../constants/theme';
import Starfield from '../../components/Starfield';
import Headline from '../../components/Headline';
import Kicker from '../../components/Kicker';
import StatTile from '../../components/StatTile';
import i18n from '../../i18n';
import type { ActivityLevel } from '../../types';

const OPTIONS: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];

export default function CaloriesScreen() {
  const { colors } = useTheme();
  useLanguage();
  const { profile } = useUser();
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activityLevel ?? 'moderate');

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>{i18n.t('ui.completeOnboardingFirst')}</Text>
      </View>
    );
  }

  const tdee    = calculateTDEE(profile.weightKg, profile.heightCm, profile.age, profile.gender, activity);
  const bmi     = calculateBmi(profile.weightKg, profile.heightCm);
  const bodyFat = calculateBodyFatPercentage(bmi.value, profile.age, profile.gender);
  const deficit = Math.max(tdee - 500, 1200);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Starfield density={0.08} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroBlock}>
          <Kicker>Calories</Kicker>
          <View style={{ marginTop: 10 }}>
            <Headline line1="Fuel the fast." line2="Balance the day." size={30} />
          </View>
          <Text style={[styles.heroLead, { color: colors.textSecondary }]}>
            {i18n.t('calories.heroBody')}
          </Text>
        </View>

        {/* Big TDEE gauge */}
        <LinearGradient
          colors={[COLORS.primaryDeep, COLORS.primaryDark, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tdeeCard}
        >
          <Text style={styles.tdeeKicker}>{i18n.t('calories.maintenance')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
            <Text style={styles.tdeeValue}>{tdee}</Text>
            <Text style={styles.tdeeUnit}>{i18n.t('calories.kcalPerDay')}</Text>
          </View>
          <View style={styles.tdeeDivider} />
          <View style={styles.tdeeSplit}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tdeeSubLabel}>{i18n.t('ui.weightLossTarget')}</Text>
              <Text style={styles.tdeeSubValue}>{deficit}</Text>
            </View>
            <View style={styles.tdeeSepVert} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tdeeSubLabel}>{i18n.t('calories.bmi')}</Text>
              <Text style={styles.tdeeSubValue}>{bmi.value}</Text>
            </View>
            <View style={styles.tdeeSepVert} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tdeeSubLabel}>{i18n.t('calories.bodyFat')}</Text>
              <Text style={styles.tdeeSubValue}>{bodyFat.value}%</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Activity selector */}
        <View style={{ marginTop: SPACING.lg, marginBottom: SPACING.sm }}>
          <Kicker>Activity level</Kicker>
        </View>
        <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
          Pick the one that best matches your current week.
        </Text>
        <View style={styles.chipRow}>
          {OPTIONS.map((opt) => {
            const isActive = activity === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setActivity(opt)}
                activeOpacity={0.85}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? COLORS.primary : colors.cardAlt,
                    borderColor:     isActive ? COLORS.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isActive ? '#fff' : colors.text },
                  ]}
                >
                  {i18n.t(`onboarding.setup.${opt}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Supporting stats */}
        <View style={{ marginTop: SPACING.lg, marginBottom: SPACING.sm }}>
          <Kicker>Body profile</Kicker>
        </View>
        <View style={styles.tileRow}>
          <StatTile
            icon="person-outline"
            value={`${profile.age}`}
            label="Years"
            style={{ flex: 1 }}
          />
          <StatTile
            icon="body-outline"
            value={`${profile.heightCm}cm`}
            label="Height"
            accent={COLORS.accent}
            style={{ flex: 1 }}
          />
          <StatTile
            icon="fitness-outline"
            value={`${profile.weightKg}kg`}
            label="Weight"
            accent={COLORS.success}
            style={{ flex: 1 }}
          />
        </View>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            TDEE is estimated with the Mifflin-St Jeor equation. Your coach can fine-tune this on a 1-on-1 call.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 120 },

  heroBlock: { marginTop: SPACING.md, marginBottom: SPACING.lg },
  heroLead:  { fontSize: FONT_SIZE.sm, lineHeight: 20, marginTop: SPACING.md, maxWidth: 320 },

  tdeeCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#0B5DD1',
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  tdeeKicker: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: FONT.extra,
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  tdeeValue: {
    color: '#fff',
    fontFamily: FONT.black,
    fontSize: 72,
    letterSpacing: -2,
    lineHeight: 72,
  },
  tdeeUnit: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: FONT_SIZE.md,
    fontFamily: FONT.semibold,
    marginLeft: 8,
  },
  tdeeDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: SPACING.md,
  },
  tdeeSplit: { flexDirection: 'row', alignItems: 'center' },
  tdeeSepVert: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: SPACING.sm,
  },
  tdeeSubLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: FONT_SIZE.xs,
    fontFamily: FONT.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  tdeeSubValue: {
    color: '#fff',
    fontFamily: FONT.extra,
    fontSize: FONT_SIZE.lg,
    marginTop: 2,
  },

  sectionBody: { fontSize: FONT_SIZE.sm, marginTop: 6, marginBottom: SPACING.md },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  chipText: { fontFamily: FONT.bold, fontSize: FONT_SIZE.sm },

  tileRow: { flexDirection: 'row', gap: SPACING.sm },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  infoText: { flex: 1, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});

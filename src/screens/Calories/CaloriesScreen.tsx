// CaloriesScreen — premium dashboard redesign.
// Same logic / props / handlers as the original. Visual polish:
//  • Editorial hero kept
//  • TDEE gauge upgraded with massive numerals + soft inner glow + segmented sub-stats
//  • Activity selector becomes "segmented" rounded chips with icons
//  • Body profile tiles tightened
//  • Info card upgraded to glass-style note with accent stripe
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { useUser } from '../../store/UserContext';
import { calculateTDEE, calculateBmi, calculateBodyFatPercentage } from '../../utils/bmi';
import { FONT, FONT_SIZE, SPACING, COLORS, BORDER_RADIUS } from '../../constants/theme';
import Headline from '../../components/Headline';
import Kicker from '../../components/Kicker';
import StatTile from '../../components/StatTile';
import i18n from '../../i18n';
import type { ActivityLevel } from '../../types';

const OPTIONS: { key: ActivityLevel; icon: string }[] = [
  { key: 'sedentary',   icon: '🛋️' },
  { key: 'light',       icon: '🚶' },
  { key: 'moderate',    icon: '🏃' },
  { key: 'active',      icon: '🏋️' },
  { key: 'very_active', icon: '⚡' },
];

export default function CaloriesScreen() {
  const { colors } = useTheme();
  useLanguage();
  const { profile } = useUser();
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activityLevel ?? 'moderate');

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroBlock}>
          <Kicker>Calories</Kicker>
          <View style={{ marginTop: 10 }}>
            <Headline line1="Fuel the fast." line2="Balance the day." size={32} />
          </View>
          <Text style={[styles.heroLead, { color: colors.textSecondary }]}>
            {i18n.t('calories.heroBody')}
          </Text>
        </View>

        {/* Big TDEE gauge — premium */}
        <LinearGradient
          colors={['#0A1628', COLORS.primaryDeep ?? '#08226B', COLORS.primaryDark ?? '#0D3AA8', COLORS.primary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.tdeeCard}
        >
          {/* Decorative orbs */}
          <View style={styles.tdeeOrbA} />
          <View style={styles.tdeeOrbB} />

          <View style={styles.tdeeHeaderRow}>
            <Text style={styles.tdeeKicker}>{i18n.t('calories.maintenance')}</Text>
            <View style={styles.tdeeChip}>
              <Ionicons name="flame" size={11} color="#fff" />
              <Text style={styles.tdeeChipText}>TDEE</Text>
            </View>
          </View>

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
        <View style={{ marginTop: SPACING.xl, marginBottom: SPACING.sm }}>
          <Kicker>Activity level</Kicker>
        </View>
        <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
          Pick the one that best matches your current week.
        </Text>
        <View style={styles.chipRow}>
          {OPTIONS.map((opt) => {
            const isActive = activity === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setActivity(opt.key)}
                activeOpacity={0.85}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? COLORS.primary : colors.cardAlt,
                    borderColor:     isActive ? COLORS.primary : colors.border,
                  },
                  isActive && styles.chipActiveShadow,
                ]}
              >
                <Text style={styles.chipIcon}>{opt.icon}</Text>
                <Text style={[styles.chipText, { color: isActive ? '#fff' : colors.text }]}>
                  {i18n.t(`onboarding.setup.${opt.key}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Supporting stats */}
        <View style={{ marginTop: SPACING.xl, marginBottom: SPACING.sm }}>
          <Kicker>Body profile</Kicker>
        </View>
        <View style={styles.tileRow}>
          <StatTile icon="person-outline"  value={`${profile.age}`}        label="Years"  style={{ flex: 1 }} />
          <StatTile icon="body-outline"    value={`${profile.heightCm}cm`} label="Height" accent={COLORS.accent}  style={{ flex: 1 }} />
          <StatTile icon="fitness-outline" value={`${profile.weightKg}kg`} label="Weight" accent={COLORS.success} style={{ flex: 1 }} />
        </View>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoStripe} />
          <Ionicons name="information-circle" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
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
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl,
    overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 }, elevation: 10,
  },
  tdeeOrbA: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(56,189,248,0.18)', top: -100, right: -60 },
  tdeeOrbB: { position: 'absolute', width: 160, height: 160, borderRadius: 80,  backgroundColor: 'rgba(26,86,232,0.22)', bottom: -80, left: -40 },

  tdeeHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tdeeKicker: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: FONT?.extra,
    fontSize: FONT_SIZE.xs, fontWeight: '900',
    textTransform: 'uppercase', letterSpacing: 2,
  },
  tdeeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)',
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999,
  },
  tdeeChipText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },

  tdeeValue: {
    color: '#fff', fontFamily: FONT?.black, fontWeight: '900',
    fontSize: 84, letterSpacing: -3, lineHeight: 84,
  },
  tdeeUnit: {
    color: 'rgba(255,255,255,0.82)', fontSize: FONT_SIZE.md,
    fontFamily: FONT?.semibold, fontWeight: '700',
    marginLeft: 10,
  },
  tdeeDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginVertical: SPACING.lg },
  tdeeSplit: { flexDirection: 'row', alignItems: 'center' },
  tdeeSepVert: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.18)', marginHorizontal: SPACING.sm },
  tdeeSubLabel: {
    color: 'rgba(255,255,255,0.72)', fontSize: 10,
    fontFamily: FONT?.semibold, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  tdeeSubValue: { color: '#fff', fontFamily: FONT?.extra, fontWeight: '900', fontSize: FONT_SIZE.xl, marginTop: 4 },

  sectionBody: { fontSize: FONT_SIZE.sm, marginTop: 6, marginBottom: SPACING.md },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5,
  },
  chipActiveShadow: {
    shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  chipIcon: { fontSize: 14 },
  chipText: { fontFamily: FONT?.bold, fontWeight: '800', fontSize: FONT_SIZE.sm },

  tileRow: { flexDirection: 'row', gap: SPACING.sm },

  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
    padding: SPACING.md, marginTop: SPACING.lg,
    overflow: 'hidden',
  },
  infoStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: COLORS.primary },
  infoText: { flex: 1, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});

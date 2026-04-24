import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { useUser } from '../../store/UserContext';
import { calculateTDEE, calculateBmi, calculateBodyFatPercentage } from '../../utils/bmi';
import { FONT_SIZE, SPACING, COLORS, BORDER_RADIUS } from '../../constants/theme';
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

  const tdee = calculateTDEE(profile.weightKg, profile.heightCm, profile.age, profile.gender, activity);
  const bmi = calculateBmi(profile.weightKg, profile.heightCm);
  const bodyFat = calculateBodyFatPercentage(bmi.value, profile.age, profile.gender);
  const deficit = Math.max(tdee - 500, 1200);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, COLORS.accent]} style={styles.hero}>
        <Text style={styles.heroKicker}>{i18n.t('calories.heroKicker')}</Text>
        <Text style={styles.title}>{i18n.t('calories.title')}</Text>
        <Text style={styles.heroBody}>{i18n.t('calories.heroBody')}</Text>
      </LinearGradient>
      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.label, { color: colors.textSecondary }]}>{i18n.t('calories.maintenance')}</Text>
        <Text style={styles.value}>{tdee} <Text style={styles.unit}>{i18n.t('calories.kcalPerDay')}</Text></Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.label, { color: colors.textSecondary }]}>{i18n.t('calories.bmi')}</Text>
        <Text style={styles.value}>{bmi.value}</Text>
        <Text style={{ color: COLORS[bmi.category], fontWeight: '600' }}>{i18n.t(`profile.${bmi.category}`)}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.label, { color: colors.textSecondary }]}>{i18n.t('calories.bodyFat')}</Text>
        <Text style={styles.value}>{bodyFat.value}%</Text>
        <Text style={{ color: colors.textSecondary, fontWeight: '600', textTransform: 'capitalize' }}>
          {i18n.t(`calories.bodyFatCategories.${bodyFat.category}`)}
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.label, { color: colors.textSecondary }]}>{i18n.t('onboarding.setup.activityLevel')}</Text>
        <View style={styles.chipRow}>
          {OPTIONS.map((opt) => {
            const isActive = activity === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setActivity(opt)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? COLORS.primary : colors.cardAlt,
                    borderColor:     isActive ? COLORS.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: isActive ? '#fff' : colors.text }]}>
                  {i18n.t(`onboarding.setup.${opt}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.label, { color: colors.textSecondary }]}>{i18n.t('ui.weightLossTarget')}</Text>
        <Text style={styles.value}>{deficit} <Text style={styles.unit}>{i18n.t('calories.kcalPerDay')}</Text></Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingTop: 8, paddingBottom: 90 },
  hero: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg },
  heroKicker: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: '#fff', marginTop: 6 },
  heroBody: { color: 'rgba(255,255,255,0.9)', marginTop: SPACING.sm, fontSize: FONT_SIZE.md, lineHeight: 22 },
  card: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  label: { fontSize: FONT_SIZE.sm, marginBottom: SPACING.xs },
  value: { fontSize: FONT_SIZE.hero, fontWeight: 'bold', color: COLORS.primary },
  unit: { fontSize: FONT_SIZE.md, color: '#999' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: SPACING.sm },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  chipText: { fontWeight: '700', fontSize: FONT_SIZE.sm },
});

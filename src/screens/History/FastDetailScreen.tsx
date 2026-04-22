import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import i18n from '../../i18n';

export default function FastDetailScreen({ route }: any) {
  const { colors } = useTheme();
  useLanguage();
  const record = route?.params?.record ?? {
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    targetHours: 24,
    actualHours: 24,
    completed: true,
    notes: 'Sample fast record',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{i18n.t('history.fastDetails')}</Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.label, { color: colors.textSecondary }]}>{i18n.t('history.status')}</Text>
        <Text style={[styles.value, { color: COLORS.success }]}>{record.completed ? i18n.t('history.targetMet') : i18n.t('history.targetNotMet')}</Text>
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: SPACING.md }]}>{i18n.t('history.duration')}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{record.actualHours.toFixed(1)} {i18n.t('history.hours')}</Text>
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: SPACING.md }]}>{i18n.t('fasts.target')}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{record.targetHours} {i18n.t('history.hours')}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.label, { color: colors.textSecondary }]}>{i18n.t('history.notes')}</Text>
        <Text style={[styles.body, { color: colors.text }]}>{record.notes ?? i18n.t('history.noNotes')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingTop: 60 },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '800', marginBottom: SPACING.lg },
  card: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  value: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  body: { fontSize: FONT_SIZE.md, lineHeight: 22 },
});

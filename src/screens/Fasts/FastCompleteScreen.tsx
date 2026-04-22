import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import { FastRecord } from '../../types';
import i18n from '../../i18n';

const MOODS = ['😩', '😕', '😐', '😊', '😄'];

interface Props {
  record: FastRecord;
  onSave: (record: FastRecord, mood: string, notes: string) => void;
  onDiscard: () => void;
}

export default function FastCompleteScreen({ record, onSave, onDiscard }: Props) {
  const { colors } = useTheme();
  useLanguage();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const startDate = new Date(record.startTime);
  const endDate = new Date(record.endTime);
  const dateRange = `${startDate.toLocaleDateString(i18n.locale as string, { month: 'long', day: 'numeric' })} – ${endDate.toLocaleDateString(i18n.locale as string, { month: 'long', day: 'numeric' })}`;

  const formatHours = (h: number) => {
    if (h < 24) return `${h.toFixed(1)} ${i18n.t('history.hours')}`;
    const days = Math.floor(h / 24);
    const rem = h % 24;
    return rem > 0 ? `${days}d ${rem.toFixed(0)}h` : `${days} ${i18n.t('history.days')}`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* Hero header */}
      <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.hero}>
        <Text style={styles.heroEmoji}>🎉</Text>
        <Text style={styles.heroTitle}>
          {record.completed ? i18n.t('fastComplete.completedTitle') : i18n.t('fastComplete.endedTitle')}
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Date badge */}
        <View style={[styles.dateBadge, { backgroundColor: colors.cardAlt }]}>
          <Text style={[styles.dateText, { color: COLORS.primary }]}>{dateRange}</Text>
          <TouchableOpacity style={styles.shareBtn}>
            <Text style={{ fontSize: 18 }}>⬆</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{i18n.t('fastComplete.durationOfFast')}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatHours(record.actualHours)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{i18n.t('fastComplete.startedFasting')}</Text>
              <Text style={{ fontSize: 14 }}>✏️</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{i18n.t('fastComplete.endedFasting')}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {record.completed && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{i18n.t('fastComplete.targetReached')}</Text>
                <Text style={{ color: COLORS.success, fontWeight: '700', fontSize: FONT_SIZE.md }}>✓ {i18n.t('common.yes')}!</Text>
              </View>
            </>
          )}
        </View>

        {/* Mood selector */}
        <Text style={[styles.moodTitle, { color: colors.text }]}>{i18n.t('fastComplete.howFeeling')}</Text>
        <View style={styles.moodRow}>
          {MOODS.map((emoji, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.moodBtn,
                { backgroundColor: colors.surface },
                selectedMood === i && styles.moodBtnActive,
              ]}
              onPress={() => setSelectedMood(i)}
            >
              <Text style={styles.moodEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <TextInput
          style={[styles.notesInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder={i18n.t('fastComplete.notesPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.discardBtn, { borderColor: colors.border }]}
            onPress={onDiscard}
          >
            <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{i18n.t('common.delete')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onSave(record, MOODS[selectedMood ?? 2], notes)}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.saveBtn}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.md }}>{i18n.t('common.save')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingTop: 60, paddingBottom: SPACING.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  heroEmoji: { fontSize: 56, marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONT_SIZE.xxl, fontWeight: '800', color: '#fff',
    textAlign: 'center', lineHeight: 36,
  },

  body: { padding: SPACING.lg },

  dateBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  dateText: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  shareBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },

  statsCard: {
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm },
  statLabel: { fontSize: FONT_SIZE.md },
  statValue: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  divider: { height: 1, marginVertical: 2 },

  moodTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.md },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  moodBtn: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  moodBtnActive: { borderWidth: 2, borderColor: COLORS.primary },
  moodEmoji: { fontSize: 28 },

  notesInput: {
    borderRadius: BORDER_RADIUS.md, borderWidth: 1,
    padding: SPACING.md, fontSize: FONT_SIZE.md,
    minHeight: 80, textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },

  actionRow: { flexDirection: 'row', gap: SPACING.md },
  discardBtn: {
    flex: 1, borderRadius: BORDER_RADIUS.round, borderWidth: 1,
    padding: SPACING.md, alignItems: 'center',
  },
  saveBtn: {
    borderRadius: BORDER_RADIUS.round, padding: SPACING.md, alignItems: 'center',
  },
});

// FastCompleteScreen — premium "achievement" redesign.
// Same props/handlers as the original. Visual polish:
//  • Full-bleed gradient hero with confetti emoji & glowing trophy ring
//  • Glass-style stat card with iconified rows
//  • Larger emoji mood pills with active glow
//  • Notes input with floating label feel
//  • Sticky-feel CTA row with gradient save & ghost discard
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
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero header — deep navy → primary → accent gradient with halos */}
      <LinearGradient
        colors={['#0A1628', COLORS.primaryDark ?? '#0D3AA8', COLORS.primary]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroHaloOuter} />
        <View style={styles.heroHaloInner} />

        <View style={styles.trophyWrap}>
          <Text style={styles.heroEmoji}>🏆</Text>
        </View>

        <Text style={styles.heroKicker}>
          {record.completed ? i18n.t('fastComplete.targetReached') : i18n.t('fastComplete.endedTitle')}
        </Text>
        <Text style={styles.heroTitle}>
          {record.completed ? i18n.t('fastComplete.completedTitle') : i18n.t('fastComplete.endedTitle')}
        </Text>

        <View style={styles.heroDurationPill}>
          <Text style={styles.heroDurationText}>{formatHours(record.actualHours)}</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Date strip */}
        <View style={[styles.dateBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>{i18n.t('fastComplete.durationOfFast')}</Text>
          <Text style={[styles.dateText, { color: colors.text }]}>{dateRange}</Text>
          <TouchableOpacity style={[styles.shareBtn, { backgroundColor: COLORS.primary + '22' }]}>
            <Text style={{ fontSize: 16, color: COLORS.primary, fontWeight: '900' }}>↗</Text>
          </TouchableOpacity>
        </View>

        {/* Stats card */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <StatRow
            icon="⏱"
            label={i18n.t('fastComplete.durationOfFast')}
            value={formatHours(record.actualHours)}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatRow
            icon="▶"
            label={i18n.t('fastComplete.startedFasting')}
            value={startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatRow
            icon="■"
            label={i18n.t('fastComplete.endedFasting')}
            value={endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            colors={colors}
          />
          {record.completed && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.statRow}>
                <View style={styles.statLeft}>
                  <Text style={[styles.statIcon, { color: COLORS.success }]}>✓</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    {i18n.t('fastComplete.targetReached')}
                  </Text>
                </View>
                <View style={styles.successPill}>
                  <Text style={styles.successPillText}>{i18n.t('common.yes')}!</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Mood selector */}
        <Text style={[styles.sectionKicker, { color: colors.textSecondary }]}>HOW IT FELT</Text>
        <Text style={[styles.moodTitle, { color: colors.text }]}>{i18n.t('fastComplete.howFeeling')}</Text>
        <View style={styles.moodRow}>
          {MOODS.map((emoji, i) => {
            const active = selectedMood === i;
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.85}
                onPress={() => setSelectedMood(i)}
                style={[
                  styles.moodBtn,
                  {
                    backgroundColor: active ? COLORS.primary + '22' : colors.surface,
                    borderColor: active ? COLORS.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.moodEmoji, active && { transform: [{ scale: 1.15 }] }]}>{emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notes */}
        <Text style={[styles.sectionKicker, { color: colors.textSecondary, marginTop: SPACING.lg }]}>JOURNAL</Text>
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
            style={[styles.discardBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={onDiscard}
            activeOpacity={0.85}
          >
            <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: FONT_SIZE.md }}>
              {i18n.t('common.delete')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onSave(record, MOODS[selectedMood ?? 2], notes)}
            style={{ flex: 2 }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>{i18n.t('common.save')} ✦</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function StatRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statLeft}>
        <Text style={[styles.statIcon, { color: COLORS.primary }]}>{icon}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  hero: {
    paddingTop: 70, paddingBottom: 40, paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOpacity: 0.45, shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 }, elevation: 10,
  },
  heroHaloOuter: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(56,189,248,0.14)', top: -80,
  },
  heroHaloInner: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)', top: 30,
  },
  trophyWrap: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroEmoji: { fontSize: 52 },
  heroKicker: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: FONT_SIZE.xs, fontWeight: '900',
    letterSpacing: 3, textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 32, fontWeight: '900', color: '#fff',
    textAlign: 'center', lineHeight: 38, letterSpacing: -0.5,
  },
  heroDurationPill: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999,
  },
  heroDurationText: { color: '#fff', fontWeight: '900', fontSize: FONT_SIZE.md, letterSpacing: 0.3 },

  body: { padding: SPACING.lg, marginTop: -16 },

  dateBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    marginBottom: SPACING.md, gap: SPACING.sm,
  },
  dateLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  dateText: { fontSize: FONT_SIZE.sm, fontWeight: '700', flex: 1 },
  shareBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  statsCard: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.md,
    borderWidth: 1, marginBottom: SPACING.lg,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm,
  },
  statLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIcon: { fontSize: 16, fontWeight: '900', width: 22, textAlign: 'center' },
  statLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  statValue: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  divider: { height: 1, opacity: 0.6 },

  successPill: {
    backgroundColor: COLORS.success + '22',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
  },
  successPillText: { color: COLORS.success, fontWeight: '900', fontSize: FONT_SIZE.sm },

  sectionKicker: {
    fontSize: 10, fontWeight: '900', letterSpacing: 1.5,
    marginBottom: 6,
  },
  moodTitle: { fontSize: FONT_SIZE.lg, fontWeight: '900', marginBottom: SPACING.md, letterSpacing: -0.3 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  moodBtn: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  moodEmoji: { fontSize: 30 },

  notesInput: {
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
    padding: SPACING.md, fontSize: FONT_SIZE.md,
    minHeight: 96, textAlignVertical: 'top',
    marginTop: 6, marginBottom: SPACING.lg,
  },

  actionRow: { flexDirection: 'row', gap: SPACING.md },
  discardBtn: {
    flex: 1, borderRadius: BORDER_RADIUS.round, borderWidth: 1,
    paddingVertical: 16, alignItems: 'center',
  },
  saveBtn: {
    borderRadius: BORDER_RADIUS.round, paddingVertical: 16, alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: FONT_SIZE.md, letterSpacing: 0.3 },
});

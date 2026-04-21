import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useFasts } from '../../store/FastsContext';
import { FastRecord } from '../../types';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';

// Format hours into a human-readable label
function fmtHours(h: number): string {
  if (h < 1)  return `${Math.round(h * 60)}m`;
  if (h < 24) return `${Number(h.toFixed(1))}h`;
  const days = Math.floor(h / 24);
  const rem  = Math.round(h % 24);
  return rem > 0 ? `${days}d ${rem}h` : `${days}d`;
}

// Count consecutive days (backwards from today) that had at least one fast
function calcStreak(fasts: FastRecord[]): number {
  if (!fasts.length) return 0;
  const dates = new Set(fasts.map((f) => f.startTime.slice(0, 10)));
  const today = new Date();
  let streak = 0;
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dates.has(key)) {
      streak++;
    } else if (i > 0) {
      break; // gap found — streak ends
    }
  }
  return streak;
}

// Build a calendar grid for the current month
function buildCalendar(fasts: FastRecord[]) {
  const fastDates = new Set(fasts.map((f) => f.startTime.slice(0, 10)));
  const today     = new Date();
  const year      = today.getFullYear();
  const month     = today.getMonth();
  const firstDow  = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMo  = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ day: number | null; isFast: boolean; isToday: boolean }> = [];
  for (let i = 0; i < firstDow; i++) cells.push({ day: null, isFast: false, isToday: false });
  for (let d = 1; d <= daysInMo; d++) {
    const pad  = (n: number) => String(n).padStart(2, '0');
    const key  = `${year}-${pad(month + 1)}-${pad(d)}`;
    cells.push({ day: d, isFast: fastDates.has(key), isToday: d === today.getDate() });
  }
  return cells;
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function HistoryScreen() {
  const { colors }    = useTheme();
  const navigation    = useNavigation<any>();
  const { fasts }     = useFasts();

  const stats = useMemo(() => {
    const longest    = fasts.length ? Math.max(...fasts.map((f) => f.actualHours)) : 0;
    const streak     = calcStreak(fasts);
    const totalHours = fasts.reduce((sum, f) => sum + f.actualHours, 0);
    return {
      longest:    fmtHours(longest),
      streak:     String(streak),
      total:      String(fasts.length),
      totalHours: fmtHours(totalHours),
    };
  }, [fasts]);

  const calendarCells = useMemo(() => buildCalendar(fasts), [fasts]);

  const today = new Date();
  const monthLabel = `${MONTH_LABELS[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[COLORS.mist, '#D9EBFF', '#EAF6FF']} style={StyleSheet.absoluteFillObject} />
      <View pointerEvents="none" style={styles.orbTop} />
      <View pointerEvents="none" style={styles.orbBottom} />

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={[COLORS.primaryDark, COLORS.gradientStart, COLORS.gradientEnd]} style={styles.hero}>
          <Text style={styles.heroKicker}>Fast history</Text>
          <Text style={styles.title}>Your journey</Text>
          <Text style={styles.heroBody}>A cleaner timeline of streaks, milestones, and completed fasts.</Text>
        </LinearGradient>

        {/* Stats grid — 2 × 2 */}
        <View style={styles.summaryGrid}>
          {[
            { label: 'Longest Fast', value: stats.longest },
            { label: 'Streak',       value: `${stats.streak}d` },
            { label: 'Total Fasts',  value: stats.total },
            { label: 'Total Hours',  value: stats.totalHours },
          ].map((item) => (
            <View key={item.label} style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{item.value}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Calendar */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{monthLabel}</Text>
          {/* Day-of-week header */}
          <View style={styles.calendarHeader}>
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <Text key={i} style={[styles.calDow, { color: colors.textSecondary }]}>{d}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {calendarCells.map((cell, i) => (
              <View
                key={i}
                style={[
                  styles.calendarCell,
                  cell.isFast  && { backgroundColor: COLORS.primary },
                  cell.isToday && !cell.isFast && { borderColor: COLORS.primary, borderWidth: 1.5 },
                  !cell.day    && { backgroundColor: 'transparent', borderColor: 'transparent' },
                ]}
              >
                {cell.day != null && (
                  <Text style={[styles.calDayNum, { color: cell.isFast ? '#fff' : colors.text }]}>
                    {cell.day}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Fast list */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent fasts</Text>
          {fasts.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No fasts recorded yet. Start your first fast!</Text>
          ) : (
            fasts.slice(0, 20).map((fast) => (
              <TouchableOpacity
                key={fast.id}
                style={[styles.fastRow, { borderBottomColor: colors.border }]}
                onPress={() => navigation.navigate('FastDetail', { record: fast })}
              >
                <View>
                  <Text style={[styles.fastTitle, { color: colors.text }]}>{fast.name ?? `${fast.targetHours}h Fast`}</Text>
                  <Text style={[styles.fastSub, { color: colors.textSecondary }]}>
                    {new Date(fast.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.fastValue, { color: fast.completed ? COLORS.success : COLORS.warning }]}>
                    {fmtHours(fast.actualHours)}
                  </Text>
                  <Text style={[styles.fastSub, { color: colors.textSecondary }]}>
                    {fast.completed ? 'Completed ✓' : 'Partial'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orbTop: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(97,168,255,0.28)', top: -110, right: -80,
  },
  orbBottom: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(147,230,255,0.2)', bottom: -140, left: -90,
  },
  content:    { padding: SPACING.lg, paddingTop: 8, paddingBottom: 90 },
  hero:       { borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, shadowColor: '#2A84E2', shadowOpacity: 0.24, shadowRadius: 16, elevation: 8 },
  heroKicker: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  title:      { fontSize: FONT_SIZE.xxl, fontWeight: '900', marginTop: 6, color: '#fff' },
  heroBody:   { color: 'rgba(255,255,255,0.9)', marginTop: SPACING.sm, fontSize: FONT_SIZE.md, lineHeight: 22 },

  summaryGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  summaryCard:  { width: '47.5%', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, alignItems: 'center', borderWidth: 1, shadowColor: '#1A4D93', shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
  summaryValue: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  summaryLabel: { fontSize: FONT_SIZE.sm, marginTop: 4 },

  card:         { borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1, shadowColor: '#1A4D93', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.md },

  calendarHeader: { flexDirection: 'row', marginBottom: 6 },
  calDow:         { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  calendarGrid:   { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell:   { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#E8F2FF', borderWidth: 1, borderColor: 'rgba(30,99,233,0.08)', marginBottom: 4 },
  calDayNum:      { fontSize: 11, fontWeight: '700' },

  fastRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1 },
  fastTitle: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  fastSub:   { fontSize: FONT_SIZE.sm, marginTop: 4 },
  fastValue: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  emptyText: { fontSize: FONT_SIZE.md, textAlign: 'center', paddingVertical: SPACING.lg, lineHeight: 24 },
});

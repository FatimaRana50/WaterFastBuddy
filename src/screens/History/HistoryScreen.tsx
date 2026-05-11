import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { useFasts } from '../../store/FastsContext';
import { FastRecord } from '../../types';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Starfield from '../../components/Starfield';
import Headline from '../../components/Headline';
import Kicker from '../../components/Kicker';
import StatTile from '../../components/StatTile';
import i18n from '../../i18n';

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
  const { colors, theme } = useTheme();
  const navigation    = useNavigation<any>();
  const { fasts }     = useFasts();
  useLanguage();
  const isDark = theme === 'dark';

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

  // Entrance animation for list
  const listAnim = useRef(new Animated.Value(0)).current;
  const itemScales = useRef(Array.from({ length: 20 }, () => new Animated.Value(1))).current;
  useEffect(() => {
    Animated.timing(listAnim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, []);

  // Top-5 performance bars
  const top5 = useMemo(() => {
    return [...fasts].sort((a, b) => b.actualHours - a.actualHours).slice(0, 5);
  }, [fasts]);
  const topMax = Math.max(1, ...(top5.map(f => f.actualHours)));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Starfield density={0.08} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Editorial hero */}
        <View style={styles.heroBlock}>
          <Kicker>History</Kicker>
          <View style={{ marginTop: 10 }}>
            <Headline line1="Every hour" line2="counts." size={34} />
          </View>
          <Text style={[styles.heroLead, { color: colors.textSecondary }]}>
            {fasts.length > 0
              ? `${stats.total} fasts · ${stats.totalHours} logged this year.`
              : i18n.t('history.noHistory')}
          </Text>
        </View>

        {/* Stat tile row */}
        <View style={styles.statRow}>
          <StatTile icon="flame-outline"      value={`${stats.streak}d`} label="Streak"    style={{ flex: 1 }} />
          <StatTile icon="trophy-outline"     value={stats.longest}      label="Longest"   accent={COLORS.accent}  style={{ flex: 1 }} />
          <StatTile icon="checkmark-outline"  value={stats.total}        label="Completed" accent={COLORS.success} style={{ flex: 1 }} />
        </View>

        {/* Performance graph: recent fast durations */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>
          <PerformanceGraph fasts={fasts} accent={COLORS.primary} textColor={colors.textSecondary} />
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
                  { backgroundColor: colors.cardAlt, borderColor: colors.border },
                  cell.isFast  && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('history.listView')}</Text>

          {/* Top-5 bar graph */}
          {top5.length > 0 && (
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={[styles.sectionSub, { color: colors.textSecondary, marginBottom: 8 }]}>Top 5 longest fasts</Text>
              <View style={styles.barChartRow}>
                {top5.map((f, i) => {
                  const h = Math.round((f.actualHours / topMax) * 120);
                  const label = fmtHours(f.actualHours);
                  const date = new Date(f.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                  return (
                    <TouchableOpacity key={f.id} style={styles.barCol} onPress={() => navigation.navigate('FastDetail', { record: f })} activeOpacity={0.85}>
                      <Text style={[styles.barTopLabel, { color: colors.text }]}>{label}</Text>
                      <View style={styles.barWrap}>
                        <View style={[styles.barFill, { height: h, backgroundColor: COLORS.primary }]} />
                      </View>
                      <Text style={[styles.barBottomLabel, { color: colors.textSecondary }]}>{date}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
          {fasts.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{i18n.t('history.noHistory')}</Text>
          ) : (
            fasts.slice(0, 20).map((fast, idx) => (
              <Animated.View
                key={fast.id}
                style={{
                  opacity: listAnim,
                  transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
                }}
              >
                <TouchableOpacity
                  style={[styles.fastRow, { borderBottomColor: colors.border }]}
                  onPress={() => navigation.navigate('FastDetail', { record: fast })}
                  onPressIn={() => Animated.spring(itemScales[idx], { toValue: 0.96, useNativeDriver: true }).start()}
                  onPressOut={() => Animated.spring(itemScales[idx], { toValue: 1, useNativeDriver: true }).start()}
                >
                  <Animated.View style={{ transform: [{ scale: itemScales[idx] }] , flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        {fast.completed ? `${i18n.t('history.targetMet')} ✓` : i18n.t('history.targetNotMet')}
                      </Text>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function PerformanceGraph({ fasts, accent, textColor }: { fasts: FastRecord[]; accent: string; textColor: string }) {
  const recent = fasts.slice(-12);
  if (!recent.length) {
    return <Text style={{ color: textColor, paddingVertical: 12 }}>{'No data yet'}</Text>;
  }

  const values = recent.map((f) => f.actualHours);
  const maxV = Math.max(...values);
  const minV = Math.min(...values);
  const range = Math.max(0.1, maxV - minV);
  const width = 300;
  const height = 80;
  const padX = 12;
  const step = (width - padX * 2) / Math.max(1, values.length - 1);

  const points = values.map((v, i) => {
    const x = padX + i * step;
    const y = height - ((v - minV) / range) * (height - 12) - 6;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={{ paddingVertical: 8 }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* baseline grid */}
        <Line x1={padX} y1={height - 6} x2={width - padX} y2={height - 6} stroke={textColor} strokeOpacity={0.06} strokeWidth={1} />
        {/* polyline */}
        <Polyline points={points} fill="none" stroke={accent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        {/* dots */}
        {values.map((v, i) => {
          const x = padX + i * step;
          const y = height - ((v - minV) / range) * (height - 12) - 6;
          return <Circle key={i} cx={x} cy={y} r={2.8} fill={accent} />;
        })}
      </Svg>
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
  content:    { padding: SPACING.lg, paddingTop: 8, paddingBottom: 120 },

  heroBlock: { marginTop: SPACING.md, marginBottom: SPACING.lg },
  heroLead:  { fontSize: FONT_SIZE.sm, lineHeight: 20, marginTop: SPACING.md, maxWidth: 320 },
  statRow:   { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
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
  calendarCell:   { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, marginBottom: 4 },
  calDayNum:      { fontSize: 11, fontWeight: '700' },

  fastRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1 },
  fastTitle: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  fastSub:   { fontSize: FONT_SIZE.sm, marginTop: 4 },
  fastValue: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  emptyText: { fontSize: FONT_SIZE.md, textAlign: 'center', paddingVertical: SPACING.lg, lineHeight: 24 },
  sectionSub: { fontSize: FONT_SIZE.sm, marginBottom: 6 },

  /* Bar chart */
  barChartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barCol: { width: 52, alignItems: 'center' },
  barWrap: { width: 36, height: 120, borderRadius: 8, backgroundColor: 'transparent', justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: 36, borderRadius: 8 },
  barTopLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  barBottomLabel: { fontSize: 11, marginTop: 8 },
});

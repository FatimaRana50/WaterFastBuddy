import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Polyline, Polygon, Circle, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { useFasts } from '../../store/FastsContext';
import { FastRecord } from '../../types';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Headline from '../../components/Headline';
import Kicker from '../../components/Kicker';
import StatTile from '../../components/StatTile';
import i18n from '../../i18n';

// ---------- helpers (unchanged logic) ----------
function fmtHours(h: number): string {
  if (h < 1)  return `${Math.round(h * 60)}m`;
  if (h < 24) return `${Number(h.toFixed(1))}h`;
  const days = Math.floor(h / 24);
  const rem  = Math.round(h % 24);
  return rem > 0 ? `${days}d ${rem}h` : `${days}d`;
}

function calcStreak(fasts: FastRecord[]): number {
  if (!fasts.length) return 0;
  const dates = new Set(fasts.map((f) => f.startTime.slice(0, 10)));
  const today = new Date();
  let streak = 0;
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dates.has(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function buildCalendar(fasts: FastRecord[]) {
  const fastDates = new Map<string, number>();
  fasts.forEach((f) => {
    const k = f.startTime.slice(0, 10);
    fastDates.set(k, (fastDates.get(k) ?? 0) + f.actualHours);
  });
  const today     = new Date();
  const year      = today.getFullYear();
  const month     = today.getMonth();
  const firstDow  = new Date(year, month, 1).getDay();
  const daysInMo  = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ day: number | null; isFast: boolean; isToday: boolean; intensity: number }> = [];
  for (let i = 0; i < firstDow; i++) cells.push({ day: null, isFast: false, isToday: false, intensity: 0 });
  for (let d = 1; d <= daysInMo; d++) {
    const pad  = (n: number) => String(n).padStart(2, '0');
    const key  = `${year}-${pad(month + 1)}-${pad(d)}`;
    const hrs  = fastDates.get(key) ?? 0;
    // intensity 0..4 (GitHub-style heatmap)
    let intensity = 0;
    if (hrs > 0)  intensity = 1;
    if (hrs >= 12) intensity = 2;
    if (hrs >= 18) intensity = 3;
    if (hrs >= 24) intensity = 4;
    cells.push({ day: d, isFast: hrs > 0, isToday: d === today.getDate(), intensity });
  }
  return cells;
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];


// ---------- live pulse dot ----------
function LivePulse({ color = COLORS.primary }: { color?: string }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const opacity = a.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  return (
    <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: color, opacity, transform: [{ scale }] }} />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

// ---------- main screen ----------
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

  // Entrance animations
  const listAnim   = useRef(new Animated.Value(0)).current;
  const heroAnim   = useRef(new Animated.Value(0)).current;
  const itemScales = useRef(Array.from({ length: 20 }, () => new Animated.Value(1))).current;
  const cellScales = useRef(Array.from({ length: 42 }, () => new Animated.Value(1))).current;
  const barGrowth  = useRef(new Animated.Value(0)).current;
  const scrollY    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(listAnim, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(barGrowth, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
  }, []);

  const top5 = useMemo(() => {
    return [...fasts].sort((a, b) => b.actualHours - a.actualHours).slice(0, 5);
  }, [fasts]);
  const topMax = Math.max(1, ...(top5.map(f => f.actualHours)));

  const heroTranslate = heroAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const heroParallax  = scrollY.interpolate({ inputRange: [-100, 0, 200], outputRange: [20, 0, -30], extrapolate: 'clamp' });

  // Heatmap intensity → color
  const heatColor = (lvl: number) => {
    if (lvl === 0) return colors.cardAlt;
    const opacity = 0.25 + lvl * 0.18; // 0.43..0.97
    return `rgba(42,132,226,${opacity})`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
        {/* ===== Editorial hero ===== */}
        <Animated.View style={[styles.heroBlock, { opacity: heroAnim, transform: [{ translateY: heroTranslate }, { translateY: heroParallax }] }]}>
          {/* ambient blurred glow behind headline */}
          <LinearGradient
            colors={['rgba(97,168,255,0.35)', 'rgba(147,230,255,0.08)', 'transparent']}
            start={{ x: 0.2, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroGlow}
          />
          <Kicker>History</Kicker>
          <View style={{ marginTop: 10 }}>
            <Headline line1="Every hour" line2="counts." size={34} />
          </View>
          <View style={styles.heroLeadRow}>
            <LivePulse color={COLORS.primary} />
            <Text style={[styles.heroLead, { color: colors.textSecondary }]}>
              {fasts.length > 0
                ? `${stats.total} fasts · ${stats.totalHours} logged this year.`
                : i18n.t('history.noHistory')}
            </Text>
          </View>
          {fasts.length > 0 && (
            <Text style={[styles.heroMicro, { color: colors.textSecondary }]}>
              Consistency builds transformation — keep your streak alive.
            </Text>
          )}
        </Animated.View>

        {/* ===== Stat tiles ===== */}
        <View style={styles.statRow}>
          <StatTile icon="flame-outline"      value={`${stats.streak}d`} label="Streak"    style={{ flex: 1 }} />
          <StatTile icon="trophy-outline"     value={stats.longest}      label="Longest"   accent={COLORS.accent}  style={{ flex: 1 }} />
          <StatTile icon="checkmark-outline"  value={stats.total}        label="Completed" accent={COLORS.success} style={{ flex: 1 }} />
        </View>

        {/* ===== Performance graph ===== */}
        <View style={[styles.card, styles.glassCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <LinearGradient
            colors={['rgba(97,168,255,0.08)', 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill as any}
          />
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>
            <View style={[styles.tagPill, { borderColor: colors.border }]}>
              <Text style={[styles.tagPillText, { color: colors.textSecondary }]}>Last 12</Text>
            </View>
          </View>
          <PerformanceGraph fasts={fasts} accent={COLORS.primary} textColor={colors.textSecondary} />
        </View>

        {/* ===== Calendar (heatmap) ===== */}
        <View style={[styles.card, styles.glassCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{monthLabel}</Text>
            <View style={styles.legendRow}>
              {[0,1,2,3,4].map(l => (
                <View key={l} style={[styles.legendDot, { backgroundColor: heatColor(l), borderColor: colors.border }]} />
              ))}
            </View>
          </View>

          <View style={styles.calendarHeader}>
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <Text key={i} style={[styles.calDow, { color: colors.textSecondary }]}>{d}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {calendarCells.map((cell, i) => {
              const bg = cell.isFast ? heatColor(cell.intensity) : colors.cardAlt;
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.calendarCell,
                    { backgroundColor: bg, borderColor: colors.border, transform: [{ scale: cellScales[i] ?? 1 }] },
                    cell.isToday && { borderColor: COLORS.primary, borderWidth: 1.5 },
                    !cell.day    && { backgroundColor: 'transparent', borderColor: 'transparent' },
                  ]}
                >
                  {cell.day != null && (
                    <Text style={[styles.calDayNum, { color: cell.intensity >= 3 ? '#fff' : colors.text }]}>
                      {cell.day}
                    </Text>
                  )}
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* ===== Fast list card ===== */}
        <View style={[styles.card, styles.glassCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('history.listView')}</Text>

          {/* Top-5 bar graph */}
          {top5.length > 0 && (
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={[styles.sectionSub, { color: colors.textSecondary, marginBottom: 8 }]}>Top 5 longest fasts</Text>
              <View style={styles.barChartRow}>
                {top5.map((f, i) => {
                  const target = Math.round((f.actualHours / topMax) * 120);
                  const animH = barGrowth.interpolate({ inputRange: [0, 1], outputRange: [0, target] });
                  const label = fmtHours(f.actualHours);
                  const date = new Date(f.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                  return (
                    <TouchableOpacity key={f.id} style={styles.barCol} onPress={() => navigation.navigate('FastDetail', { record: f })} activeOpacity={0.85}>
                      <Text style={[styles.barTopLabel, { color: colors.text }]}>{label}</Text>
                      <View style={styles.barWrap}>
                        <Animated.View style={{ width: 36, height: animH, borderRadius: 10, overflow: 'hidden' }}>
                          <LinearGradient
                            colors={[COLORS.primary, COLORS.accent ?? COLORS.primary]}
                            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                            style={{ flex: 1, borderRadius: 10 }}
                          />
                        </Animated.View>
                      </View>
                      <View style={styles.rankPill}>
                        <Text style={styles.rankPillText}>#{i + 1}</Text>
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
            fasts.slice(0, 20).map((fast, idx) => {
              const stagger = listAnim.interpolate({ inputRange: [0, 1], outputRange: [12 + idx * 2, 0] });
              return (
                <Animated.View
                  key={fast.id}
                  style={{
                    opacity: listAnim,
                    transform: [{ translateY: stagger }],
                    marginBottom: 10,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('FastDetail', { record: fast })}
                    onPressIn={() => Animated.spring(itemScales[idx], { toValue: 0.97, useNativeDriver: true }).start()}
                    onPressOut={() => Animated.spring(itemScales[idx], { toValue: 1, useNativeDriver: true }).start()}
                  >
                    <Animated.View
                      style={[
                        styles.fastCard,
                        { backgroundColor: colors.cardAlt, borderColor: colors.border, transform: [{ scale: itemScales[idx] }] },
                      ]}
                    >
                      <View style={[styles.fastAccent, { backgroundColor: fast.completed ? COLORS.success : COLORS.warning }]} />
                      <View style={{ flex: 1, paddingLeft: 14 }}>
                        <Text style={[styles.fastTitle, { color: colors.text }]}>{fast.name ?? `${fast.targetHours}h Fast`}</Text>
                        <Text style={[styles.fastSub, { color: colors.textSecondary }]}>
                          {new Date(fast.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                        <View style={[styles.durationBadge, { backgroundColor: (fast.completed ? COLORS.success : COLORS.warning) + '22' }]}>
                          <Text style={[styles.fastValue, { color: fast.completed ? COLORS.success : COLORS.warning }]}>
                            {fmtHours(fast.actualHours)}
                          </Text>
                        </View>
                        <Text style={[styles.fastSub, { color: colors.textSecondary, marginTop: 4 }]}>
                          {fast.completed ? `${i18n.t('history.targetMet')} ✓` : i18n.t('history.targetNotMet')}
                        </Text>
                      </View>
                      <Text style={[styles.chev, { color: colors.textSecondary }]}>›</Text>
                    </Animated.View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// ---------- premium performance graph ----------
function PerformanceGraph({ fasts, accent, textColor }: { fasts: FastRecord[]; accent: string; textColor: string }) {
  const recent = fasts.slice(-12);
  const reveal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(reveal, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [recent.length]);

  if (!recent.length) {
    return <Text style={{ color: textColor, paddingVertical: 12 }}>{'No data yet'}</Text>;
  }

  const values = recent.map((f) => f.actualHours);
  const maxV = Math.max(...values);
  const minV = Math.min(...values);
  const range = Math.max(0.1, maxV - minV);
  const width = 300;
  const height = 110;
  const padX = 14;
  const step = (width - padX * 2) / Math.max(1, values.length - 1);

  const pts = values.map((v, i) => {
    const x = padX + i * step;
    const y = height - ((v - minV) / range) * (height - 20) - 10;
    return { x, y, v };
  });

  // smooth curve via quadratic-ish polyline (cheap smoothing)
  const linePoints = pts.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${padX},${height - 4} ${linePoints} ${width - padX},${height - 4}`;

  const maxIdx = values.indexOf(maxV);
  const minIdx = values.indexOf(minV);

  return (
    <Animated.View style={{ paddingVertical: 8, opacity: reveal, transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <SvgLinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={accent} stopOpacity="0.45" />
            <Stop offset="1" stopColor={accent} stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>

        {/* horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((t, i) => (
          <Line key={i} x1={padX} y1={height * t} x2={width - padX} y2={height * t} stroke={textColor} strokeOpacity={0.06} strokeWidth={1} />
        ))}
        <Line x1={padX} y1={height - 6} x2={width - padX} y2={height - 6} stroke={textColor} strokeOpacity={0.1} strokeWidth={1} />

        {/* area gradient under line */}
        <Polygon points={areaPoints} fill="url(#areaGrad)" />

        {/* line */}
        <Polyline points={linePoints} fill="none" stroke={accent} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />

        {/* dots with glow */}
        {pts.map((p, i) => (
          <React.Fragment key={i}>
            {(i === maxIdx || i === minIdx) && (
              <Circle cx={p.x} cy={p.y} r={7} fill={accent} fillOpacity={0.18} />
            )}
            <Circle cx={p.x} cy={p.y} r={3} fill={accent} />
          </React.Fragment>
        ))}
      </Svg>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 4 }}>
        <Text style={{ color: textColor, fontSize: 11 }}>Min {fmtHours(minV)}</Text>
        <Text style={{ color: textColor, fontSize: 11 }}>Max {fmtHours(maxV)}</Text>
      </View>
    </Animated.View>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { padding: SPACING.lg, paddingTop: 8, paddingBottom: 140 },

  heroBlock: { marginTop: SPACING.md, marginBottom: SPACING.lg, position: 'relative' },
  heroGlow:  {
    position: 'absolute', top: -40, left: -40, right: -40, height: 220,
    borderRadius: 200, opacity: 0.9,
  },
  heroLeadRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: SPACING.md },
  heroLead:    { fontSize: FONT_SIZE.sm, lineHeight: 20, flex: 1 },
  heroMicro:   { fontSize: 11, marginTop: 8, opacity: 0.7, letterSpacing: 0.3, fontStyle: 'italic' },

  statRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },

  card: {
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg,
    borderWidth: 1, shadowColor: '#1A4D93', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
    elevation: 3, overflow: 'hidden',
  },
  glassCard: {
    // subtle glassy depth (preserves theme bg)
  },

  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle:    { fontSize: FONT_SIZE.lg, fontWeight: '800', letterSpacing: 0.2 },
  sectionSub:      { fontSize: FONT_SIZE.sm },

  tagPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  tagPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },

  legendRow: { flexDirection: 'row', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 3, borderWidth: 1 },

  calendarHeader: { flexDirection: 'row', marginBottom: 6 },
  calDow:         { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  calendarGrid:   { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell:   {
    width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, borderWidth: 1, marginBottom: 4,
  },
  calDayNum:      { fontSize: 11, fontWeight: '700' },

  // Fast list card rows
  fastCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BORDER_RADIUS.md, borderWidth: 1,
    paddingVertical: 14, paddingHorizontal: 12,
    shadowColor: '#1A4D93', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1,
    overflow: 'hidden',
  },
  fastAccent: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: BORDER_RADIUS.md, borderBottomLeftRadius: BORDER_RADIUS.md,
  },
  fastTitle: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  fastSub:   { fontSize: FONT_SIZE.sm, marginTop: 2 },
  fastValue: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  durationBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chev: { fontSize: 28, fontWeight: '300', marginLeft: 4, opacity: 0.5 },

  emptyText: { fontSize: FONT_SIZE.md, textAlign: 'center', paddingVertical: SPACING.lg, lineHeight: 24 },

  /* Bar chart */
  barChartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barCol: { width: 52, alignItems: 'center' },
  barWrap: { width: 36, height: 120, borderRadius: 10, justifyContent: 'flex-end', overflow: 'hidden', backgroundColor: 'rgba(127,127,127,0.06)' },
  barTopLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  barBottomLabel: { fontSize: 11, marginTop: 6 },
  rankPill: {
    marginTop: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999,
    backgroundColor: 'rgba(42,132,226,0.15)',
  },
  rankPillText: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.4 },
});

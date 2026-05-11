// FastDetailScreen — premium readout for a single completed fast.
// Same props/handlers as the original. Visual polish:
//  • Hero card with gradient + status chip
//  • Stat tiles (duration, target, status) in a 3-up grid
//  • Notes card with leading quote mark
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  const start = new Date(record.startTime);
  const end   = new Date(record.endTime);
  const dateLine = `${start.toLocaleDateString(i18n.locale as string, { month: 'short', day: 'numeric' })} → ${end.toLocaleDateString(i18n.locale as string, { month: 'short', day: 'numeric' })}`;
  const statusColor = record.completed ? COLORS.success : COLORS.warning ?? '#F59E0B';

  // Entrance animations
  const heroAnim = useRef(new Animated.Value(0)).current;
  const notesAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 480, useNativeDriver: true }).start();
    Animated.timing(notesAnim, { toValue: 1, duration: 380, delay: 140, useNativeDriver: true }).start();
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero gradient card */}
      <Animated.View style={{ opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
        <LinearGradient
          colors={['#0A1628', COLORS.primaryDark ?? '#0D3AA8', COLORS.primary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroKicker}>{i18n.t('history.fastDetails')}</Text>
          <Text style={styles.heroTitle}>{record.actualHours.toFixed(1)}<Text style={styles.heroUnit}>h</Text></Text>
          <Text style={styles.heroSub}>{dateLine}</Text>

          <View style={styles.statusChip}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={styles.statusText}>
              {record.completed ? i18n.t('history.targetMet') : i18n.t('history.targetNotMet')}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Stat tiles */}
      <View style={styles.tileRow}>
        <Tile colors={colors} label={i18n.t('history.duration')}     value={`${record.actualHours.toFixed(1)}h`} accent={COLORS.accent} />
        <Tile colors={colors} label={i18n.t('fasts.target')}         value={`${record.targetHours}h`}            accent={COLORS.primary} />
        <Tile colors={colors} label={i18n.t('history.status')}       value={record.completed ? '✓' : '⚠'}        accent={statusColor} />
      </View>

      {/* Notes card */}
      <Animated.View style={{ opacity: notesAnim, transform: [{ translateY: notesAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardKicker, { color: colors.textSecondary }]}>{i18n.t('history.notes')}</Text>
          <Text style={[styles.quoteMark, { color: COLORS.primary + '60' }]}>“</Text>
          <Text style={[styles.notesText, { color: colors.text }]}>
            {record.notes ?? i18n.t('history.noNotes')}
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function Tile({ colors, label, value, accent }: { colors: any; label: string; value: string; accent: string }) {
  return (
    <View style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.tileAccent, { backgroundColor: accent }]} />
      <Text style={[styles.tileValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.xxl },

  hero: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl,
    marginBottom: SPACING.lg, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOpacity: 0.35, shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 }, elevation: 8,
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: FONT_SIZE.xs, fontWeight: '900',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff', fontSize: 64, fontWeight: '900',
    marginTop: 6, letterSpacing: -2, lineHeight: 64,
  },
  heroUnit: { fontSize: 28, fontWeight: '800', color: 'rgba(255,255,255,0.78)' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZE.md, marginTop: 4, fontWeight: '600' },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start', marginTop: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: '#fff', fontSize: FONT_SIZE.sm, fontWeight: '800' },

  tileRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  tile: {
    flex: 1, borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
    padding: SPACING.md, overflow: 'hidden',
  },
  tileAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
  },
  tileValue: { fontSize: FONT_SIZE.xl, fontWeight: '900', marginTop: 6 },
  tileLabel: { fontSize: FONT_SIZE.xs, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8 },

  card: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, marginBottom: SPACING.md,
  },
  cardKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  quoteMark: { fontSize: 56, fontWeight: '900', lineHeight: 56, marginTop: -4 },
  notesText: { fontSize: FONT_SIZE.md, lineHeight: 24, marginTop: -8 },
});

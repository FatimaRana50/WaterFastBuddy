import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import i18n from '../../i18n';

const SAMPLE_FASTS = [
  { id: '1', date: 'Apr 18', hours: 16, completed: true, label: '16:8 Fast' },
  { id: '2', date: 'Apr 16', hours: 24, completed: true, label: '24 Hour Fast' },
  { id: '3', date: 'Apr 13', hours: 4, completed: false, label: 'Stopped early' },
];

export default function HistoryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[COLORS.mist, '#D9EBFF', '#EAF6FF']} style={StyleSheet.absoluteFillObject} />
      <View pointerEvents="none" style={styles.orbTop} />
      <View pointerEvents="none" style={styles.orbBottom} />

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={[COLORS.primaryDark, COLORS.gradientStart, COLORS.gradientEnd]} style={styles.hero}>
          <Text style={styles.heroKicker}>Fast history</Text>
          <Text style={styles.title}>{i18n.t('history.title')}</Text>
          <Text style={styles.heroBody}>A cleaner timeline of streaks, milestones, and completed fasts.</Text>
        </LinearGradient>

        <View style={styles.summaryRow}>
          {[
            { label: 'Longest', value: '24h' },
            { label: 'Streak', value: '3' },
            { label: 'Total', value: '12' },
          ].map((item) => (
            <View key={item.label} style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{item.value}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Calendar</Text>
          <View style={styles.calendarGrid}>
            {Array.from({ length: 35 }).map((_, index) => (
              <View key={index} style={[styles.calendarCell, index % 6 === 0 && { backgroundColor: COLORS.primary + '20' }]} />
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent fasts</Text>
          {SAMPLE_FASTS.map((fast) => (
            <TouchableOpacity key={fast.id} style={[styles.fastRow, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('FastDetail', { record: fast })}>
              <View>
                <Text style={[styles.fastTitle, { color: colors.text }]}>{fast.label}</Text>
                <Text style={[styles.fastSub, { color: colors.textSecondary }]}>{fast.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.fastValue, { color: fast.completed ? COLORS.success : COLORS.warning }]}>{fast.hours}h</Text>
                <Text style={[styles.fastSub, { color: colors.textSecondary }]}>{fast.completed ? 'Completed' : 'Partial'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orbTop: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(97,168,255,0.28)',
    top: -110,
    right: -80,
  },
  orbBottom: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(147,230,255,0.2)',
    bottom: -140,
    left: -90,
  },
  content: { padding: SPACING.lg, paddingTop: 60, paddingBottom: 90 },
  hero: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, shadowColor: '#2A84E2', shadowOpacity: 0.24, shadowRadius: 16, elevation: 8 },
  heroKicker: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '900', marginTop: 6, color: '#fff', marginBottom: 0 },
  heroBody: { color: 'rgba(255,255,255,0.9)', marginTop: SPACING.sm, fontSize: FONT_SIZE.md, lineHeight: 22 },
  summaryRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  summaryCard: { flex: 1, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, alignItems: 'center', borderWidth: 1, shadowColor: '#1A4D93', shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
  summaryValue: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  summaryLabel: { fontSize: FONT_SIZE.sm, marginTop: 4 },
  card: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1, shadowColor: '#1A4D93', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.md },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  calendarCell: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#E8F2FF', borderWidth: 1, borderColor: 'rgba(30,99,233,0.08)' },
  fastRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1 },
  fastTitle: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  fastSub: { fontSize: FONT_SIZE.sm, marginTop: 4 },
  fastValue: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
});

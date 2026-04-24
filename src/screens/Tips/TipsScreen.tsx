import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import i18n from '../../i18n';

// Get tips from i18n translation files — supports all 5 languages automatically
function getTips() {
  try {
    return (i18n.t('tips.articles') as any) || [];
  } catch {
    return [];
  }
}

export default function TipsScreen() {
  const { colors, theme } = useTheme();
  useLanguage();
  const navigation = useNavigation<any>();
  const tips = getTips();
  const isDark = theme === 'dark';
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!isDark && (
        <LinearGradient colors={[COLORS.mist, '#DCEEFF', '#ECF8FF']} style={StyleSheet.absoluteFillObject} />
      )}
      {!isDark && <View pointerEvents="none" style={styles.orbTop} />}
      {!isDark && <View pointerEvents="none" style={styles.orbBottom} />}

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={[COLORS.primaryDark, COLORS.gradientStart, COLORS.gradientEnd]} style={styles.hero}>
          <Text style={styles.heroKicker}>{i18n.t('tips.guidesKicker')}</Text>
          <Text style={styles.title}>{i18n.t('tips.title')}</Text>
          <Text style={styles.subtitle}>{i18n.t('tips.editorialSubtitle')}</Text>
        </LinearGradient>

        {tips.map((tip) => (
          <TouchableOpacity key={tip.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('TipDetail', { tip })}>
            <View style={styles.cardTopRow}>
              <View style={[styles.badge, { backgroundColor: tip.accent + '18' }]}>
                <Text style={{ color: tip.accent, fontWeight: '800' }}>{tip.category}</Text>
              </View>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>{tip.readTime}</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{tip.title}</Text>
            <Text style={[styles.cardBody, { color: colors.textSecondary }]}>{tip.body}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orbTop: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(85,175,255,0.22)',
    top: -110,
    right: -80,
  },
  orbBottom: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(96,214,234,0.18)',
    bottom: -140,
    left: -100,
  },
  content: { padding: SPACING.lg, paddingTop: 8, paddingBottom: 90 },
  hero: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, shadowColor: '#2A84E2', shadowOpacity: 0.22, shadowRadius: 15, elevation: 7 },
  heroKicker: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '900', color: '#fff', marginTop: 6 },
  subtitle: { marginTop: SPACING.sm, marginBottom: SPACING.lg, fontSize: FONT_SIZE.md, lineHeight: 22, color: 'rgba(255,255,255,0.9)' },
  card: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, shadowColor: '#1A4D93', shadowOpacity: 0.07, shadowRadius: 10, elevation: 2 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginBottom: SPACING.md },
  cardTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800', marginBottom: SPACING.sm },
  cardBody: { fontSize: FONT_SIZE.md, lineHeight: 22 },
  cardMeta: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
});

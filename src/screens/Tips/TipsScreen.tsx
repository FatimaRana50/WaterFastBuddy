import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import Kicker from '../../components/Kicker';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import i18n from '../../i18n';

// Featured short from the client — always pinned at the top of Tips.
const FEATURED_SHORT = {
  url:      'https://youtube.com/shorts/Rhq6TY_qeU4?si=5nkwI2avuhRiDXR3',
  videoId:  'Rhq6TY_qeU4',
  title:    'Water fasting — quick explainer',
  author:   'WaterFastBuddy · Shorts',
};

// Read articles from i18n so new languages get content automatically.
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
  const tips       = getTips();
  const isDark     = theme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[COLORS.primaryDeep, COLORS.primaryDark, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroKicker}>{i18n.t('tips.guidesKicker')}</Text>
          <Text style={styles.title}>{i18n.t('tips.title')}</Text>
          <Text style={styles.subtitle}>{i18n.t('tips.editorialSubtitle')}</Text>
        </LinearGradient>

        {/* Featured YouTube short */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Kicker style={{ marginBottom: SPACING.sm } as any}>Featured short</Kicker>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => Linking.openURL(FEATURED_SHORT.url).catch(() => {})}
            style={[styles.shortCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.shortThumbWrap}>
              <Image
                source={{ uri: `https://i.ytimg.com/vi/${FEATURED_SHORT.videoId}/hqdefault.jpg` }}
                style={styles.shortThumb}
                resizeMode="cover"
              />
              <View style={styles.shortPlayOverlay}>
                <View style={styles.shortPlayButton}>
                  <Ionicons name="play" size={26} color="#fff" />
                </View>
              </View>
              <View style={styles.shortBadge}>
                <Ionicons name="logo-youtube" size={12} color="#fff" />
                <Text style={styles.shortBadgeText}>Shorts</Text>
              </View>
            </View>
            <View style={{ padding: SPACING.md }}>
              <Text style={[styles.shortTitle, { color: colors.text }]}>{FEATURED_SHORT.title}</Text>
              <Text style={[styles.shortAuthor, { color: colors.textSecondary }]}>{FEATURED_SHORT.author}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tips feed */}
        <Kicker style={{ marginBottom: SPACING.sm } as any}>Guides & Tips</Kicker>
        {tips.map((tip: any) => (
          <TouchableOpacity
            key={tip.id}
            activeOpacity={0.85}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('TipDetail', { tip })}
          >
            <View style={styles.cardTopRow}>
              <View style={[styles.badge, { backgroundColor: tip.accent + '18' }]}>
                <Text style={{ color: tip.accent, fontWeight: '800' }}>{tip.category}</Text>
              </View>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>{tip.readTime}</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{tip.title}</Text>
            <Text
              numberOfLines={3}
              style={[styles.cardBody, { color: colors.textSecondary }]}
            >
              {tip.body}
            </Text>
            <View style={styles.readMoreRow}>
              <Text style={[styles.readMoreText, { color: tip.accent }]}>Read more</Text>
              <Text style={[styles.readMoreArrow, { color: tip.accent }]}> →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { padding: SPACING.lg, paddingTop: 8, paddingBottom: 90 },

  hero: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#0B5DD1',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: FONT_SIZE.xs, fontWeight: '800',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  title:    { fontSize: FONT_SIZE.xxl, fontWeight: '900', color: '#fff', marginTop: 6 },
  subtitle: {
    marginTop: SPACING.sm, marginBottom: 0,
    fontSize: FONT_SIZE.md, lineHeight: 22,
    color: 'rgba(255,255,255,0.9)',
  },

  // Featured short
  shortCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#0B5DD1',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  shortThumbWrap: { aspectRatio: 16 / 9, position: 'relative' },
  shortThumb:     { width: '100%', height: '100%' },
  shortPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  shortPlayButton: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  shortBadge: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  shortBadgeText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '800' },
  shortTitle:     { fontSize: FONT_SIZE.md, fontWeight: '800' },
  shortAuthor:    { fontSize: FONT_SIZE.xs, marginTop: 2 },

  // Tip cards
  card: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1,
    shadowColor: '#1A4D93', shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginBottom: SPACING.md },
  cardTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800', marginBottom: SPACING.sm },
  cardBody:  { fontSize: FONT_SIZE.md, lineHeight: 22 },
  cardMeta:  { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  readMoreRow:   { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md },
  readMoreText:  { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  readMoreArrow: { fontSize: FONT_SIZE.md, fontWeight: '800' },
});

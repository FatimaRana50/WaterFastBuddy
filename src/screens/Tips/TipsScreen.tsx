// TipsScreen — magazine-style redesign.
// Same imports, navigation calls, and i18n source as the original.
// Visual polish:
//  • Full-bleed gradient hero with editorial kicker + typographic title
//  • Featured short with stronger play button + duration overlay
//  • Tip cards with gradient header strip, large category chip, and "minutes" pill
//  • Better hierarchy & shadow stack
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import Kicker from '../../components/Kicker';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import i18n from '../../i18n';

const FEATURED_SHORT = {
  url:     'https://youtube.com/shorts/Rhq6TY_qeU4?si=5nkwI2avuhRiDXR3',
  videoId: 'Rhq6TY_qeU4',
  title:   'Water fasting — quick explainer',
  author:  'WaterFastBuddy · Shorts',
};

function getTips() {
  try { return (i18n.t('tips.articles') as any) || []; }
  catch { return []; }
}

export default function TipsScreen() {
  const { colors } = useTheme();
  useLanguage();
  const navigation = useNavigation<any>();
  const tips = getTips();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Editorial hero */}
        <LinearGradient
          colors={['#0A1628', COLORS.primaryDeep ?? '#08226B', COLORS.primaryDark ?? '#0D3AA8', COLORS.primary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroOrb} />
          <Text style={styles.heroKicker}>{i18n.t('tips.guidesKicker')}</Text>
          <Text style={styles.heroTitle}>{i18n.t('tips.title')}</Text>
          <Text style={styles.heroSubtitle}>{i18n.t('tips.editorialSubtitle')}</Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaPill}>
              <Ionicons name="library-outline" size={12} color="#fff" />
              <Text style={styles.heroMetaText}>{tips.length} guides</Text>
            </View>
            <View style={styles.heroMetaPill}>
              <Ionicons name="time-outline" size={12} color="#fff" />
              <Text style={styles.heroMetaText}>3–8 min reads</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Featured short */}
        <View style={{ marginBottom: SPACING.xl }}>
          <View style={styles.sectionHead}>
            <Kicker style={{ marginBottom: 0 } as any}>Featured short</Kicker>
            <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>2 min · YouTube</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => Linking.openURL(FEATURED_SHORT.url).catch(() => {})}
            style={[styles.shortCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.shortThumbWrap}>
              <Image
                source={{ uri: `https://i.ytimg.com/vi/${FEATURED_SHORT.videoId}/hqdefault.jpg` }}
                style={styles.shortThumb}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(10,22,40,0)', 'rgba(10,22,40,0.85)']}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.shortPlayOverlay}>
                <View style={styles.shortPlayButton}>
                  <Ionicons name="play" size={28} color="#fff" />
                </View>
              </View>
              <View style={styles.shortBadge}>
                <Ionicons name="logo-youtube" size={12} color="#fff" />
                <Text style={styles.shortBadgeText}>Shorts</Text>
              </View>
              <View style={styles.shortBottomMeta}>
                <Text style={styles.shortBottomTitle}>{FEATURED_SHORT.title}</Text>
                <Text style={styles.shortBottomAuthor}>{FEATURED_SHORT.author}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tips feed */}
        <View style={styles.sectionHead}>
          <Kicker style={{ marginBottom: 0 } as any}>Guides & Tips</Kicker>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{tips.length} articles</Text>
        </View>

        {tips.map((tip: any, idx: number) => (
          <TouchableOpacity
            key={tip.id ?? idx}
            activeOpacity={0.88}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('TipDetail', { tip })}
          >
            {/* Gradient art strip */}
            <LinearGradient
              colors={[tip.accent ?? COLORS.primary, (tip.accent ?? COLORS.primary) + '00']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.cardStrip}
            >
              <Text style={styles.cardStripNum}>{String(idx + 1).padStart(2, '0')}</Text>
              <View style={styles.cardStripBadge}>
                <Text style={styles.cardStripBadgeText}>{tip.category}</Text>
              </View>
            </LinearGradient>

            <View style={styles.cardBody}>
              <View style={styles.cardMetaRow}>
                <View style={styles.metaPill}>
                  <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
                  <Text style={[styles.metaPillText, { color: colors.textSecondary }]}>{tip.readTime}</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{tip.title}</Text>
              <Text numberOfLines={3} style={[styles.cardBodyText, { color: colors.textSecondary }]}>
                {tip.body}
              </Text>

              <View style={styles.readMoreRow}>
                <Text style={[styles.readMoreText, { color: tip.accent ?? COLORS.primary }]}>Read article</Text>
                <Ionicons name="arrow-forward" size={14} color={tip.accent ?? COLORS.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { padding: SPACING.lg, paddingTop: 8, paddingBottom: 110 },

  // Hero
  hero: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOpacity: 0.35, shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 }, elevation: 8,
  },
  heroOrb: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(56,189,248,0.18)', top: -100, right: -80,
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: FONT_SIZE.xs, fontWeight: '900',
    letterSpacing: 2.5, textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 36, fontWeight: '900', color: '#fff',
    marginTop: 8, letterSpacing: -1, lineHeight: 40,
  },
  heroSubtitle: {
    marginTop: SPACING.sm, fontSize: FONT_SIZE.md, lineHeight: 22,
    color: 'rgba(255,255,255,0.9)',
  },
  heroMetaRow: { flexDirection: 'row', gap: 8, marginTop: SPACING.lg },
  heroMetaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  heroMetaText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '800' },

  sectionHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionHint: { fontSize: FONT_SIZE.xs, fontWeight: '700' },

  // Featured short
  shortCard: {
    borderRadius: BORDER_RADIUS.xl, borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }, elevation: 5,
  },
  shortThumbWrap: { aspectRatio: 16 / 9, position: 'relative' },
  shortThumb:     { width: '100%', height: '100%' },
  shortPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
  },
  shortPlayButton: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#EF4444', shadowOpacity: 0.55, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  shortBadge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.78)',
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 999,
  },
  shortBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  shortBottomMeta: {
    position: 'absolute', left: 16, right: 16, bottom: 14,
  },
  shortBottomTitle: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '900', letterSpacing: -0.2 },
  shortBottomAuthor: { color: 'rgba(255,255,255,0.78)', fontSize: FONT_SIZE.xs, marginTop: 2, fontWeight: '600' },

  // Tip cards
  card: {
    borderRadius: BORDER_RADIUS.xl, borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  cardStrip: {
    height: 84, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  cardStripNum: {
    color: 'rgba(255,255,255,0.32)',
    fontSize: 44, fontWeight: '900', letterSpacing: -2, lineHeight: 44,
  },
  cardStripBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.38)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  cardStripBadgeText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '900', letterSpacing: 0.6, textTransform: 'uppercase' },

  cardBody: { padding: SPACING.lg },
  cardMetaRow: { flexDirection: 'row', marginBottom: SPACING.sm },
  metaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.04)',
  },
  metaPillText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  cardTitle: { fontSize: FONT_SIZE.lg, fontWeight: '900', letterSpacing: -0.3, marginBottom: 6 },
  cardBodyText: { fontSize: FONT_SIZE.sm, lineHeight: 22 },
  readMoreRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.md },
  readMoreText: { fontSize: FONT_SIZE.sm, fontWeight: '900' },
});

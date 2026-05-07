import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, Image, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import Kicker from '../../components/Kicker';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';
import i18n from '../../i18n';

/* ── YouTube Shorts ─────────────────────────────────────────────── */
const SHORTS = [
  {
    id: 'Kt9S9ijEu7w',
    url: 'https://www.youtube.com/shorts/Kt9S9ijEu7w',
    title: 'Why water fasting works',
  },
  {
    id: '_FpTWcM5Yek',
    url: 'https://www.youtube.com/shorts/_FpTWcM5Yek',
    title: 'What happens to your body',
  },
  {
    id: '7Hda82iHZPs',
    url: 'https://www.youtube.com/shorts/7Hda82iHZPs',
    title: 'Autophagy explained',
  },
  {
    id: 'LDXetDi0dz0',
    url: 'https://www.youtube.com/shorts/LDXetDi0dz0',
    title: 'Weight loss tips',
  },
  {
    id: 'FCma0OysrTs',
    url: 'https://www.youtube.com/shorts/FCma0OysrTs',
    title: 'Fasting mistakes to avoid',
  },
];

/* ── Benefits bullets ────────────────────────────────────────────── */
const BENEFITS = [
  { icon: '⚖️', text: 'Lose weight fast & safely — up to 0.8 kg/day (5 kg/week)' },
  { icon: '🩸', text: 'Reverse & prevent Type 2 diabetes by improving insulin resistance' },
  { icon: '🧬', text: 'Lowers risk of cancer and Alzheimer\'s disease' },
  { icon: '💓', text: 'Reduces blood pressure and supports cardiovascular health' },
  { icon: '🔥', text: 'Significantly reduces chronic inflammation' },
  { icon: '🌀', text: 'Triggers Autophagy — deep cellular cleanup & repair' },
  { icon: '⏱️', text: 'Also works for intermittent fasting (16:8, OMAD, etc.)' },
  { icon: '✨', text: 'And SO much more — skin clarity, mental sharpness, energy' },
];

function getTips() {
  try { return (i18n.t('tips.articles') as any) || []; }
  catch { return []; }
}

/* ── Short card (portrait) ───────────────────────────────────────── */
function ShortCard({ item }: { item: typeof SHORTS[0] }) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => Linking.openURL(item.url).catch(() => {})}
      style={styles.shortCard}
    >
      <View style={styles.shortThumbWrap}>
        <Image
          source={{ uri: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg` }}
          style={styles.shortThumb}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Play button */}
        <View style={styles.playBtn}>
          <Ionicons name="play" size={18} color="#fff" />
        </View>
        {/* YT Shorts badge */}
        <View style={styles.shortsBadge}>
          <Ionicons name="logo-youtube" size={10} color="#fff" />
          <Text style={styles.shortsBadgeText}>Shorts</Text>
        </View>
      </View>
      <Text style={styles.shortTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );
}

export default function TipsScreen() {
  const { colors } = useTheme();
  useLanguage();
  const navigation = useNavigation<any>();
  const tips = getTips();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#0A1628', '#08226B', '#0D3AA8', COLORS.primary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroOrb} />
          <Text style={styles.heroKicker}>GUIDE & HELP</Text>
          <Text style={styles.heroTitle}>Everything{'\n'}you need to know.</Text>
          <Text style={styles.heroSubtitle}>
            Videos, benefits, tips and science — all in one place.
          </Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaPill}>
              <Ionicons name="play-circle-outline" size={12} color="#fff" />
              <Text style={styles.heroMetaText}>5 short videos</Text>
            </View>
            <View style={styles.heroMetaPill}>
              <Ionicons name="library-outline" size={12} color="#fff" />
              <Text style={styles.heroMetaText}>{tips.length} guides</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Watch & Learn ─────────────────────────────────────── */}
        <View style={styles.sectionHead}>
          <Kicker style={{ marginBottom: 0 } as any}>Watch & Learn</Kicker>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>Tap to watch on YouTube</Text>
        </View>

        <FlatList
          data={SHORTS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.shortsList}
          renderItem={({ item }) => <ShortCard item={item} />}
        />

        {/* ── Benefits card ─────────────────────────────────────── */}
        <View style={styles.sectionHead}>
          <Kicker style={{ marginBottom: 0 } as any}>Water Fasting Helps With</Kicker>
        </View>

        <View style={[styles.benefitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinearGradient
            colors={[COLORS.primary + '18', COLORS.accent + '08']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.benefitsHeader}>
            <View style={[styles.benefitsIconBadge, { backgroundColor: COLORS.accent + '22' }]}>
              <Text style={{ fontSize: 20 }}>💧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.benefitsTitle, { color: colors.text }]}>
                Important information
              </Text>
              <Text style={[styles.benefitsSub, { color: colors.textSecondary }]}>
                Science-backed benefits of water fasting
              </Text>
            </View>
          </View>

          {BENEFITS.map((b, i) => (
            <View key={i} style={[styles.benefitRow, i < BENEFITS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border + '60' }]}>
              <Text style={styles.benefitIcon}>{b.icon}</Text>
              <Text style={[styles.benefitText, { color: colors.text }]}>{b.text}</Text>
            </View>
          ))}

          {/* Read more link */}
          <TouchableOpacity
            style={[styles.benefitsLink, { borderColor: COLORS.primary + '40', backgroundColor: COLORS.primary + '12' }]}
            onPress={() => Linking.openURL('https://waterfastbuddy.com/benefits').catch(() => {})}
            activeOpacity={0.8}
          >
            <Ionicons name="globe-outline" size={16} color={COLORS.primary} />
            <Text style={[styles.benefitsLinkText, { color: COLORS.primary }]}>
              Full breakdown at waterfastbuddy.com/benefits
            </Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Disclaimer card ───────────────────────────────────── */}
        <View style={[styles.disclaimerCard, { backgroundColor: colors.card, borderColor: '#F59E0B40' }]}>
          <View style={styles.disclaimerHeader}>
            <Ionicons name="warning-outline" size={18} color="#F59E0B" />
            <Text style={[styles.disclaimerTitle, { color: '#F59E0B' }]}>Health Notice</Text>
          </View>
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            If you have any underlying health conditions, it is always best to speak to a health
            professional to see if water fasting is safe for you to do so.
          </Text>
        </View>

        {/* ── Fasting Stages quick guide ────────────────────────── */}
        <View style={styles.sectionHead}>
          <Kicker style={{ marginBottom: 0 } as any}>Fasting Stages</Kicker>
        </View>

        {STAGES.map((stage, i) => (
          <View key={i} style={[styles.stageCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: stage.color }]}>
            <View style={[styles.stageDot, { backgroundColor: stage.color }]} />
            <View style={{ flex: 1 }}>
              <View style={styles.stageTopRow}>
                <Text style={[styles.stageHours, { color: stage.color }]}>{stage.hours}</Text>
                <View style={[styles.stageChip, { backgroundColor: stage.color + '18' }]}>
                  <Text style={[styles.stageChipText, { color: stage.color }]}>{stage.label}</Text>
                </View>
              </View>
              <Text style={[styles.stageDesc, { color: colors.text }]}>{stage.title}</Text>
              <Text style={[styles.stageBody, { color: colors.textSecondary }]}>{stage.body}</Text>
            </View>
          </View>
        ))}

        {/* ── Guide articles ────────────────────────────────────── */}
        {tips.length > 0 && (
          <>
            <View style={[styles.sectionHead, { marginTop: SPACING.sm }]}>
              <Kicker style={{ marginBottom: 0 } as any}>Guides & Articles</Kicker>
              <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{tips.length} reads</Text>
            </View>

            {tips.map((tip: any, idx: number) => (
              <TouchableOpacity
                key={tip.id ?? idx}
                activeOpacity={0.88}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigation.navigate('TipDetail', { tip })}
              >
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
          </>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

/* ── Fasting stages data ─────────────────────────────────────────── */
const STAGES = [
  {
    hours: '0 – 4 hrs',
    label: 'Fed state',
    color: '#10B981',
    title: 'Digestion & glucose burning',
    body: 'Your body digests your last meal and uses glucose as its primary fuel source.',
  },
  {
    hours: '4 – 12 hrs',
    label: 'Post-absorptive',
    color: '#3B82F6',
    title: 'Glycogen depletion begins',
    body: 'Blood glucose drops, liver glycogen starts converting to fuel. Insulin falls.',
  },
  {
    hours: '12 – 18 hrs',
    label: 'Ketosis starts',
    color: '#8B5CF6',
    title: 'Fat burning ignites',
    body: 'Liver glycogen is nearly depleted. Your body begins producing ketones from fat.',
  },
  {
    hours: '18 – 24 hrs',
    label: 'Deep ketosis',
    color: '#F59E0B',
    title: 'Autophagy activates',
    body: 'Cellular cleanup (autophagy) intensifies. Growth hormone spikes to protect muscle mass.',
  },
  {
    hours: '24 – 72 hrs',
    label: 'Extended fast',
    color: COLORS.primary,
    title: 'Maximum cellular repair',
    body: 'Deep autophagy, reduced inflammation, stem cell regeneration. Most transformative phase.',
  },
];

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
    fontSize: 34, fontWeight: '900', color: '#fff',
    marginTop: 8, letterSpacing: -0.5, lineHeight: 40,
  },
  heroSubtitle: {
    marginTop: SPACING.sm, fontSize: FONT_SIZE.md, lineHeight: 22,
    color: 'rgba(255,255,255,0.85)',
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

  // Shorts
  shortsList: { paddingRight: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.xl },
  shortCard: { width: 150 },
  shortThumbWrap: {
    width: 150, height: 220, borderRadius: 16, overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  shortThumb: { width: '100%', height: '100%' },
  playBtn: {
    position: 'absolute',
    top: '50%', left: '50%',
    marginTop: -22, marginLeft: -22,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#EF4444', shadowOpacity: 0.6, shadowRadius: 12, elevation: 6,
  },
  shortsBadge: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999,
  },
  shortsBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  shortTitle: {
    fontSize: FONT_SIZE.xs, fontWeight: '700', color: '#4B5563',
    lineHeight: 16,
  },

  // Benefits card
  benefitsCard: {
    borderRadius: BORDER_RADIUS.xl, borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    shadowColor: COLORS.primary, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3,
  },
  benefitsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  benefitsIconBadge: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  benefitsTitle: { fontSize: FONT_SIZE.lg, fontWeight: '900' },
  benefitsSub:   { fontSize: FONT_SIZE.xs, marginTop: 2 },

  benefitRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    paddingVertical: 10,
  },
  benefitIcon: { fontSize: 18, width: 26, textAlign: 'center', marginTop: 1 },
  benefitText: { flex: 1, fontSize: FONT_SIZE.sm, lineHeight: 20, fontWeight: '500' },

  benefitsLink: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 12,
    marginTop: SPACING.md,
  },
  benefitsLinkText: { flex: 1, fontSize: FONT_SIZE.xs, fontWeight: '700' },

  // Disclaimer
  disclaimerCard: {
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5,
    padding: SPACING.lg, marginBottom: SPACING.xl,
    backgroundColor: '#FFFBEB',
  },
  disclaimerHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm,
  },
  disclaimerTitle: { fontSize: FONT_SIZE.md, fontWeight: '900' },
  disclaimerText:  { fontSize: FONT_SIZE.sm, lineHeight: 22, fontStyle: 'italic' },

  // Fasting stages
  stageCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderLeftWidth: 4,
    padding: SPACING.md, marginBottom: SPACING.sm,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  stageDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6, flexShrink: 0 },
  stageTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  stageHours: { fontSize: FONT_SIZE.xs, fontWeight: '900', letterSpacing: 0.3 },
  stageChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  stageChipText: { fontSize: 10, fontWeight: '800' },
  stageDesc: { fontSize: FONT_SIZE.sm, fontWeight: '800', marginBottom: 3 },
  stageBody: { fontSize: FONT_SIZE.xs, lineHeight: 18 },

  // Articles
  card: {
    borderRadius: BORDER_RADIUS.xl, borderWidth: 1,
    overflow: 'hidden', marginBottom: SPACING.md,
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
  readMoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.md },
  readMoreText: { fontSize: FONT_SIZE.sm, fontWeight: '900' },
});

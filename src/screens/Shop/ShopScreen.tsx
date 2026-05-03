// ShopScreen — premium storefront mirroring the website's Shop.
// Same handlers, links, and components as the original.
// Visual polish:
//  • Hero gradient with halo orb + centered icon medallion
//  • Feature grid kept (FeatureCard)
//  • Product cards: gradient art block with crystal motif, larger badge,
//    rating ribbon, refined tag chips, gradient buy button
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import Kicker from '../../components/Kicker';
import FeatureCard from '../../components/FeatureCard';
import HeroCTA from '../../components/HeroCTA';
import i18n from '../../i18n';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';

type Product = {
  key: string;
  badge: string;
  badgeColor: string;
  name: string;
  description: string;
  rating: number;
  tags: string[];
  url: string;
};

const PRODUCTS: Product[] = [
  {
    key: 'powder',
    badge: 'POWDER',
    badgeColor: '#F97316',
    name: 'Fasting Salts Original Powder',
    description: 'Fasting Electrolytes Powder with Sodium, Potassium, Magnesium.',
    rating: 4.8,
    tags: ['Sugar-free', 'Zero calories', 'No maltodextrin'],
    url: 'https://www.nutri-align.com/products/fasting-electrolytes-powder?variant=50553522061578#a_aid=waterfastbuddy',
  },
  {
    key: 'capsules',
    badge: 'CAPSULES',
    badgeColor: '#1E3A8A',
    name: 'Fasting Salts Advanced Capsules',
    description: 'Fasting Electrolytes Capsules for extended fasting: Sodium, Potassium, Magnesium, Phosphorus.',
    rating: 4.8,
    tags: ['Sugar-free', 'Zero calories', 'No junk fillers'],
    url: 'https://www.nutri-align.com/products/fasting-electrolytes-advanced-capsules#a_aid=waterfastbuddy',
  },
];

export default function ShopScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  useLanguage();

  const openProduct = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>{i18n.t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={['#0A1628', COLORS.primaryDeep ?? '#08226B', COLORS.primaryDark ?? '#0D3AA8', COLORS.primary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroOrb} />
          <View style={styles.heroMedallion}>
            <Ionicons name="bag-handle" size={22} color="#fff" />
          </View>
          <Text style={styles.heroKicker}>SHOP</Text>
          <Text style={styles.heroTitle}>
            Shop salts in a clean{'\n'}
            <Text style={{ color: COLORS.accent }}>storefront.</Text>
          </Text>
          <Text style={styles.heroBody}>
            Hand-picked fasting salts, electrolyte powders, and crystal packs. Checkout
            happens on the affiliate supplier for fast, reliable fulfilment.
          </Text>

          <View style={styles.chipRow}>
            {['Fast shipping', 'Salt only', 'Mineral support', 'Affiliate checkout'].map((c) => (
              <View key={c} style={styles.heroChip}>
                <Text style={styles.heroChipText}>{c}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Supporting feature cards */}
        <View style={styles.featureGrid}>
          <FeatureCard
            icon="car-outline"
            title="Shipping ready"
            body="Affiliate supplier fulfilment. Clear product photos, prices, and quick purchase intent."
            style={{ flex: 1 }}
          />
          <FeatureCard
            icon="flash-outline"
            title="Quick support"
            body="For hydration and fasting routines. Compare salts quickly like a standard ecommerce page."
            style={{ flex: 1 }}
          />
        </View>

        {/* Featured products */}
        <View style={{ alignItems: 'center', marginTop: SPACING.xxl, marginBottom: SPACING.sm }}>
          <Kicker>Featured products</Kicker>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Salts for your fasting setup</Text>
        <View style={styles.trustRow}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
          <Text style={[styles.trustText, { color: colors.textSecondary }]}>Trusted affiliate listings</Text>
        </View>

        {PRODUCTS.map((p) => (
          <ProductCard key={p.key} product={p} onBuy={() => openProduct(p.url)} />
        ))}

        {/* Closing CTA */}
        <View style={{ marginTop: SPACING.xl }}>
          <HeroCTA
            kicker="Want personalised guidance?"
            title="Book a 1-on-1 session"
            body="Your coach can recommend the right electrolyte protocol for your fasts."
            ctaLabel="Book a session"
            ctaIcon="calendar"
            onPress={() => navigation.navigate('Booking')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function ProductCard({ product, onBuy }: { product: Product; onBuy: () => void }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Top art strip */}
      <LinearGradient
        colors={[product.badgeColor, '#0A1628']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.productArt}
      >
        {/* decorative crystal orbs */}
        <View style={[styles.crystal, { top: 20, left: 30, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)' }]} />
        <View style={[styles.crystal, { bottom: 70, right: 28, width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.12)' }]} />
        <View style={[styles.crystal, { top: 60, right: 70, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.22)' }]} />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{product.badge}</Text>
        </View>

        <View style={styles.ratingPill}>
          <Ionicons name="star" size={12} color="#FFD54A" />
          <Text style={styles.ratingText}>{product.rating}</Text>
        </View>

        <Text style={styles.productMark}>FASTING SALTS</Text>
        <Text style={styles.productMarkSub}>SODIUM · POTASSIUM · MAGNESIUM</Text>
      </LinearGradient>

      <View style={styles.productBody}>
        <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
        <Text style={[styles.productDesc, { color: colors.textSecondary }]}>{product.description}</Text>

        <View style={styles.tagRow}>
          {product.tags.map((t) => (
            <View key={t} style={[styles.tag, { backgroundColor: COLORS.primary + '18', borderColor: COLORS.primary + '30' }]}>
              <Ionicons name="checkmark" size={10} color={COLORS.primary} />
              <Text style={[styles.tagText, { color: COLORS.primary }]}>{t}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={onBuy} activeOpacity={0.9}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.buyBtn}
          >
            <Ionicons name="bag-handle" size={16} color="#fff" />
            <Text style={styles.buyBtnText}>Buy on Nutri-Align</Text>
            <Ionicons name="open-outline" size={14} color="rgba(255,255,255,0.85)" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  backBtn: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8, marginLeft: SPACING.md,
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.round, borderWidth: 1, gap: 4,
  },
  backText: { fontSize: FONT_SIZE.sm, fontWeight: '800' },

  content: { padding: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.xxl },

  heroCard: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl,
    overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 }, elevation: 10,
  },
  heroOrb: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(56,189,248,0.18)', top: -100, right: -80 },
  heroMedallion: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroKicker: { color: 'rgba(255,255,255,0.78)', fontSize: FONT_SIZE.xs, fontWeight: '900', letterSpacing: 2.5 },
  heroTitle:  { color: '#fff', fontSize: 36, fontWeight: '900', lineHeight: 40, marginTop: 8, letterSpacing: -1 },
  heroBody:   { color: 'rgba(255,255,255,0.9)', fontSize: FONT_SIZE.md, lineHeight: 22, marginTop: SPACING.md },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: SPACING.lg },
  heroChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
  },
  heroChipText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '800' },

  featureGrid: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },

  sectionTitle: { fontSize: 26, fontWeight: '900', textAlign: 'center', letterSpacing: -0.6 },
  trustRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4, marginBottom: SPACING.lg },
  trustText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  productCard: {
    borderRadius: BORDER_RADIUS.xl, borderWidth: 1,
    marginBottom: SPACING.lg, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 }, elevation: 6,
  },
  productArt: { height: 200, padding: SPACING.md, justifyContent: 'flex-end', position: 'relative', overflow: 'hidden' },
  crystal: { position: 'absolute' },
  badge: {
    position: 'absolute', top: 12, left: 12,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  ratingPill: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.78)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  ratingText: { color: '#fff', fontWeight: '900', fontSize: FONT_SIZE.xs },
  productMark:    { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 2.5, textAlign: 'center' },
  productMarkSub: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textAlign: 'center', marginTop: 4 },

  productBody: { padding: SPACING.lg },
  productName: { fontSize: FONT_SIZE.lg, fontWeight: '900', letterSpacing: -0.3 },
  productDesc: { fontSize: FONT_SIZE.sm, lineHeight: 20, marginTop: 6 },
  tagRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: SPACING.sm },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999, borderWidth: 1,
  },
  tagText: { fontSize: FONT_SIZE.xs, fontWeight: '900' },

  buyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.md,
    shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  buyBtnText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '900' },
});

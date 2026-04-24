// Shop screen — in-app storefront mirroring the website's Shop section.
// Tapping any "Buy" button opens the Nutri-Align affiliate URL in the browser
// (checkout always happens on the affiliate site, per the brief).
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
    badge: 'Powder',
    badgeColor: '#F97316',
    name: 'Fasting Salts Original Powder',
    description: 'Fasting Electrolytes Powder with Sodium, Potassium, Magnesium.',
    rating: 4.8,
    tags: ['Sugar-free', 'Zero calories', 'No maltodextrin'],
    url: 'https://www.nutri-align.com/products/fasting-electrolytes-powder?variant=50553522061578#a_aid=waterfastbuddy',
  },
  {
    key: 'capsules',
    badge: 'Capsules',
    badgeColor: '#1E3A8A',
    name: 'Fasting Salts Advanced Capsules',
    description:
      'Fasting Electrolytes Capsules for extended fasting: Sodium, Potassium, Magnesium, Phosphorus.',
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>{i18n.t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[COLORS.primaryDeep, COLORS.primaryDark, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroKicker}>SHOP</Text>
          <Text style={styles.heroTitle}>
            Shop salts in a clean{'\n'}storefront.
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
        <View style={{ alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.sm }}>
          <Kicker>Featured products</Kicker>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Salts for your fasting setup
        </Text>
        <View style={styles.trustRow}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
          <Text style={[styles.trustText, { color: colors.textSecondary }]}>
            Trusted affiliate listings
          </Text>
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

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onBuy }: { product: Product; onBuy: () => void }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.productCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* Top art strip — stylized gradient with SALT wordmark */}
      <LinearGradient
        colors={[product.badgeColor, '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.productArt}
      >
        <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.72)' }]}>
          <Text style={styles.badgeText}>{product.badge}</Text>
        </View>

        <View style={styles.ratingPill}>
          <Ionicons name="star" size={12} color="#FFD54A" />
          <Text style={styles.ratingText}>{product.rating}</Text>
        </View>

        <Text style={styles.productMark}>FASTING SALTS</Text>
        <Text style={styles.productMarkSub}>
          SODIUM · POTASSIUM · MAGNESIUM
        </Text>
      </LinearGradient>

      <View style={styles.productBody}>
        <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
        <Text style={[styles.productDesc, { color: colors.textSecondary }]}>
          {product.description}
        </Text>

        <View style={styles.tagRow}>
          {product.tags.map((t) => (
            <View key={t} style={[styles.tag, { backgroundColor: COLORS.primary + '14' }]}>
              <Text style={[styles.tagText, { color: COLORS.primary }]}>{t}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.buyBtn, { backgroundColor: COLORS.primary }]}
          onPress={onBuy}
          activeOpacity={0.85}
        >
          <Ionicons name="bag-handle" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buyBtnText}>Buy on Nutri-Align</Text>
          <Ionicons name="open-outline" size={14} color="rgba(255,255,255,0.8)" style={{ marginLeft: 8 }} />
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
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.round, borderWidth: 1,
    gap: 4,
  },
  backText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  content: { padding: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.xxl },

  // Hero
  heroCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: '#0B5DD1',
    shadowOpacity: 0.25,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT_SIZE.xs, fontWeight: '800',
    letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  heroTitle: {
    color: '#fff', fontSize: FONT_SIZE.hero,
    fontWeight: '900', lineHeight: 42,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: FONT_SIZE.md, lineHeight: 22,
    marginTop: SPACING.md,
  },
  chipRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    marginTop: SPACING.md,
  },
  heroChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
  },
  heroChipText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '700' },

  // Feature grid
  featureGrid: {
    flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg,
  },

  // Products
  sectionTitle: {
    fontSize: FONT_SIZE.xxl, fontWeight: '900', textAlign: 'center',
  },
  trustRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 4, marginBottom: SPACING.lg,
  },
  trustText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },

  productCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    shadowColor: '#0B5DD1',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  productArt: {
    height: 190,
    padding: SPACING.md,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  badge: {
    position: 'absolute', top: 10, left: 10,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: BORDER_RADIUS.round,
  },
  badgeText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '800' },
  ratingPill: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BORDER_RADIUS.round,
  },
  ratingText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZE.xs },
  productMark: {
    color: '#0B1530', fontSize: 26, fontWeight: '900',
    letterSpacing: 2, textAlign: 'center',
  },
  productMarkSub: {
    color: '#0B1530', fontSize: 10, fontWeight: '800',
    letterSpacing: 1.2, textAlign: 'center', marginTop: 4,
  },

  productBody: { padding: SPACING.lg },
  productName: { fontSize: FONT_SIZE.lg, fontWeight: '900' },
  productDesc: { fontSize: FONT_SIZE.sm, lineHeight: 20, marginTop: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: SPACING.sm },
  tag: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  tagText: { fontSize: FONT_SIZE.xs, fontWeight: '800' },

  buyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.md,
  },
  buyBtnText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '800' },
});

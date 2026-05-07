import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useTheme } from '../../store/ThemeContext';
import { useUser } from '../../store/UserContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import { useLanguage } from '../../store/LanguageContext';
import i18n from '../../i18n';

const FEATURES = [
  'Unlimited fasting timers & history',
  'Water & weight tracking',
  'AI avatar & body transformation',
  'Tips, guides & video library',
  'Google Drive backup',
  'Multi-language support',
];

function packageLabel(pkg: PurchasesPackage): { badge?: string; note: string; isOneTime: boolean } {
  switch (pkg.packageType) {
    case 'ANNUAL':   return { badge: 'Best Value', note: 'Billed annually', isOneTime: false };
    case 'MONTHLY':  return { note: 'Billed monthly', isOneTime: false };
    case 'LIFETIME': return { badge: 'One-time', note: 'Pay once, own forever', isOneTime: true };
    default:         return { note: '', isOneTime: false };
  }
}

// Show per-month price for annual plans
function perMonth(pkg: PurchasesPackage): string | null {
  if (pkg.packageType !== 'ANNUAL') return null;
  const monthly = pkg.product.price / 12;
  const sym = pkg.product.priceString.replace(/[\d.,]/g, '').trim() || '£';
  return `${sym}${monthly.toFixed(2)}/mo`;
}

const STATIC_PLANS = [
  { key: 'monthly',  name: 'Monthly',  note: 'Billed monthly',        price: '£7.99',  badge: undefined },
  { key: 'yearly',   name: 'Yearly',   note: 'Billed annually',       price: '£39.99', badge: 'Best Value' },
  { key: 'lifetime', name: 'Lifetime', note: 'Pay once, own forever', price: '£79.99', badge: 'One-time' },
];

export default function PaywallScreen() {
  const { colors } = useTheme();
  const { activateSubscription, isSubscribed } = useUser();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(false);
  useLanguage();

  useEffect(() => {
    Purchases.getOfferings()
      .then((offerings) => {
        const pkgs = offerings.current?.availablePackages ?? [];
        // Sort: monthly → annual → lifetime
        const order: Record<string, number> = { MONTHLY: 0, ANNUAL: 1, LIFETIME: 2 };
        pkgs.sort((a, b) => (order[a.packageType] ?? 9) - (order[b.packageType] ?? 9));
        setPackages(pkgs);
        const annual = pkgs.find((p) => p.packageType === 'ANNUAL') ?? pkgs[0] ?? null;
        setSelected(annual);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const doSubscribe = async () => {
    if (busy || !selected) return;
    setBusy(true);
    try {
      await Purchases.purchasePackage(selected);
      await activateSubscription();
      Alert.alert(i18n.t('paywall.successTitle'), i18n.t('paywall.successBody'));
    } catch (e: any) {
      if (!e?.userCancelled) Alert.alert('Purchase failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const doRestore = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await Purchases.restorePurchases();
      await activateSubscription();
      Alert.alert(i18n.t('paywall.restoredTitle'), i18n.t('paywall.restoredBody'));
    } catch (e: any) {
      Alert.alert('Restore failed', e?.message ?? 'No previous purchases found.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={['#082C6B', '#1B8CFF']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroIconRow}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="water" size={32} color="#fff" />
          </View>
        </View>
        <Text style={styles.heroTag}>
          {isSubscribed ? 'SUBSCRIBED' : 'TRIAL ENDED'}
        </Text>
        <Text style={styles.heroTitle}>Unlock Full Access</Text>
        <Text style={styles.heroSub}>
          Continue your water fasting journey with all premium features.
        </Text>
      </LinearGradient>

      {/* Features list */}
      <View style={[styles.featuresCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.featuresTitle, { color: colors.text }]}>Everything included</Text>
        {FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success ?? '#34D399'} />
            <Text style={[styles.featureText, { color: colors.text }]}>{f}</Text>
          </View>
        ))}
      </View>

      {/* Plan cards */}
      <Text style={[styles.plansTitle, { color: colors.text }]}>Choose your plan</Text>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: SPACING.xl }} />
      ) : packages.length > 0 ? (
        packages.map((pkg) => {
          const isActive = selected?.identifier === pkg.identifier;
          const { badge, note, isOneTime } = packageLabel(pkg);
          const monthly = perMonth(pkg);
          return (
            <TouchableOpacity
              key={pkg.identifier}
              activeOpacity={0.85}
              onPress={() => setSelected(pkg)}
              style={[
                styles.planCard,
                { backgroundColor: colors.surface, borderColor: isActive ? COLORS.primary : colors.border },
                isActive && styles.planCardActive,
              ]}
            >
              {badge && (
                <View style={[
                  styles.planBadge,
                  { backgroundColor: isOneTime ? '#8B5CF6' : COLORS.primary },
                ]}>
                  <Text style={styles.planBadgeText}>{badge}</Text>
                </View>
              )}
              <View style={styles.planLeft}>
                <Text style={[styles.planName, { color: colors.text }]}>{pkg.product.title || pkg.identifier}</Text>
                <Text style={[styles.planNote, { color: colors.textSecondary }]}>{note}</Text>
                {monthly && (
                  <Text style={[styles.planMonthly, { color: COLORS.primary }]}>{monthly}</Text>
                )}
              </View>
              <View style={styles.planRight}>
                <Text style={[styles.planPrice, { color: isActive ? COLORS.primary : colors.text }]}>
                  {pkg.product.priceString}
                </Text>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} style={{ marginTop: 4 }} />
                )}
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
        // Static fallback for QA before RC products are live
        STATIC_PLANS.map((plan) => (
          <View
            key={plan.key}
            style={[styles.planCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {plan.badge && (
              <View style={[styles.planBadge, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.planBadgeText}>{plan.badge}</Text>
              </View>
            )}
            <View style={styles.planLeft}>
              <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
              <Text style={[styles.planNote, { color: colors.textSecondary }]}>{plan.note}</Text>
            </View>
            <Text style={[styles.planPrice, { color: colors.text }]}>{plan.price}</Text>
          </View>
        ))
      )}

      {/* Subscribe CTA */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={doSubscribe}
        disabled={busy || (!selected && packages.length > 0)}
        style={{ marginTop: SPACING.lg }}
      >
        <LinearGradient
          colors={['#21C7FF', '#1B8CFF']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.ctaBtn, (busy || (!selected && packages.length > 0)) && { opacity: 0.6 }]}
        >
          {busy
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.ctaBtnText}>
                {selected?.packageType === 'LIFETIME' ? 'Buy Lifetime Access' : 'Start Subscription'}
              </Text>
          }
        </LinearGradient>
      </TouchableOpacity>

      {/* Restore */}
      <TouchableOpacity
        style={[styles.restoreBtn, busy && { opacity: 0.6 }]}
        onPress={doRestore}
        disabled={busy}
      >
        <Text style={[styles.restoreBtnText, { color: colors.textSecondary }]}>
          Restore previous purchase
        </Text>
      </TouchableOpacity>

      <Text style={[styles.legal, { color: colors.textSecondary }]}>
        Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date.
        Manage or cancel in your device's subscription settings.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { paddingBottom: 60 },

  hero: {
    paddingTop: 60, paddingBottom: 36, paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  heroIconRow: { marginBottom: SPACING.md },
  heroIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTag: {
    color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '800',
    letterSpacing: 1.5, marginBottom: 8,
  },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center' },
  heroSub:   { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.md, textAlign: 'center', marginTop: 8, lineHeight: 22 },

  featuresCard: {
    margin: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg, borderWidth: 1,
  },
  featuresTitle: { fontSize: FONT_SIZE.md, fontWeight: '800', marginBottom: SPACING.md },
  featureRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  featureText:   { fontSize: FONT_SIZE.sm, fontWeight: '500', flex: 1 },

  plansTitle: {
    fontSize: FONT_SIZE.md, fontWeight: '800',
    marginHorizontal: SPACING.lg, marginBottom: SPACING.sm,
  },

  planCard: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 2,
    padding: SPACING.lg, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    position: 'relative', overflow: 'hidden',
  },
  planCardActive: {
    shadowColor: COLORS.primary, shadowOpacity: 0.2,
    shadowRadius: 10, elevation: 4,
  },
  planBadge: {
    position: 'absolute', top: 0, right: 0,
    paddingHorizontal: 10, paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  planBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  planLeft:      { flex: 1 },
  planRight:     { alignItems: 'flex-end' },
  planName:      { fontSize: FONT_SIZE.md, fontWeight: '800' },
  planNote:      { fontSize: FONT_SIZE.sm, marginTop: 2 },
  planMonthly:   { fontSize: 11, fontWeight: '700', marginTop: 4 },
  planPrice:     { fontSize: FONT_SIZE.xl, fontWeight: '900' },

  ctaBtn: {
    marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.round,
    paddingVertical: 18, alignItems: 'center',
  },
  ctaBtnText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '900', letterSpacing: 0.3 },

  restoreBtn:     { alignItems: 'center', marginTop: SPACING.lg, paddingVertical: SPACING.sm },
  restoreBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },

  legal: {
    fontSize: 10, textAlign: 'center', lineHeight: 16,
    marginHorizontal: SPACING.xl, marginTop: SPACING.lg,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useTheme } from '../../store/ThemeContext';
import { useUser } from '../../store/UserContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import { useLanguage } from '../../store/LanguageContext';
import i18n from '../../i18n';

export default function PaywallScreen() {
  const { colors } = useTheme();
  const { activateSubscription, isSubscribed } = useUser();
  const [packages, setPackages]     = useState<PurchasesPackage[]>([]);
  const [selected, setSelected]     = useState<PurchasesPackage | null>(null);
  const [loading, setLoading]       = useState(true);
  const [busy, setBusy]             = useState(false);
  useLanguage();

  useEffect(() => {
    Purchases.getOfferings()
      .then((offerings) => {
        const pkgs = offerings.current?.availablePackages ?? [];
        setPackages(pkgs);
        // Default select the annual package if available, otherwise first
        const annual = pkgs.find((p) => p.packageType === 'ANNUAL') ?? pkgs[0] ?? null;
        setSelected(annual);
      })
      .catch(() => {
        // RC not configured yet — show placeholder UI
      })
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
      if (!e?.userCancelled) {
        Alert.alert('Purchase failed', e?.message ?? 'Please try again.');
      }
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: COLORS.primary }]}>
        <Text style={styles.heroTag}>{i18n.t(isSubscribed ? 'paywall.subscribed' : 'paywall.trialEnded')}</Text>
        <Text style={styles.heroTitle}>{i18n.t('paywall.title')}</Text>
        <Text style={styles.heroBody}>{i18n.t('paywall.freeTrial')}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('ui.complete')}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{i18n.t('paywall.freeTrial')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: SPACING.xl }} />
      ) : packages.length > 0 ? (
        packages.map((pkg) => {
          const isActive = selected?.identifier === pkg.identifier;
          return (
            <TouchableOpacity
              key={pkg.identifier}
              activeOpacity={0.85}
              onPress={() => setSelected(pkg)}
              style={[
                styles.planCard,
                { backgroundColor: colors.surface, borderColor: isActive ? COLORS.primary : colors.border },
              ]}
            >
              <View>
                <Text style={[styles.planName, { color: colors.text }]}>{pkg.product.title}</Text>
                <Text style={[styles.planNote, { color: colors.textSecondary }]}>{pkg.product.description}</Text>
              </View>
              <Text style={[styles.planPrice, { color: COLORS.primary }]}>
                {pkg.product.priceString}
              </Text>
            </TouchableOpacity>
          );
        })
      ) : (
        // Fallback when RC not configured — show static prices for QA/demo
        [
          { key: 'monthly', name: i18n.t('paywall.monthly'), note: i18n.t('paywall.monthlyNote'), price: '£7.99' },
          { key: 'yearly',  name: i18n.t('paywall.yearly'),  note: i18n.t('paywall.yearlyNote'),  price: '£39.99' },
        ].map((plan) => (
          <View
            key={plan.key}
            style={[styles.planCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View>
              <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
              <Text style={[styles.planNote, { color: colors.textSecondary }]}>{plan.note}</Text>
            </View>
            <Text style={[styles.planPrice, { color: COLORS.primary }]}>{plan.price}</Text>
          </View>
        ))
      )}

      <TouchableOpacity
        style={[styles.primaryBtn, (busy || (!selected && packages.length > 0)) && { opacity: 0.6 }]}
        onPress={doSubscribe}
        disabled={busy || (!selected && packages.length > 0)}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryBtnText}>{i18n.t('paywall.subscribe')}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.surface }, busy && { opacity: 0.6 }]}
        onPress={doRestore}
        disabled={busy}
      >
        <Text style={[styles.secondaryBtnText, { color: colors.text }]}>{i18n.t('paywall.restore')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingTop: 56, paddingBottom: 100 },
  hero: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg },
  heroTag: { color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1, fontSize: FONT_SIZE.sm },
  heroTitle: { color: '#fff', fontSize: FONT_SIZE.xxl, fontWeight: '800', marginTop: SPACING.sm },
  heroBody: { color: 'rgba(255,255,255,0.9)', marginTop: SPACING.sm, lineHeight: 22 },
  card: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.xs },
  body: { fontSize: FONT_SIZE.md, lineHeight: 22 },
  planCard: {
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 2,
  },
  planName:  { fontSize: FONT_SIZE.md, fontWeight: '700' },
  planNote:  { marginTop: 4, fontSize: FONT_SIZE.sm },
  planPrice: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  primaryBtn: { marginTop: SPACING.md, borderRadius: BORDER_RADIUS.round, backgroundColor: COLORS.primary, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  secondaryBtn: { marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.round, borderWidth: 1, paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { fontWeight: '700' },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../store/ThemeContext';
import { useUser } from '../../store/UserContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';
import { useLanguage } from '../../store/LanguageContext';
import i18n from '../../i18n';

type PlanKey = 'monthly' | 'yearly';

const PLANS: { key: PlanKey; nameKey: string; price: string; noteKey: string }[] = [
  { key: 'monthly', nameKey: 'paywall.monthly', price: '£7.99',  noteKey: 'paywall.monthlyNote' },
  { key: 'yearly',  nameKey: 'paywall.yearly',  price: '£39.99', noteKey: 'paywall.yearlyNote'  },
];

export default function PaywallScreen() {
  const { colors } = useTheme();
  const { activateSubscription, isSubscribed } = useUser();
  const [selected, setSelected] = useState<PlanKey>('yearly');
  const [busy, setBusy]         = useState(false);
  useLanguage();

  const doSubscribe = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Stub — will be replaced by RevenueCat purchase flow once the
      // client provides RC keys. For now, unlock the app locally so QA
      // and the client can test the gate.
      await activateSubscription();
      Alert.alert(i18n.t('paywall.successTitle'), i18n.t('paywall.successBody'));
    } finally {
      setBusy(false);
    }
  };

  const doRestore = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Stub — will call RevenueCat.restorePurchases(). For the local build
      // we re-activate the subscription flag so returning users regain access.
      await activateSubscription();
      Alert.alert(i18n.t('paywall.restoredTitle'), i18n.t('paywall.restoredBody'));
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

      {PLANS.map((plan) => {
        const isActive = selected === plan.key;
        return (
          <TouchableOpacity
            key={plan.key}
            activeOpacity={0.85}
            onPress={() => setSelected(plan.key)}
            style={[
              styles.planCard,
              { backgroundColor: colors.surface, borderColor: isActive ? COLORS.primary : colors.border },
            ]}
          >
            <View>
              <Text style={[styles.planName, { color: colors.text }]}>{i18n.t(plan.nameKey)}</Text>
              <Text style={[styles.planNote, { color: colors.textSecondary }]}>{i18n.t(plan.noteKey)}</Text>
            </View>
            <Text style={[styles.planPrice, { color: COLORS.primary }]}>{plan.price}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={[styles.primaryBtn, busy && { opacity: 0.6 }]} onPress={doSubscribe} disabled={busy}>
        <Text style={styles.primaryBtnText}>{i18n.t('paywall.subscribe')}</Text>
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
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
  },
  planName: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  planNote: { marginTop: 4, fontSize: FONT_SIZE.sm },
  planPrice: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  primaryBtn: { marginTop: SPACING.md, borderRadius: BORDER_RADIUS.round, backgroundColor: COLORS.primary, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  secondaryBtn: { marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.round, borderWidth: 1, paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { fontWeight: '700' },
});

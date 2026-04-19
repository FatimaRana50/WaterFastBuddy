import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../store/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../constants/theme';

const PLANS = [
  { name: 'Monthly', price: '£7.99', note: 'Best for trying it out' },
  { name: 'Yearly', price: '£39.99', note: 'Best value' },
];

export default function PaywallScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: COLORS.primary }]}> 
        <Text style={styles.heroTag}>Trial ended</Text>
        <Text style={styles.heroTitle}>Unlock WaterFastBuddy Pro</Text>
        <Text style={styles.heroBody}>This is the placeholder paywall screen. RevenueCat / App Store billing can be wired here later.</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Included in trial</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>Full access for the first 3 days after install.</Text>
      </View>

      {PLANS.map((plan) => (
        <View key={plan.name} style={[styles.planCard, { backgroundColor: colors.surface }]}> 
          <View>
            <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
            <Text style={[styles.planNote, { color: colors.textSecondary }]}>{plan.note}</Text>
          </View>
          <Text style={[styles.planPrice, { color: COLORS.primary }]}>{plan.price}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>Start Subscription</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
        <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Restore Purchases</Text>
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
  planCard: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  planNote: { marginTop: 4, fontSize: FONT_SIZE.sm },
  planPrice: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  primaryBtn: { marginTop: SPACING.md, borderRadius: BORDER_RADIUS.round, backgroundColor: COLORS.primary, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  secondaryBtn: { marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.round, borderWidth: 1, paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { fontWeight: '700' },
});

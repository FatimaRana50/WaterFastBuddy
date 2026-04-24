// Booking landing + cal.com WebView.
//
// Mirrors the website's Booking page:
//   - kicker + display headline
//   - three session cards (Intro, Standard, Bundle) with "Most popular" badge
//   - coach testimonial row
//   - HeroCTA that opens the cal.com booking calendar inside a WebView
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Linking, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../store/LanguageContext';
import Kicker from '../../components/Kicker';
import HeroCTA from '../../components/HeroCTA';
import i18n from '../../i18n';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../../constants/theme';

const BOOKING_URL = 'https://bookings.waterfastbuddy.com';

// Session plans mirroring the website's pricing tiles.
type Session = {
  key: string;
  duration: string;
  name: string;
  price: string;
  bullets: string[];
  popular?: boolean;
};

const SESSIONS: Session[] = [
  {
    key: 'intro',
    duration: '30 MIN',
    name: 'Intro call',
    price: 'Free',
    bullets: ['Meet your coach', 'Share your current goals', 'Get a sense of fit'],
  },
  {
    key: 'standard',
    duration: '60 MIN',
    name: 'Standard session',
    price: '£79',
    bullets: ['Full protocol review', 'Personalised adjustments', 'Written follow-up notes'],
    popular: true,
  },
  {
    key: 'bundle',
    duration: '3 × 60 MIN',
    name: '3-session bundle',
    price: '£199',
    bullets: ['Priority scheduling', 'Between-session messaging', 'Progress tracking summary'],
  },
];

const COACHES = [
  { key: 'rachel', initial: 'R', name: 'Rachel T.', role: '3-session bundle' },
  { key: 'marcus', initial: 'M', name: 'Marcus W.', role: 'Standard session' },
  { key: 'anya',   initial: 'A', name: 'Anya K.',  role: 'Standard session' },
];

export default function BookingScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  useLanguage();
  const [showCalendar, setShowCalendar] = useState(false);

  const openExternal = () => Linking.openURL(BOOKING_URL).catch(() => {});

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Back button */}
      <SafeAreaView>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>{i18n.t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Kicker>1-on-1 Coaching</Kicker>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Book a 1-on-1{'\n'}
            <Text style={{ color: COLORS.primary }}>fasting session.</Text>
          </Text>
          <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
            Personalised guidance from certified fasting coaches. Plan your protocol,
            troubleshoot symptoms, and hit your goals.
          </Text>

          <View style={styles.chipRow}>
            {['30 or 60 min video sessions', 'Custom fasting protocol', 'Follow-up notes'].map((chip) => (
              <View key={chip} style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.chipText, { color: colors.text }]}>{chip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing */}
        <View style={{ alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.sm }}>
          <Kicker>Pricing</Kicker>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Simple, transparent sessions</Text>
        <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
          No subscriptions. Book only when you need support.
        </Text>

        {SESSIONS.map((s) => (
          <SessionCard key={s.key} session={s} onBook={() => setShowCalendar(true)} />
        ))}

        {/* Coaches */}
        <View style={{ marginTop: SPACING.xl, marginBottom: SPACING.sm }}>
          <Kicker>Recent clients</Kicker>
        </View>
        <View style={styles.coachRow}>
          {COACHES.map((c) => (
            <View key={c.key} style={[styles.coachCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.coachAvatar, { backgroundColor: COLORS.primary + '20' }]}>
                <Text style={[styles.coachInitial, { color: COLORS.primary }]}>{c.initial}</Text>
              </View>
              <Text style={[styles.coachName, { color: colors.text }]}>{c.name}</Text>
              <Text style={[styles.coachRole, { color: colors.textSecondary }]}>{c.role}</Text>
            </View>
          ))}
        </View>

        {/* Closing CTA */}
        <View style={{ marginTop: SPACING.xl }}>
          <HeroCTA
            kicker="Ready to get started?"
            title="Book a free intro call"
            body="No commitment. Takes less than two minutes to schedule."
            ctaLabel="Open booking calendar"
            ctaIcon="calendar"
            onPress={() => setShowCalendar(true)}
          />
        </View>

        <TouchableOpacity onPress={openExternal} style={{ alignSelf: 'center', marginTop: SPACING.md, padding: SPACING.sm }}>
          <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Open in browser ↗</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Calendar modal */}
      <Modal visible={showCalendar} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCalendar(false)}>
        <SafeAreaView style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Booking</Text>
            <TouchableOpacity onPress={openExternal} style={styles.modalCloseBtn}>
              <Ionicons name="open-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <WebView source={{ uri: BOOKING_URL }} style={{ flex: 1, backgroundColor: colors.background }} />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────
function SessionCard({ session, onBook }: { session: Session; onBook: () => void }) {
  const { colors } = useTheme();
  const highlight = session.popular;

  if (highlight) {
    return (
      <LinearGradient
        colors={[COLORS.primaryDeep, COLORS.primaryDark, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sessionCard}
      >
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Most popular</Text>
        </View>
        <Text style={[styles.sessionDuration, { color: 'rgba(255,255,255,0.72)' }]}>{session.duration}</Text>
        <Text style={[styles.sessionName, { color: '#fff' }]}>{session.name}</Text>
        <Text style={[styles.sessionPrice, { color: '#fff' }]}>{session.price}</Text>
        <View style={{ height: SPACING.md }} />
        {session.bullets.map((b) => (
          <View key={b} style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={[styles.bulletText, { color: 'rgba(255,255,255,0.92)' }]}>{b}</Text>
          </View>
        ))}
        <TouchableOpacity style={[styles.sessionBtn, { backgroundColor: '#fff' }]} onPress={onBook} activeOpacity={0.85}>
          <Ionicons name="calendar" size={16} color={COLORS.primaryDark} style={{ marginRight: 8 }} />
          <Text style={[styles.sessionBtnText, { color: COLORS.primaryDark }]}>Book this session</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.sessionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
      <Text style={[styles.sessionDuration, { color: COLORS.primary }]}>{session.duration}</Text>
      <Text style={[styles.sessionName, { color: colors.text }]}>{session.name}</Text>
      <Text style={[styles.sessionPrice, { color: colors.text }]}>{session.price}</Text>
      <View style={{ height: SPACING.md }} />
      {session.bullets.map((b) => (
        <View key={b} style={styles.bulletRow}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{b}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.sessionBtn, { backgroundColor: COLORS.primary }]}
        onPress={onBook}
        activeOpacity={0.85}
      >
        <Ionicons name="calendar" size={16} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.sessionBtnText, { color: '#fff' }]}>Book this session</Text>
      </TouchableOpacity>
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

  heroCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    shadowColor: '#0B5DD1',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroTitle: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '900',
    lineHeight: 40,
    marginTop: SPACING.sm,
  },
  heroBody: {
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
    marginTop: SPACING.md,
  },
  chipRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    marginTop: SPACING.md,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BORDER_RADIUS.round, borderWidth: 1,
    paddingVertical: 6, paddingHorizontal: 10,
  },
  chipText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },

  sectionTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  sessionCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#0B5DD1',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.sm,
  },
  popularBadgeText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '800' },
  sessionDuration: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sessionName: { fontSize: FONT_SIZE.xl, fontWeight: '900', marginTop: 4 },
  sessionPrice: { fontSize: FONT_SIZE.hero, fontWeight: '900', marginTop: 4 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  bulletText: { fontSize: FONT_SIZE.sm, flex: 1 },
  sessionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.lg,
  },
  sessionBtnText: { fontSize: FONT_SIZE.md, fontWeight: '800' },

  coachRow: { flexDirection: 'row', gap: SPACING.sm },
  coachCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  coachAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  coachInitial: { fontSize: FONT_SIZE.md, fontWeight: '900' },
  coachName: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  coachRole: { fontSize: FONT_SIZE.xs, marginTop: 2 },

  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  modalCloseBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
});
